import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sie-secret-key-change-in-prod';

router.use(authenticate);
router.use(authorizeAdmin);

// --- USERS ---
router.get('/users', async (req, res) => {
  try {
    const result = await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users', async (req, res) => {
  const { name, email, role } = req.body;
  // Hash padrão para novos usuários criados pelo admin
  const defaultHash = '$2a$10$X7X...'; // Hash de '123456'
  try {
    const result = await query(
      'INSERT INTO users (name, email, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, role, defaultHash]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  try {
    const result = await query(
      'UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING *',
      [name, email, role, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
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

// --- PLANS (NOVO) ---
router.get('/plans', async (req, res) => {
  try {
    const result = await query('SELECT * FROM plans ORDER BY price ASC');
    res.json(result.rows);
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