import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Importação das Rotas
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import clientRoutes from './routes/client.js';
import monitoringRoutes from './routes/monitoring.js';

// Importação de Serviços
import { startScheduler } from './services/scheduler.js';
import { initDatabase } from './config/initDb.js';

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de CORS
app.use(cors()); 
app.use(express.json());

// --- SECURITY: SIMPLE RATE LIMITER ---
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_IP = 100; // Limite geral

app.use((req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, startTime: now });
        return next();
    }

    const userData = requestCounts.get(ip);
    
    if (now - userData.startTime > RATE_LIMIT_WINDOW) {
        // Reset janela
        userData.count = 1;
        userData.startTime = now;
        return next();
    }

    if (userData.count >= MAX_REQUESTS_PER_IP) {
        return res.status(429).json({ message: "Muitas requisições. Tente novamente em um minuto." });
    }

    userData.count++;
    next();
});

// --- ROTAS DA API ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/monitoring', monitoringRoutes);

// --- SERVIR FRONTEND (PRODUÇÃO) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
    console.log(`📦 Modo Produção: Servindo arquivos de ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: 'Endpoint não encontrado' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    // console.warn('⚠️  Pasta "dist" não encontrada. Execute "npm run build" para gerar o frontend.');
    app.get('/', (req, res) => {
        res.send('Backend rodando! Para ver o frontend, execute "npm run build".');
    });
}

// Inicia o Servidor
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Servidor S.I.E. PRO rodando na porta ${PORT}`);
  
  // 1. Inicializa DB (Tabelas + Admin User)
  await initDatabase();

  // 2. Inicia Cron Jobs
  startScheduler();
});