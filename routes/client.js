import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { searchCityAdmin } from '../services/aiSearchService.js';
import { runMonitoringCycle } from '../services/collectorService.js';
import { logRequest } from '../services/logService.js';

const router = express.Router();
router.use(authenticate);

// --- DASHBOARD DATA ---

router.get('/subscription', async (req, res) => {
    try {
        // Returns 200 OK with null if no subscription found, instead of 404/500
        const result = await query('SELECT * FROM subscriptions WHERE user_id = $1', [req.user.id]);
        res.json(result.rows[0] || null);
    } catch (err) {
        console.error("Error in /client/subscription:", err);
        // Fallback safely to prevent 500 error on dashboard
        res.status(200).json(null);
    }
});

router.get('/items', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM master_items WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error in /client/items:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/usage', async (req, res) => {
    try {
        const usageRes = await query(
            `SELECT 
                COUNT(*) as total_requests,
                SUM(request_tokens + response_tokens) as total_tokens,
                SUM(cost_usd) as total_cost
             FROM requests_log 
             WHERE user_id = $1`,
            [req.user.id]
        );

        const subRes = await query(`
            SELECT p.token_limit 
            FROM subscriptions s
            JOIN plans p ON s.plan_id = p.id
            WHERE s.user_id = $1
        `, [req.user.id]);
        
        const limit = subRes.rows[0]?.token_limit ? parseInt(subRes.rows[0].token_limit) : 5000;

        res.json({
            total_requests: parseInt(usageRes.rows[0].total_requests) || 0,
            total_tokens: parseInt(usageRes.rows[0].total_tokens) || 0,
            estimated_cost: parseFloat(usageRes.rows[0].total_cost) || 0,
            plan_limit: limit
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/financials', async (req, res) => {
    try {
        const result = await query(
            `SELECT p.*, s.plan_id 
             FROM payments p
             JOIN subscriptions s ON p.subscription_id = s.id
             WHERE s.user_id = $1
             ORDER BY p.payment_date DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PROFILE & CONFIG ---

router.get('/profile', async (req, res) => {
    try {
        const result = await query(
            'SELECT id, name, email, role, phone, avatar, status FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/profile', async (req, res) => {
    const { name, email, phone, avatar, new_password } = req.body;
    const userId = req.user.id;

    try {
        let sql = 'UPDATE users SET name = $1, email = $2, phone = $3';
        const params = [name, email, phone];
        let idx = 4;

        if (avatar !== undefined) {
            sql += `, avatar = $${idx++}`;
            params.push(avatar);
        }

        if (new_password) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(new_password, salt);
            sql += `, password_hash = $${idx++}`;
            params.push(hash);
        }

        sql += ` WHERE id = $${idx} RETURNING id, name, email, role, phone, avatar`;
        params.push(userId);

        const result = await query(sql, params);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
});

router.get('/config', async (req, res) => {
  try {
    const result = await query('SELECT * FROM monitoring_configs WHERE user_id = $1', [req.user.id]);
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/config', async (req, res) => {
  const { keywords, urls_to_track, frequency, is_active } = req.body;
  const userId = req.user.id;
  
  try {
    const result = await query(
      `INSERT INTO monitoring_configs (user_id, keywords, urls_to_track, frequency, is_active)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) 
       DO UPDATE SET keywords = $2, urls_to_track = $3, frequency = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, JSON.stringify(keywords), JSON.stringify(urls_to_track), frequency, is_active]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/config/check-url', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: "URL obrigatória" });

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); 
        
        const response = await fetch(url, { 
            method: 'HEAD', 
            signal: controller.signal,
            headers: { 'User-Agent': 'SIE-Pro-Bot/1.0' }
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
            res.json({ status: 'ok', code: response.status });
        } else {
            res.status(400).json({ status: 'error', code: response.status });
        }
    } catch (err) {
        res.status(400).json({ status: 'error', message: 'URL inacessível ou timeout.' });
    }
});

router.post('/monitoring/run', async (req, res) => {
    try {
        const processedCount = await runMonitoringCycle(req.user.id);
        res.json({ message: "Varredura iniciada.", count: processedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao executar varredura." });
    }
});

router.post('/tools/public-admin-search', async (req, res) => {
    const { city } = req.body;
    if (!city) return res.status(400).json({ message: "Nome da cidade é obrigatório." });

    try {
        const { data, cost, tokens } = await searchCityAdmin(city);
        await logRequest({
            userId: req.user.id,
            endpoint: 'TOOL_ADMIN_SEARCH',
            tokensIn: tokens.in,
            tokensOut: tokens.out,
            cost: cost,
            status: 'SUCCESS'
        });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao processar consulta." });
    }
});

export default router;