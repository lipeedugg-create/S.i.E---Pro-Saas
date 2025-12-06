import express from 'express';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { searchCityAdmin } from '../services/aiSearchService.js';
import { runMonitoringCycle } from '../services/collectorService.js';
import { logRequest } from '../services/logService.js';

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
        res.json({ message: "Varredura iniciada com sucesso.", count: processedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao executar varredura manual." });
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
    res.status(500).json({ error: err.message });
  }
});

// --- PLUGIN TOOLS ROUTES ---

router.post('/tools/public-admin-search', async (req, res) => {
    const { city } = req.body;

    if (!city) return res.status(400).json({ message: "Nome da cidade é obrigatório." });

    try {
        const { data, cost, tokens } = await searchCityAdmin(city);

        // Uso do Log Centralizado
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
        res.status(500).json({ message: "Erro ao processar consulta governamental." });
    }
});

export default router;