import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, JWT_SECRET } from '../config/db.js'; 
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET /api/auth/plans (Public) - MUST BE AT THE TOP
router.get('/plans', async (req, res) => {
    try {
        // Fallback safety: return empty array if table doesn't exist or query fails
        const result = await query('SELECT * FROM plans ORDER BY price ASC');
        res.json(result.rows);
    } catch (err) {
        console.error("Database error fetching plans (returning empty list):", err.message);
        // Return 200 OK with empty array to prevent frontend crash ("Erro ao carregar planos")
        res.json([]); 
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const user = result.rows[0];

    if (user.status === 'inactive' || user.status === 'suspended') {
        return res.status(403).json({ message: 'Conta desativada ou suspensa.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Update last_login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        last_login: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error(`Login error: ${error.message}`);
    res.status(500).json({ message: `Erro interno: ${error.message}` });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, phone, planId } = req.body;

    try {
        // 1. Check if user exists
        const check = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) {
            return res.status(400).json({ message: 'Email já cadastrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        await query('BEGIN');

        const userRes = await query(
            `INSERT INTO users (name, email, password_hash, role, status, phone, last_login) 
             VALUES ($1, $2, $3, 'client', 'active', $4, CURRENT_TIMESTAMP) 
             RETURNING id, name, email, role`,
            [name, email, hash, phone]
        );
        const newUser = userRes.rows[0];

        await query(
            `INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date)
             VALUES ($1, $2, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')
             RETURNING id`,
            [newUser.id, planId || 'starter']
        );

        if (planId && planId !== 'starter') {
             const planRes = await query('SELECT price FROM plans WHERE id = $1', [planId]);
             const amount = planRes.rows[0]?.price || 0;
             const subRes = await query('SELECT id FROM subscriptions WHERE user_id = $1', [newUser.id]);
             
             await query(
                `INSERT INTO payments (subscription_id, amount, payment_date, reference_id, notes)
                 VALUES ($1, $2, CURRENT_DATE, $3, 'Pagamento Inicial')`,
                [subRes.rows[0].id, amount, `INIT-${Date.now()}`]
             );
        }

        await query('COMMIT');

        const token = jwt.sign(
            { id: newUser.id, role: newUser.role, name: newUser.name },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            user: { ...newUser, last_login: new Date().toISOString() }
        });

    } catch (err) {
        await query('ROLLBACK');
        console.error("Register Error:", err);
        res.status(500).json({ message: "Erro ao criar conta: " + err.message });
    }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
    try {
        const result = await query('SELECT id, name, email, role, status FROM users WHERE id = $1', [req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = result.rows[0];
        if (user.status !== 'active') return res.status(403).json({ message: 'User inactive' });

        res.json({
             id: user.id,
             name: user.name,
             email: user.email,
             role: user.role
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

export default router;