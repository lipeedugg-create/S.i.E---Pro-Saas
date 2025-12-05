import express from 'express';
import { runMonitoringCycle } from '../services/collectorService.js';

const router = express.Router();
const CRON_KEY = process.env.CRON_KEY || 'SECRET_CRON_KEY';

// POST /api/monitoring/trigger
// Chamado por um serviço externo (ex: EasyCron, GitHub Actions) ou manualmente pelo Admin
router.post('/trigger', async (req, res) => {
  const key = req.headers['x-cron-key'];

  if (key !== CRON_KEY) {
    return res.status(403).json({ message: 'Acesso Negado: Chave CRON inválida' });
  }

  try {
    // Executa em background (sem await) se for muito longo, ou await se quiser esperar resposta
    await runMonitoringCycle();
    res.json({ message: 'Ciclo de monitoramento finalizado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
