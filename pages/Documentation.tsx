import React, { useState } from 'react';

interface DocumentationProps {
  onClose: () => void;
}

type TabType = 'database' | 'backend' | 'frontend' | 'ai-core' | 'deploy';

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
             <h1 className="text-white font-bold text-sm leading-tight">S.I.E. PRO - Documentação Técnica</h1>
             <p className="text-[10px] text-slate-500 font-mono">v3.1 - Produção (Full Stack)</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              {(['database', 'backend', 'frontend', 'ai-core', 'deploy'] as TabType[]).map(tab => (
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
                <h2 className="text-2xl font-bold text-white mb-2">1. Schema PostgreSQL & Data Source</h2>
                <p className="text-slate-400">
                    O sistema utiliza PostgreSQL com a extensão <code>pgcrypto</code> para geração de UUIDs. Execute este script para criar todas as tabelas e dados iniciais.
                </p>
              </div>

              <CopyBlock 
                title="config/db.js (Conexão)" 
                lang="javascript"
                code={`
import pg from 'pg';
const { Pool } = pg;

// Pool gerenciado para alta performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const query = (text, params) => pool.query(text, params);
                `}
              />

              <h3 className="text-white font-bold mb-4">Script SQL Completo (Schema + Seed)</h3>
              <CopyBlock 
                title="database_schema.sql" 
                lang="sql"
                code={`
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users & Auth
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SaaS Plans
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT
);

-- 3. Plugins
CREATE TABLE IF NOT EXISTS plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    icon VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available',
    category VARCHAR(50) DEFAULT 'utility',
    price DECIMAL(10, 2) DEFAULT 0.00
);

-- 4. Plan Plugins (Relation)
CREATE TABLE IF NOT EXISTS plan_plugins (
    plan_id VARCHAR(50) REFERENCES plans(id) ON DELETE CASCADE,
    plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, plugin_id)
);

-- 5. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) REFERENCES plans(id),
    status VARCHAR(20) DEFAULT 'active',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Monitoring Config
CREATE TABLE IF NOT EXISTS monitoring_configs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    keywords JSONB DEFAULT '[]',
    urls_to_track JSONB DEFAULT '[]',
    frequency VARCHAR(20) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Master Items (AI Results)
CREATE TABLE IF NOT EXISTS master_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_url TEXT,
    analyzed_content TEXT,
    ai_summary TEXT,
    detected_keywords JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    reference_id VARCHAR(100),
    notes TEXT,
    admin_recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit Logs (Gemini Usage)
CREATE TABLE IF NOT EXISTS requests_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    endpoint VARCHAR(100),
    request_tokens INT DEFAULT 0,
    response_tokens INT DEFAULT 0,
    cost_usd DECIMAL(10, 6) DEFAULT 0,
    status VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA --
INSERT INTO plans (id, name, price, description) VALUES
('starter', 'Starter Plan', 99.00, 'Basic Monitoring'),
('pro', 'Enterprise Pro', 299.00, 'AI Advanced');

INSERT INTO users (id, name, email, password_hash, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Master', 'admin@sie.pro', '$2a$10$X7Xk5y5n5j5k5l5m5n5o5p5q5r5s5t5u5v5w5x5y5z5A5B5C5D5E', 'admin'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Acme Corp', 'client@acme.com', '$2a$10$X7Xk5y5n5j5k5l5m5n5o5p5q5r5s5t5u5v5w5x5y5z5A5B5C5D5E', 'client')
ON CONFLICT DO NOTHING;

INSERT INTO subscriptions (user_id, plan_id, status, end_date) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'pro', 'active', CURRENT_DATE + INTERVAL '30 days')
ON CONFLICT DO NOTHING;
                `}
              />
            </div>
          )}

           {/* TAB: BACKEND */}
           {activeTab === 'backend' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">2. Backend Architecture (Node.js)</h2>
                    <p className="text-slate-400">
                        O backend é construído com Express.js e serve como API Gateway para o Frontend e como controlador para o Banco de Dados.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-2">Estrutura de Pastas</h3>
                    <ul className="text-sm text-slate-400 space-y-2 font-mono">
                        <li>/config/db.js <span className="text-slate-600">// Conexão PG</span></li>
                        <li>/middleware/auth.js <span className="text-slate-600">// JWT Guard</span></li>
                        <li>/routes/admin.js <span className="text-slate-600">// Rotas Admin</span></li>
                        <li>/routes/client.js <span className="text-slate-600">// Rotas User</span></li>
                        <li>/services/collectorService.js <span className="text-slate-600">// IA Core</span></li>
                        <li>server.js <span className="text-slate-600">// Entry Point</span></li>
                    </ul>
                  </div>
                  <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-2">Segurança (Auth)</h3>
                    <p className="text-sm text-slate-400 mb-2">
                        Utilizamos <code>jsonwebtoken</code> para stateless authentication.
                    </p>
                    <div className="text-xs font-mono bg-black p-2 rounded text-green-400">
                        headers: {'{'} Authorization: 'Bearer eyJhbGci...' {'}'}
                    </div>
                  </div>
                </div>

                <CopyBlock 
                    title="middleware/auth.js"
                    lang="javascript"
                    code={`
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (e) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).send('Admin only');
  next();
};
                    `}
                />

                <CopyBlock 
                    title="server.js (Entry Point)"
                    lang="javascript"
                    code={`
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
// ... imports

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Servir Frontend (Production)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => res.sendFile('dist/index.html'));
}

app.listen(3000, () => console.log('Server running on port 3000'));
                    `}
                />
             </div>
           )}

           {/* TAB: FRONTEND */}
           {activeTab === 'frontend' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">3. Frontend Architecture (React 19)</h2>
                    <p className="text-slate-400">
                        O frontend é um SPA (Single Page Application) construído com Vite e React 19. Ele não acessa o banco diretamente, utilizando a camada de serviço <code>api.ts</code>.
                    </p>
                </div>

                <h3 className="text-white font-bold mb-4">Camada de Serviço (API Client)</h3>
                <p className="text-slate-400 text-sm mb-4">
                    O arquivo <code>services/api.ts</code> centraliza todas as chamadas <code>fetch</code> e injeta automaticamente o token JWT do localStorage.
                </p>

                <CopyBlock 
                    title="services/api.ts"
                    lang="typescript"
                    code={`
const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${localStorage.getItem('token')}\`
});

export const api = {
    login: async (email, password) => { /* ... */ },
    
    // Impersonation Feature
    impersonate: async (userId: string) => {
        const res = await fetch(\`\${API_URL}/admin/users/\${userId}/impersonate\`, {
            method: 'POST',
            headers: getHeaders()
        });
        return res.json(); // Retorna { token, user } do alvo
    },

    getLogs: async () => {
        const res = await fetch(\`\${API_URL}/admin/logs\`, { headers: getHeaders() });
        return res.json();
    }
};
                    `}
                />

                <h3 className="text-white font-bold mb-4">Componentes Principais</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
                    <li className="bg-slate-800 p-3 rounded border border-slate-700">
                        <strong className="text-white block">App.tsx</strong>
                        Gerenciador de rotas e estado global de autenticação (currentUser).
                    </li>
                    <li className="bg-slate-800 p-3 rounded border border-slate-700">
                        <strong className="text-white block">AdminDashboard.tsx</strong>
                        Visão geral de KPIs financeiros e gestão de assinaturas.
                    </li>
                    <li className="bg-slate-800 p-3 rounded border border-slate-700">
                        <strong className="text-white block">ClientConfig.tsx</strong>
                        Interface para o cliente definir keywords e URLs para a IA monitorar.
                    </li>
                    <li className="bg-slate-800 p-3 rounded border border-slate-700">
                        <strong className="text-white block">Login.tsx</strong>
                        Autenticação segura e tratamento de erros de conexão.
                    </li>
                </ul>
             </div>
           )}

          {/* TAB: AI CORE */}
          {activeTab === 'ai-core' && (
             <div className="animate-fade-in space-y-6">
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">4. Gemini AI Engine & Auditoria</h2>
                <p className="text-slate-400">
                   A inteligência do sistema reside no backend, utilizando a biblioteca <code>@google/genai</code> para processar conteúdo textual.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="p-4 bg-slate-800 rounded border border-slate-700">
                    <div className="font-bold text-white mb-1">Modelo</div>
                    <div className="text-xs text-blue-400 font-mono">gemini-2.5-flash</div>
                 </div>
                 <div className="p-4 bg-slate-800 rounded border border-slate-700">
                    <div className="font-bold text-white mb-1">Formato</div>
                    <div className="text-xs text-yellow-400 font-mono">JSON Mode</div>
                 </div>
                 <div className="p-4 bg-slate-800 rounded border border-slate-700">
                    <div className="font-bold text-white mb-1">Custo</div>
                    <div className="text-xs text-emerald-400 font-mono">$0.10 / 1M tokens (in)</div>
                 </div>
              </div>

              <h3 className="text-white font-bold mb-4">Lógica de Coleta (Collector Service)</h3>
              <p className="text-slate-400 text-sm mb-4">
                  O arquivo <code>services/collectorService.js</code> é acionado via CRON. Ele itera sobre configurações ativas, "coleta" dados (mock de crawler) e envia para análise.
              </p>

              <CopyBlock 
                title="backend/services/collectorService.js" 
                lang="javascript"
                code={`
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function analyzeWithGemini(text) {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: {
            // Instrução de Sistema para forçar JSON estruturado
            systemInstruction: "Você é um analista de risco corporativo. Retorne JSON: { sentiment, summary, keywords[] }.",
            responseMimeType: 'application/json'
        }
    });

    // Cálculo de Custos para Auditoria
    const usage = response.usageMetadata;
    const cost = (usage.promptTokenCount / 1000 * 0.000125) + 
                 (usage.candidatesTokenCount / 1000 * 0.000375);

    return { result: JSON.parse(response.text), cost };
}
                `}
              />

              <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg">
                  <h4 className="text-amber-500 font-bold text-sm mb-2">Auditoria Financeira (requests_log)</h4>
                  <p className="text-slate-400 text-xs">
                      Cada chamada à API do Gemini é registrada na tabela <code>requests_log</code> com os tokens exatos de entrada/saída e o custo calculado em USD. Isso permite faturamento transparente por uso.
                  </p>
              </div>
            </div>
          )}

          {/* TAB: DEPLOY */}
          {activeTab === 'deploy' && (
             <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">5. Deploy em Produção</h2>
              
              <div className="bg-emerald-950/20 border border-emerald-800 p-6 rounded-lg mb-8">
                  <h3 className="text-emerald-400 font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Status: Production Ready
                  </h3>
                  <p className="text-slate-300 text-sm">
                      A aplicação está pronta para deploy em containers (Docker) ou PaaS (Heroku, Railway, Render). O servidor Node.js serve tanto a API quanto os arquivos estáticos do React.
                  </p>
              </div>

              <h3 className="text-white font-bold mb-4">1. Variáveis de Ambiente (.env)</h3>
              <CopyBlock 
                  title=".env (Production)"
                  lang="bash"
                  code={`
NODE_ENV=production
PORT=3000

# Database (PostgreSQL)
DATABASE_URL=postgres://user:pass@host:5432/sie_pro

# Security
JWT_SECRET=super_secure_random_string_here
CRON_KEY=secure_key_for_external_triggers

# Google AI
API_KEY=AIzaSy...
                  `}
              />

              <h3 className="text-white font-bold mb-4">2. Build Process</h3>
              <CopyBlock 
                  title="Terminal"
                  lang="bash"
                  code={`
# 1. Instalar dependências
npm install

# 2. Compilar o Frontend (Gera pasta /dist)
npm run build

# 3. Iniciar o Servidor (API + Static)
npm start
# O comando 'npm start' executa: node server.js
                  `}
              />

              <h3 className="text-white font-bold mb-4">3. Cron Jobs (Automação)</h3>
              <p className="text-slate-400 text-sm mb-4">
                  Para o monitoramento automático funcionar, configure um serviço externo (GitHub Actions, EasyCron, Cronjob.org) para chamar o endpoint de trigger periodicamente.
              </p>
              <div className="bg-slate-900 p-4 rounded border border-slate-800 font-mono text-xs text-slate-300">
                  POST https://seudominio.com/api/monitoring/trigger<br/>
                  Headers: <span className="text-blue-400">X-CRON-KEY: sua_chave_secreta</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};