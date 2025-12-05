import express from 'express';
import { query } from '../config/db.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

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

// --- SUBSCRIPTIONS ---
router.get('/subscriptions', async (req, res) => {
  try {
    const result = await query('SELECT * FROM subscriptions');
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
    const result = await query('SELECT * FROM plugins ORDER BY name');
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

export default router;
