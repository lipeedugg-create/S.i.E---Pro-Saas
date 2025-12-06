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

// Configuração de CORS
// Em produção, se estiver usando Nginx, isso pode ser ajustado, mas '*' funciona para APIs públicas.
app.use(cors()); 
app.use(express.json());

// --- ROTAS DA API ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/monitoring', monitoringRoutes);

// --- SERVIR FRONTEND (PRODUÇÃO) ---
// Define __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para a pasta de build do Vite
const distPath = path.join(__dirname, 'dist');

// Verifica se o build existe
if (fs.existsSync(distPath)) {
    console.log(`📦 Servindo arquivos estáticos de: ${distPath}`);
    
    // Serve os arquivos estáticos (JS, CSS, Imagens)
    app.use(express.static(distPath));
    
    // SPA Fallback: Qualquer rota que NÃO comece com /api retorna o index.html
    // Isso permite que o React Router gerencie a navegação (ex: /admin-dashboard)
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: 'Endpoint da API não encontrado' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.warn('⚠️  Pasta "dist" não encontrada. Execute "npm run build" para gerar o frontend.');
    app.get('/', (req, res) => {
        res.send('Backend API is running. Frontend build not found.');
    });
}

// Inicia o Servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 S.I.E. PRO Server rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Acesso local: http://localhost:${PORT}`);
});