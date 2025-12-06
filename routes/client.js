import express from 'express';
import { query } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { searchCityAdmin } from '../services/aiSearchService.js';
import { runMonitoringCycle } from '../services/collectorService.js'; // Importando serviço real

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
    // Se o banco não tiver last_run_at, ele ignorará se a coluna não existir, mas em prod devemos ter rodado migration.
    // Usamos ON CONFLICT para atualizar.
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

// Endpoint para disparar monitoramento manualmente (Force Run)
router.post('/monitoring/run', async (req, res) => {
    try {
        // Roda o ciclo apenas para o usuário logado
        const processedCount = await runMonitoringCycle(req.user.id);
        res.json({ message: "Varredura iniciada com sucesso.", count: processedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao executar varredura manual." });
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

// --- PLUGIN TOOLS ROUTES ---

// POST /api/client/tools/public-admin-search
router.post('/tools/public-admin-search', async (req, res) => {
    const { city } = req.body;

    if (!city) return res.status(400).json({ message: "Nome da cidade é obrigatório." });

    try {
        // 1. Verificar se o usuário tem o plugin ativado (Opcional, mas recomendado)
        // Por simplificação do prompt "o primeiro plugin sempre ativo", pulamos check complexo de DB.
        
        // 2. Chamar Serviço de IA
        const { data, cost, tokens } = await searchCityAdmin(city);

        // 3. Registrar Log de Custo
        await query(
            `INSERT INTO requests_log (user_id, endpoint, request_tokens, response_tokens, cost_usd, status)
             VALUES ($1, $2, $3, $4, $5, 'SUCCESS')`,
            [req.user.id, 'TOOL_ADMIN_SEARCH', tokens.in, tokens.out, cost]
        );

        res.json(data);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao processar consulta governamental." });
    }
});

export default router;