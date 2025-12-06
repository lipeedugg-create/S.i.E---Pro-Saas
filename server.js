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

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de CORS - Permite tudo para evitar bloqueios simples, ideal ajustar em produção real com domínio fixo
app.use(cors()); 
app.use(express.json());

// --- ROTAS DA API ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/monitoring', monitoringRoutes);

// --- SERVIR FRONTEND (PRODUÇÃO) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

// Se a pasta 'dist' existir (após npm run build), serve o frontend
if (fs.existsSync(distPath)) {
    console.log(`📦 Modo Produção: Servindo arquivos de ${distPath}`);
    
    app.use(express.static(distPath));
    
    // SPA Fallback: Redireciona qualquer rota não-API para o index.html
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: 'Endpoint não encontrado' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.warn('⚠️  Pasta "dist" não encontrada. Execute "npm run build" para gerar o frontend.');
    app.get('/', (req, res) => {
        res.send('Backend rodando! Para ver o frontend, execute "npm run build".');
    });
}

// Inicia o Servidor escutando em todas as interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor S.I.E. PRO rodando na porta ${PORT}`);
});