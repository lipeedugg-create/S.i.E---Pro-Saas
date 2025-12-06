import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sie-secret-key-change-in-prod';

router.use(authenticate);
router.use(authorizeAdmin);

// --- USERS ---
router.get('/users', async (req, res) => {
  try {
    // Tenta selecionar colunas novas, se falhar (schema antigo), fallback
    // Em prod, faríamos migration. Aqui usamos try/catch ou COALESCE se já estiver no SQL init.
    // O init SQL foi atualizado na documentação, mas para garantir compatibilidade com DBs já rodando:
    const result = await query(`
        SELECT id, name, email, role, created_at, 
               status, phone, last_login 
        FROM users 
        ORDER BY created_at DESC
    `).catch(async () => {
         // Fallback se colunas não existirem (apenas para garantir que não crasha se não rodou migration)
         return await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    });
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  const { name, email, role, password, phone, status } = req.body;
  
  try {
    const pwd = password || '123456';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pwd, salt);
    
    // Tenta inserir com novos campos, se falhar, insere básico
    try {
        const result = await query(
          'INSERT INTO users (name, email, role, password_hash, phone, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [name, email, role, hash, phone, status || 'active']
        );
        res.json(result.rows[0]);
    } catch(e) {
        const result = await query(
            'INSERT INTO users (name, email, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, role, hash]
        );
        res.json(result.rows[0]);
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password, phone, status } = req.body;
  
  try {
    let queryText = 'UPDATE users SET name = $1, email = $2, role = $3, phone = $4, status = $5';
    let queryParams = [name, email, role, phone, status];
    let paramIdx = 6;

    if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        queryText += `, password_hash = $${paramIdx++}`;
        queryParams.push(hash);
    }

    queryText += ` WHERE id = $${paramIdx}`;
    queryParams.push(id);
    queryText += ' RETURNING *';

    // Tratamento de erro se colunas não existirem no DB
    try {
        const result = await query(queryText, queryParams);
        res.json(result.rows[0]);
    } catch (e) {
         // Fallback simples
         if (password) {
            await query('UPDATE users SET name=$1, email=$2, role=$3, password_hash=$4 WHERE id=$5', [name,email,role,queryParams[queryParams.length-2], id]);
         } else {
            await query('UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4', [name,email,role, id]);
         }
         res.json({ message: "Update parcial realizado (Schema antigo detectado)" });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/users/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para atribuir/alterar plano
router.post('/users/:id/subscription', async (req, res) => {
    const { id } = req.params;
    const { plan_id } = req.body;

    if (!plan_id) return res.status(400).json({ message: "Plan ID is required" });

    try {
        // Verifica se já existe assinatura
        const existing = await query('SELECT * FROM subscriptions WHERE user_id = $1', [id]);
        
        if (existing.rows.length > 0) {
            // Atualiza
            await query(
                `UPDATE subscriptions 
                 SET plan_id = $1, status = 'active', 
                     end_date = CASE WHEN end_date < CURRENT_DATE THEN CURRENT_DATE + INTERVAL '30 days' ELSE end_date END
                 WHERE user_id = $2`,
                [plan_id, id]
            );
        } else {
            // Cria Nova
            await query(
                `INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date) 
                 VALUES ($1, $2, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')`,
                [id, plan_id]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/users/:id/payments', async (req, res) => {
    const { id } = req.params;
    try {
        // Pega subscription ID
        const subRes = await query('SELECT id FROM subscriptions WHERE user_id = $1', [id]);
        if(subRes.rows.length === 0) return res.json([]);

        const subId = subRes.rows[0].id;
        const payments = await query('SELECT * FROM payments WHERE subscription_id = $1 ORDER BY payment_date DESC', [subId]);
        res.json(payments.rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Impersonate User (Login As)
router.post('/users/:id/impersonate', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const user = result.rows[0];

    // Generate Token for this user
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUBSCRIPTIONS ---
router.get('/subscriptions', async (req, res) => {
  try {
    const result = await query('SELECT * FROM subscriptions');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/subscriptions/:id/date', async (req, res) => {
    const { id } = req.params;
    const { end_date } = req.body;
    try {
        await query('UPDATE subscriptions SET end_date = $1 WHERE id = $2', [end_date, id]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PLANS ---
router.get('/plans', async (req, res) => {
  try {
    const result = await query('SELECT * FROM plans ORDER BY price ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/plans', async (req, res) => {
    const { id, name, price, description } = req.body;
    try {
        const result = await query(
            'INSERT INTO plans (id, name, price, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, name, price, description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/plans/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;
    try {
        const result = await query(
            'UPDATE plans SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING *',
            [name, price, description, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/plans/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Verifica dependências antes de deletar
        const subCheck = await query('SELECT * FROM subscriptions WHERE plan_id = $1 LIMIT 1', [id]);
        if (subCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Não é possível excluir: Existem assinaturas ativas neste plano.' });
        }

        await query('DELETE FROM plans WHERE id = $1', [id]);
        res.json({ message: 'Plano removido com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PAYMENTS ---
router.get('/payments', async (req, res) => {
  try {
    const result = await query('SELECT * FROM payments ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/payments', async (req, res) => {
  const { subscription_id, amount, payment_date, reference_id, notes, admin_recorded_by } = req.body;
  
  try {
    await query('BEGIN'); // Inicia Transação

    // 1. Registra Pagamento
    const payResult = await query(
      `INSERT INTO payments (subscription_id, amount, payment_date, reference_id, notes, admin_recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [subscription_id, amount, payment_date, reference_id, notes, admin_recorded_by]
    );

    // 2. Renova Assinatura (+30 dias)
    // Lógica: Se já venceu, conta a partir de hoje. Se não, soma ao final.
    await query(
      `UPDATE subscriptions 
       SET status = 'active',
           end_date = CASE 
             WHEN end_date < CURRENT_DATE THEN CURRENT_DATE + INTERVAL '30 days'
             ELSE end_date + INTERVAL '30 days'
           END
       WHERE id = $1`,
      [subscription_id]
    );

    await query('COMMIT'); // Confirma
    res.json(payResult.rows[0]);

  } catch (err) {
    await query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// --- LOGS ---
router.get('/logs', async (req, res) => {
  try {
    const result = await query('SELECT * FROM requests_log ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PLUGINS ---
router.get('/plugins', async (req, res) => {
  try {
    // Join para trazer o array de planos permitidos para cada plugin
    const queryText = `
        SELECT p.*, 
               COALESCE(json_agg(pp.plan_id) FILTER (WHERE pp.plan_id IS NOT NULL), '[]') as allowed_plans
        FROM plugins p
        LEFT JOIN plan_plugins pp ON p.id = pp.plugin_id
        GROUP BY p.id
        ORDER BY p.name
    `;
    const result = await query(queryText);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/plugins/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM plugins WHERE id = $1', [id]);
        res.json({ message: 'Plugin removido com sucesso' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.patch('/plugins/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await query('UPDATE plugins SET status = $1 WHERE id = $2', [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// NEW: Endpoint para atualizar configuração do plugin (Prompt)
router.patch('/plugins/:id/config', async (req, res) => {
    const { id } = req.params;
    const { config } = req.body;
    try {
        await query('UPDATE plugins SET config = $1 WHERE id = $2', [JSON.stringify(config), id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/plugins/:id/toggle-plan', async (req, res) => {
    const { id } = req.params;
    const { plan_id } = req.body;
    
    try {
        const check = await query('SELECT * FROM plan_plugins WHERE plan_id = $1 AND plugin_id = $2', [plan_id, id]);
        if (check.rows.length > 0) {
            await query('DELETE FROM plan_plugins WHERE plan_id = $1 AND plugin_id = $2', [plan_id, id]);
        } else {
            await query('INSERT INTO plan_plugins (plan_id, plugin_id) VALUES ($1, $2)', [plan_id, id]);
        }
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;