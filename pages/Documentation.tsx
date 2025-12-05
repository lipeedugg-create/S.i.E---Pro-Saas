import React, { useState } from 'react';

interface DocumentationProps {
  onClose: () => void;
}

type TabType = 'database' | 'backend' | 'frontend' | 'deploy';

export const Documentation: React.FC<DocumentationProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('database');

  const CopyBlock = ({ title, code, lang = 'bash', warning = false }: { title: string, code: string, lang?: string, warning?: boolean }) => (
    <div className={`mb-8 rounded-lg overflow-hidden border shadow-xl ${warning ? 'border-red-800' : 'border-slate-700'}`}>
      <div className={`px-4 py-2 flex justify-between items-center border-b ${warning ? 'bg-red-950/50 border-red-800' : 'bg-slate-950 border-slate-800'}`}>
        <span className={`text-xs font-bold uppercase tracking-wider ${warning ? 'text-red-400' : 'text-slate-400'}`}>{title}</span>
        <span className="text-xs text-slate-600 font-mono">{lang}</span>
      </div>
      <div className="bg-[#0d1117] p-4 overflow-x-auto relative group">
        <button 
            onClick={() => navigator.clipboard.writeText(code)}
            className="absolute top-2 right-2 bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
            Copiar
        </button>
        <pre className="font-mono text-sm leading-relaxed text-slate-300">
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] text-slate-300 overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="h-16 bg-slate-950 border-b border-slate-800 flex justify-between items-center px-6 shadow-md shrink-0">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center font-bold text-white text-xs">DOC</div>
           <div>
             <h1 className="text-white font-bold text-sm leading-tight">S.I.E. PRO - Guia de Produção</h1>
             <p className="text-[10px] text-slate-500 font-mono">Migração v2.0 -> v3.0 (SQL & Node.js)</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              {(['database', 'backend', 'frontend', 'deploy'] as TabType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                    activeTab === tab 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
           </div>
           <button 
             onClick={onClose}
             className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/30 px-4 py-2 rounded text-xs font-bold transition-colors"
           >
             FECHAR
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 bg-[#0b1120]">
        <div className="max-w-6xl mx-auto">
          
          {/* TAB: DATABASE */}
          {activeTab === 'database' && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">1. Banco de Dados (PostgreSQL)</h2>
                <p className="text-slate-400">
                    O primeiro passo para sair do ambiente de simulação é provisionar o banco de dados. 
                    Copie o script SQL abaixo e execute no seu servidor PostgreSQL.
                </p>
              </div>

              <CopyBlock 
                title="schema.sql (Estrutura Completa)" 
                lang="sql"
                code={`
-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABELAS CORE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Bcrypt
    role VARCHAR(50) DEFAULT 'client', -- 'admin', 'client'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired'
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SISTEMA DE PLUGINS & MARKETPLACE
CREATE TABLE plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20),
    icon VARCHAR(50), -- Emoji ou URL
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'installed', 'active'
    category VARCHAR(50),
    price DECIMAL(10, 2) DEFAULT 0
);

-- Tabela Pivô: Define quais planos têm acesso a quais plugins
CREATE TABLE plan_plugins (
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, plugin_id)
);

-- 3. MONITORAMENTO & IA
CREATE TABLE monitoring_configs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    keywords JSONB DEFAULT '[]', -- Array de strings
    urls_to_track JSONB DEFAULT '[]', -- Array de strings
    frequency VARCHAR(20) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE master_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_url TEXT,
    analyzed_content TEXT,
    ai_summary TEXT,
    detected_keywords JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. AUDITORIA FINANCEIRA & LOGS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    reference_id VARCHAR(100),
    admin_recorded_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requests_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    endpoint VARCHAR(255),
    request_tokens INT DEFAULT 0,
    response_tokens INT DEFAULT 0,
    cost_usd DECIMAL(10, 8) DEFAULT 0,
    status VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. DADOS INICIAIS (SEEDS)
INSERT INTO plans (name, price) VALUES 
('Enterprise Básico', 99.00),
('Enterprise Pro', 299.00);

-- Plugins Padrão
INSERT INTO plugins (name, description, category, price, status, icon) VALUES
('Gemini 2.5 Flash AI', 'Motor de análise de sentimento e sumarização.', 'analytics', 0, 'active', '🧠'),
('Alertas Tempo Real', 'Notificações via Email/SMS.', 'utility', 19.90, 'active', '🚨'),
('API Gateway', 'Acesso programático aos dados.', 'integration', 49.90, 'installed', '🔌');
                `}
              />
            </div>
          )}

          {/* TAB: BACKEND */}
          {activeTab === 'backend' && (
             <div className="animate-fade-in space-y-6">
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">2. Backend API (Node.js)</h2>
                <p className="text-slate-400">
                    O servidor Express conecta o banco PostgreSQL, processa a autenticação JWT e gerencia o Google Gemini.
                </p>
              </div>

              <CopyBlock 
                title="package.json" 
                code={`
{
  "name": "sie-pro-backend",
  "version": "2.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "@google/genai": "^0.1.0" 
  }
}
                `}
              />

              <CopyBlock 
                title="server.js (Estrutura Básica)" 
                lang="javascript"
                code={`
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

// Middleware de Autenticação (Exemplo)
const authenticate = (req, res, next) => {
    // Implementar verificação JWT aqui
    next();
};

// Rotas (Exemplos)
app.get('/api/admin/users', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/monitoring/trigger', async (req, res) => {
    const cronKey = req.headers['x-cron-key'];
    if (cronKey !== process.env.CRON_KEY) return res.sendStatus(403);
    
    // Aqui chama a lógica do services/collectorService.js
    // ...
    res.json({ message: 'Ciclo iniciado' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
                `}
              />
            </div>
          )}

          {/* TAB: FRONTEND */}
          {activeTab === 'frontend' && (
            <div className="animate-fade-in space-y-6">
               <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-xl mb-6">
                 <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                    <span>⚠️</span> Procedimento de Refatoração
                 </h3>
                 <p className="text-sm text-red-200 leading-relaxed">
                    A aplicação atual usa <code>services/db.ts</code> que retorna dados síncronos (mock). 
                    Para usar o banco real, você deve mudar para <code>services/api.ts</code> (que usa <code>fetch</code> e é assíncrono).
                    Isso exige atualizar os componentes React.
                 </p>
              </div>

              <h3 className="text-white font-bold mb-4">Passo 1: Arquivo da API</h3>
              <p className="text-slate-400 mb-4 text-sm">
                  O arquivo <code>services/api.ts</code> já foi criado no projeto. Ele contém toda a lógica de comunicação com o Backend.
              </p>

              <h3 className="text-white font-bold mb-4">Passo 2: Exemplo de Refatoração de Componente</h3>
              <p className="text-slate-400 mb-4 text-sm">
                  Veja como alterar o <code>AdminDashboard.tsx</code> para suportar dados assíncronos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CopyBlock 
                    title="ANTES (Mock Síncrono)" 
                    lang="typescript"
                    warning={true}
                    code={`
import { db } from '../../services/db';

const AdminDashboard = () => {
  // Dados carregam instantaneamente
  const [users, setUsers] = useState(db.getUsers());
  
  const refresh = () => {
     setUsers(db.getUsers()); // Síncrono
  };
  
  // ...
};
                    `}
                  />
                  <CopyBlock 
                    title="DEPOIS (API Assíncrona)" 
                    lang="typescript"
                    code={`
// Importar API em vez de DB
import { api } from '../../services/api'; 

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
     try {
       setLoading(true);
       const data = await api.getUsers(); // Await
       setUsers(data);
     } catch (err) {
       console.error(err);
     } finally {
       setLoading(false);
     }
  };

  useEffect(() => {
     refresh();
  }, []);
  
  if (loading) return <div>Carregando...</div>;
  // ...
};
                    `}
                  />
              </div>
            </div>
          )}

          {/* TAB: DEPLOY */}
          {activeTab === 'deploy' && (
             <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold text-white mb-2">Instalação em VPS (Ubuntu 22.04)</h2>
              <p className="text-slate-400 mb-6">Comandos para configurar o ambiente de produção do zero.</p>

              <div className="space-y-6">
                <div>
                    <h3 className="text-emerald-400 font-bold mb-2">1. Dependências do Sistema</h3>
                    <CopyBlock 
                    title="Terminal"
                    code={`
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Instalar Process Manager e Servidor Web
sudo npm install -g pm2
sudo apt install -y nginx
                    `}
                    />
                </div>

                <div>
                    <h3 className="text-emerald-400 font-bold mb-2">2. Variáveis de Ambiente (.env)</h3>
                    <p className="text-slate-400 text-sm mb-2">Crie o arquivo <code>.env</code> na raiz do projeto Backend.</p>
                    <CopyBlock 
                    title=".env"
                    code={`
PORT=3000
DATABASE_URL=postgres://usuario:senha@localhost:5432/sie_pro_db
JWT_SECRET=sua_chave_super_secreta_jwt_hash
API_KEY=sua_chave_google_gemini_aqui
CRON_KEY=chave_secreta_para_disparar_monitoramento
NODE_ENV=production
                    `}
                    />
                </div>

                <div>
                    <h3 className="text-emerald-400 font-bold mb-2">3. Build do Frontend</h3>
                    <CopyBlock 
                    title="Terminal (Pasta Client)"
                    code={`
# Na pasta do frontend
npm install
npm run build

# Mover a pasta 'dist' para dentro do backend ou configurar Nginx
# Opção Simples (Backend servindo estáticos):
mv dist ../server/public
                    `}
                    />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};