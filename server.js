import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Rotas
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import clientRoutes from './routes/client.js';
import monitoringRoutes from './routes/monitoring.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Em produção, configure a origin: 'https://seu-dominio.com'
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Servir Frontend em Produção (Build)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

// Verifica se a pasta dist existe antes de servir
if (fs.existsSync(distPath)) {
    console.log('Serving static files from:', distPath);
    app.use(express.static(distPath));
    
    // SPA Fallback: Qualquer rota não-API retorna index.html
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: 'API endpoint not found' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.log('Dist folder not found. Running in API-only mode or waiting for build.');
    app.get('/', (req, res) => {
        res.send('API Server Running. Frontend build (dist) not found.');
    });
}

app.listen(PORT, () => {
  console.log(`🚀 S.I.E. PRO Server rodando na porta ${PORT}`);
  console.log(`📡 Modo: ${process.env.NODE_ENV || 'development'}`);
});