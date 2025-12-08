import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, JWT_SECRET } from '../config/db.js'; // Importação Centralizada
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeAdmin);

// --- USERS ---
router.get('/users', async (req, res) => {
  try {
    const result = await query(`
        SELECT id, name, email, role, created_at, 
               status, phone, last_login 
        FROM users 
        ORDER BY created_at DESC
    `);
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
    
    const result = await query(
        'INSERT INTO users (name, email, role, password_hash, phone, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, email, role, hash, phone, status || 'active']
    );
    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password, phone, status } = req.body;
  
  try {
    // Construção Dinâmica de Query Segura
    const updates = [];
    const values = [];
    let idx = 1;

    // Campos Obrigatórios/Padrão
    updates.push(`name = $${idx++}`); values.push(name);
    updates.push(`email = $${idx++}`); values.push(email);
    updates.push(`role = $${idx++}`); values.push(role);
    updates.push(`phone = $${idx++}`); values.push(phone);
    updates.push(`status = $${idx++}`); values.push(status);

    // Senha Opcional
    if (password && password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        updates.push(`password_hash = $${idx++}`);
        values.push(hash);
    }

    // ID sempre é o último parâmetro
    values.push(id);

    const queryText = `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`;
    
    const result = await query(queryText, values);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.json(result.rows[0]);

  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ error: "Erro ao atualizar usuário: " + err.message });
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

router.post('/users/:id/subscription', async (req, res) => {
    const { id } = req.params;
    const { plan_id } = req.body;

    if (!plan_id) return res.status(400).json({ message: "Plan ID is required" });

    try {
        // Verifica se já existe assinatura
        const existing = await query('SELECT * FROM subscriptions WHERE user_id = $1', [id]);
        
        if (existing.rows.length > 0) {
            // Atualiza existente: Ativa status e garante data futura
            await query(
                `UPDATE subscriptions 
                 SET plan_id = $1, 
                     status = 'active', 
                     end_date = GREATEST(end_date, CURRENT_DATE + INTERVAL '30 days')
                 WHERE user_id = $2`,
                [plan_id, id]
            );
        } else {
            // Cria nova
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
        // Busca payments via subscription ID associado ao user
        const result = await query(`
            SELECT p.* 
            FROM payments p
            JOIN subscriptions s ON p.subscription_id = s.id
            WHERE s.user_id = $1
            ORDER BY p.payment_date DESC
        `, [id]);
        
        res.json(result.rows);
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

    // Gera token temporário
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
    const { id, name, price, description, token_limit } = req.body;
    try {
        const result = await query(
            'INSERT INTO plans (id, name, price, description, token_limit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, name, price, description, token_limit || 10000]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/plans/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description, token_limit } = req.body;
    try {
        const result = await query(
            'UPDATE plans SET name = $1, price = $2, description = $3, token_limit = $4 WHERE id = $5 RETURNING *',
            [name, price, description, token_limit, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/plans/:id', async (req, res) => {
    const { id } = req.params;
    try {
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
    await query('BEGIN'); 

    const payResult = await query(
      `INSERT INTO payments (subscription_id, amount, payment_date, reference_id, notes, admin_recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [subscription_id, amount, payment_date, reference_id, notes, admin_recorded_by]
    );

    // Auto-renovação: Adiciona 30 dias à data atual ou à data de vencimento se futura
    await query(
      `UPDATE subscriptions 
       SET status = 'active',
           end_date = GREATEST(end_date, CURRENT_DATE) + INTERVAL '30 days'
       WHERE id = $1`,
      [subscription_id]
    );

    await query('COMMIT');
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