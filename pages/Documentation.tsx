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
             <p className="text-[10px] text-slate-500 font-mono">v3.3 - Refactor User Management & Impersonation</p>
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
                <h2 className="text-2xl font-bold text-white mb-2">1. Schema PostgreSQL Completo (v3.0)</h2>
                <p className="text-slate-400">
                    O sistema utiliza PostgreSQL com a extensão <code>pgcrypto</code> para geração de UUIDs. Execute este script para criar todas as tabelas e popular os dados iniciais de Planos e Plugins.
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

              <h3 className="text-white font-bold mb-4">Script SQL de Inicialização</h3>
              <p className="text-sm text-slate-400 mb-4">Copie e execute o conteúdo abaixo no seu cliente SQL (pgAdmin, DBeaver ou psql) para restaurar a estrutura completa.</p>
              <CopyBlock 
                title="database_complete.sql" 
                lang="sql"
                code={`
-- Habilitar extensão para UUIDs
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

-- 2. SaaS Plans (Planos)
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY, -- ex: 'starter', 'pro'
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT
);

-- 3. Plugins (Marketplace)
CREATE TABLE IF NOT EXISTS plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    icon VARCHAR(50), -- Emoji ou URL
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'installed', 'active'
    category VARCHAR(50) DEFAULT 'utility',
    price DECIMAL(10, 2) DEFAULT 0.00
);

-- 4. Plan Plugins Relation (Quais planos acessam quais plugins)
CREATE TABLE IF NOT EXISTS plan_plugins (
    plan_id VARCHAR(50) REFERENCES plans(id) ON DELETE CASCADE,
    plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, plugin_id)
);

-- 5. Subscriptions (Assinaturas)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) REFERENCES plans(id),
    status VARCHAR(20) DEFAULT 'active',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Monitoring Config (Configurações do Cliente)
CREATE TABLE IF NOT EXISTS monitoring_configs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    keywords JSONB DEFAULT '[]',
    urls_to_track JSONB DEFAULT '[]',
    frequency VARCHAR(20) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Master Items (Resultados da IA)
CREATE TABLE IF NOT EXISTS master_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_url TEXT,
    analyzed_content TEXT,
    ai_summary TEXT,
    detected_keywords JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Payments (Financeiro)
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

-- 9. Audit Logs (Consumo Gemini API)
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

-- SEED DATA (Dados Iniciais) --

-- Inserir Planos Padrão
INSERT INTO plans (id, name, price, description) VALUES
('starter', 'Starter Plan', 99.00, 'Monitoramento básico para pequenas operações.'),
('pro', 'Enterprise Pro', 299.00, 'IA Avançada, Tempo Real e Suporte Prioritário.')
ON CONFLICT (id) DO NOTHING;

-- Inserir Plugin de Raio-X Administrativo
-- Usamos um UUID fixo para garantir idempotência no seed, mas em prod seria aleatório
INSERT INTO plugins (id, name, description, version, icon, status, category, price) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Raio-X Administrativo', 'Consulta automatizada de estrutura governamental (Prefeito, Câmara, Secretariado).', '1.0.0', '🏛️', 'active', 'utility', 0.00)
ON CONFLICT (id) DO NOTHING;

-- Vincular Plugin ao Plano Pro
INSERT INTO plan_plugins (plan_id, plugin_id) VALUES
('pro', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99')
ON CONFLICT DO NOTHING;

-- Inserir Usuários (Senha padrão: 123456 -> Hash Bcrypt)
INSERT INTO users (id, name, email, password_hash, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Master', 'admin@sie.pro', '$2a$10$X7Xk5y5n5j5k5l5m5n5o5p5q5r5s5t5u5v5w5x5y5z5A5B5C5D5E', 'admin'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Acme Corp', 'client@acme.com', '$2a$10$X7Xk5y5n5j5k5l5m5n5o5p5q5r5s5t5u5v5w5x5y5z5A5B5C5D5E', 'client')
ON CONFLICT (id) DO NOTHING;

-- Inserir Assinatura para o Cliente
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
                        <li>/services/collectorService.js <span className="text-slate-600">// IA Core (Crawler)</span></li>
                        <li>/services/aiSearchService.js <span className="text-emerald-400">// IA Search (Plugin)</span></li>
                        <li>server.js <span className="text-slate-600">// Entry Point</span></li>
                    </ul>
                  </div>
                  <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-2">Segurança (Auth)</h3>
                    <p className="text-sm text-slate-400 mb-2">
                        Utilizamos <code>jsonwebtoken</code> para stateless authentication. O middleware <code>auth.js</code> intercepta todas as requisições protegidas.
                    </p>
                    <div className="text-xs font-mono bg-black p-2 rounded text-green-400 border border-slate-700">
                        Header Authorization: Bearer eyJhbGciOiJIUzI1Ni...
                    </div>
                  </div>
                </div>

                <h3 className="text-white font-bold mb-4">Rotas Administrativas Principais</h3>
                <div className="bg-slate-800 p-4 rounded border border-slate-700 overflow-x-auto mb-6">
                  <table className="w-full text-left text-xs text-slate-400 font-mono">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-500">
                        <th className="pb-2">Método</th>
                        <th className="pb-2">Endpoint</th>
                        <th className="pb-2">Descrição</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr><td className="py-2 text-blue-400">GET</td><td>/api/admin/users</td><td>Lista usuários e status de assinatura</td></tr>
                      <tr><td className="py-2 text-green-400">POST</td><td>/api/admin/users</td><td>Cria novo usuário (com hash de senha)</td></tr>
                      <tr><td className="py-2 text-yellow-400">PUT</td><td>/api/admin/users/:id</td><td>Edita nome, email, role ou senha</td></tr>
                      <tr><td className="py-2 text-purple-400">POST</td><td>/api/admin/users/:id/impersonate</td><td><strong>Login Como Usuário</strong> (Gera token scoped)</td></tr>
                      <tr><td className="py-2 text-red-400">DELETE</td><td>/api/admin/plugins/:id</td><td>Remove um plugin do catálogo</td></tr>
                      <tr><td className="py-2 text-yellow-400">PATCH</td><td>/api/admin/plugins/:id/status</td><td>Ativa/Desativa funcionalidades</td></tr>
                    </tbody>
                  </table>
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
app.use('/api/client', clientRoutes);

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
                        O frontend é um SPA (Single Page Application) construído com Vite e React 19. Ele se comunica com o backend via API REST, sem acesso direto ao banco de dados.
                    </p>
                </div>

                <h3 className="text-white font-bold mb-4">Service Layer & API (Refatorado)</h3>
                <p className="text-slate-400 text-sm mb-4">
                    O arquivo <code>services/api.ts</code> foi reescrito para eliminar dados mockados. Todas as interações agora passam pelo backend Node.js.
                </p>

                <CopyBlock 
                    title="services/api.ts"
                    lang="typescript"
                    code={`
const API_URL = '/api'; // Caminho relativo para funcionar com proxy e prod

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${localStorage.getItem('token')}\`
});

export const api = {
    // Auth & Impersonation
    login: async (email, password) => { /* ... */ },
    impersonate: async (userId: string) => {
        const res = await fetch(\`\${API_URL}/admin/users/\${userId}/impersonate\`, {
            method: 'POST',
            headers: getHeaders()
        });
        return res.json(); // Retorna { token, user } do alvo
    },

    // User Management (Novo)
    upsertUser: async (user) => {
        // Decide entre POST (Create) e PUT (Update) baseado no ID
        const method = user.id ? 'PUT' : 'POST';
        // ...
    },
    
    // Plugin Management (Novo)
    deletePlugin: async (id) => {
        await fetch(\`\${API_URL}/admin/plugins/\${id}\`, { method: 'DELETE', ... });
    }
};
                    `}
                />

                <h3 className="text-white font-bold mb-4">Gestão de Usuários & Impersonation</h3>
                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-sm">
                        <h4 className="text-blue-400 font-bold text-base mb-2 flex items-center gap-2">
                           🔐 Funcionalidade: Login como Usuário (Impersonation)
                        </h4>
                        <p className="text-sm text-slate-300 mb-3">
                            Permite que administradores acessem o painel de qualquer cliente sem saber a senha (bypassing auth), ideal para suporte e debugging.
                        </p>
                        <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1 font-mono bg-slate-900/50 p-3 rounded border border-slate-800">
                            <li>Admin clica em "Login ➜" na lista de usuários (AdminUsers).</li>
                            <li>Componente chama <code>api.impersonate(id)</code>.</li>
                            <li>Backend valida Admin e gera novo JWT assinado com ID do alvo.</li>
                            <li>Frontend substitui o token no <code>localStorage</code> e recarrega a aplicação via <code>onLogin</code>.</li>
                        </ol>
                    </div>

                    <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 shadow-sm">
                        <h4 className="text-emerald-400 font-bold text-base mb-2">
                           👥 CRUD de Usuários (AdminUsers & UserModal)
                        </h4>
                        <p className="text-sm text-slate-300 mb-2">
                           Interface completa para administração de contas, separada em:
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                           <li><strong>AdminUsers.tsx:</strong> Tabela com filtros, listagem e botões de ação (Editar, Impersonate).</li>
                           <li><strong>UserModal.tsx:</strong> Formulário inteligente que detecta criação vs edição. Gerencia hash de senha enviando apenas se preenchido.</li>
                           <li><strong>Feedback Visual:</strong> Indicadores de assinatura ativa/expirada e role (Admin/Client).</li>
                        </ul>
                    </div>
                </div>

                <h3 className="text-white font-bold mb-4">Novos Componentes e Plugins</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
                    <li className="bg-slate-800 p-3 rounded border border-slate-700">
                        <strong className="text-white block mb-1">PublicAdminSearch.tsx (Plugin)</strong>
                        Interface "Raio-X Administrativo". Utiliza cards e tabelas para exibir dados políticos estruturados (Prefeito, Câmara, Secretariado).
                    </li>
                    <li className="bg-slate-800 p-3 rounded border border-slate-700">
                        <strong className="text-white block mb-1">AdminPlugins.tsx</strong>
                        Marketplace para instalar e ativar plugins. Agora suporta exclusão física do plugin via `DELETE`.
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

              <h3 className="text-white font-bold mb-4">Novo: Agente de Pesquisa Governamental</h3>
              <p className="text-slate-400 text-sm mb-4">
                  O módulo de transparência (Raio-X) utiliza um serviço dedicado (<code>services/aiSearchService.js</code>) com prompt engineering específico para garantir a integridade do JSON retornado.
              </p>

              <CopyBlock 
                title="Prompt Structure (aiSearchService.js)" 
                lang="javascript"
                code={`
const prompt = \`
    Você é o SISTEMA SIE.
    Gere um relatório de transparência pública sobre a cidade de: \${city}.
    
    FORMATO JSON OBRIGATÓRIO:
    {
        "city": "...",
        "mayor": { "name": "...", "role": "Prefeito", "party": "...", "past_roles": [] },
        "councilors": [...],
        "key_servants": [{ "name": "...", "department": "...", "estimated_salary": "..." }]
    }
\`;

// Configuração Gemini
const config = {
    responseMimeType: 'application/json',
    temperature: 0.2 // Baixa criatividade para garantir fatos
};
                `}
              />

              <div className="bg-amber-900/20 border border-amber-900/50 p-4 rounded-lg">
                  <h4 className="text-amber-500 font-bold text-sm mb-2">Auditoria Financeira (requests_log)</h4>
                  <p className="text-slate-400 text-xs">
                      Cada chamada à API do Gemini (seja Monitoramento ou Pesquisa Pública) é registrada na tabela <code>requests_log</code> com os tokens exatos de entrada/saída e o custo calculado em USD.
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
# Use a string de conexão completa fornecida pelo seu provedor (Supabase, Neon, AWS RDS)
DATABASE_URL=postgres://user:pass@host:5432/sie_pro

# Security
JWT_SECRET=super_secure_random_string_here
CRON_KEY=secure_key_for_external_triggers

# Google AI
API_KEY=AIzaSy...
                  `}
              />

              <h3 className="text-white font-bold mb-4">2. Build & Start Process</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 p-4 rounded border border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Comandos de Build</p>
                    <pre className="font-mono text-sm text-green-400">npm install</pre>
                    <pre className="font-mono text-sm text-green-400">npm run build</pre>
                </div>
                <div className="bg-slate-800 p-4 rounded border border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Comando de Start</p>
                    <pre className="font-mono text-sm text-blue-400">npm start</pre>
                </div>
              </div>

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