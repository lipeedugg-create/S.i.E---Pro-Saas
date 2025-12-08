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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração de CORS
app.use(cors()); 
app.use(express.json());

// --- SECURITY: SIMPLE RATE LIMITER ---
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_IP = 300; // Aumentado para suportar plugins carregando assets

app.use((req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, startTime: now });
        return next();
    }

    const userData = requestCounts.get(ip);
    
    if (now - userData.startTime > RATE_LIMIT_WINDOW) {
        userData.count = 1;
        userData.startTime = now;
        return next();
    }

    if (userData.count >= MAX_REQUESTS_PER_IP) {
        // Ignora rate limit para arquivos estáticos de plugins
        if (!req.url.startsWith('/plugins')) {
             return res.status(429).json({ message: "Muitas requisições. Tente novamente em um minuto." });
        }
    }

    userData.count++;
    next();
});

// --- SERVIR PLUGINS (Micro-Frontends) ---
// Garante que a pasta existe
const pluginsPath = path.join(__dirname, 'plugins');
if (!fs.existsSync(pluginsPath)) {
    fs.mkdirSync(pluginsPath, { recursive: true });
}
// Serve os arquivos estáticos dos plugins (HTML, JS, CSS)
app.use('/plugins', express.static(pluginsPath));

// --- ROTAS DA API ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/monitoring', monitoringRoutes);

// --- SERVIR FRONTEND PRINCIPAL (PRODUÇÃO) ---
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
    console.log(`📦 Modo Produção: Servindo arquivos de ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/plugins')) {
            return res.status(404).json({ message: 'Recurso não encontrado' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
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