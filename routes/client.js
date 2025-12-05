import express from 'express';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// Configuração de Monitoramento
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
    // Upsert (Insert or Update)
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

// Itens Monitorados (Resultados)
router.get('/items', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM master_items WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
