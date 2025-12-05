import React, { useState } from 'react';

interface DocumentationProps {
  onClose: () => void;
}

type TabType = 'database' | 'backend' | 'frontend' | 'ai-core' | 'deploy';

export const Documentation: React.FC<DocumentationProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('deploy');

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
             <p className="text-[10px] text-slate-500 font-mono">v3.1 - Produção (Live)</p>
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
                <h2 className="text-2xl font-bold text-white mb-2">1. Schema PostgreSQL & Seed Data</h2>
                <p className="text-slate-400">
                    Estrutura relacional normalizada com 9 tabelas. O script abaixo inclui a criação das tabelas e a inserção de dados iniciais.
                </p>
              </div>

              <CopyBlock 
                title="schema_and_seed.sql" 
                lang="sql"
                code={`
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- ESTRUTURA (DDL)
-- ==========================================

-- 1. Usuários e Autenticação
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Planos de Assinatura
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- 3. Assinaturas
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    status VARCHAR(50) DEFAULT 'active',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Marketplace de Plugins
CREATE TABLE plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20),
    icon VARCHAR(50),
    status VARCHAR(20) DEFAULT 'available',
    category VARCHAR(50),
    price DECIMAL(10, 2) DEFAULT 0
);

-- 5. Vinculação Planos <> Plugins
CREATE TABLE plan_plugins (
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
    plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, plugin_id)
);

-- 6. Configurações de Monitoramento (User)
CREATE TABLE monitoring_configs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    keywords JSONB DEFAULT '[]',
    urls_to_track JSONB DEFAULT '[]',
    frequency VARCHAR(20) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Itens Monitorados (Resultados IA)
CREATE TABLE master_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_url TEXT,
    analyzed_content TEXT,
    ai_summary TEXT,
    detected_keywords JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Pagamentos (Financeiro Manual)
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

-- 9. Logs de Requisição (Auditoria)
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

-- ==========================================
-- SEED DATA (DADOS INICIAIS)
-- ==========================================

-- A. Planos
INSERT INTO plans (id, name, price) VALUES 
('p1', 'Enterprise Starter', 99.00),
('p2', 'Enterprise Pro', 299.00);

-- B. Plugins
INSERT INTO plugins (id, name, description, version, icon, status, category, price) VALUES
('plg_1', 'Gemini 2.5 Flash AI', 'Motor de análise de sentimento e sumarização.', '2.5.0', '🧠', 'active', 'analytics', 0),
('plg_2', 'Alertas Tempo Real', 'Notificações via Email/SMS.', '1.2.0', '🚨', 'active', 'utility', 19.90),
('plg_3', 'API Gateway', 'Acesso via REST API.', '1.0.0', '🔌', 'available', 'integration', 49.90),
('plg_4', 'Dark Web Monitor', 'Monitoramento de vazamentos.', '0.9.5', '🕵️', 'available', 'security', 99.00);

-- C. Vínculos (Plano Pro ganha Gemini e Alertas)
INSERT INTO plan_plugins (plan_id, plugin_id) VALUES
('p2', 'plg_1'),
('p2', 'plg_2');

-- D. Usuários (Senha padrão hash: 123456)
INSERT INTO users (id, name, email, password_hash, role) VALUES
('u1', 'Administrador', 'admin@sie.pro', '$2a$10$X7X...', 'admin'),
('u2', 'Corporação Alpha', 'client@corp.com', '$2a$10$X7X...', 'client'),
('u3', 'Tech Startup Beta', 'tech@start.com', '$2a$10$X7X...', 'client');

-- E. Assinaturas e Configs
INSERT INTO subscriptions (id, user_id, plan_id, status, end_date) VALUES
('s1', 'u2', 'p1', 'active', CURRENT_DATE + INTERVAL '30 days'),
('s2', 'u3', 'p2', 'active', CURRENT_DATE + INTERVAL '30 days');

INSERT INTO monitoring_configs (user_id, keywords, urls_to_track, frequency) VALUES
('u2', '["Concorrente X", "Vendas"]', '["http://news.com"]', 'daily'),
('u3', '["IA", "Funding"]', '["http://techcrunch.com"]', 'hourly');
                `}
              />
            </div>
          )}

           {/* TAB: FRONTEND */}
           {activeTab === 'frontend' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">2. Arquitetura Frontend (Refatorada)</h2>
                    <p className="text-slate-400">
                        O frontend (React 19) foi desacoplado de dados mockados (<code>db.ts</code>) para consumir uma API RESTful completa. A autenticação é gerenciada via JWT no <code>localStorage</code>.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                       <span className="text-blue-500">🛠</span> api.ts (Service Layer)
                    </h3>
                    <p className="text-sm text-slate-400">
                      Singleton pattern que centraliza todas as chamadas HTTP (<code>fetch</code>). Gerencia headers de autorização e tratamento de erros padronizado, substituindo o antigo <code>db.ts</code>.
                    </p>
                  </div>
                  <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                       <span className="text-green-500">👥</span> AdminUsers.tsx (Novo)
                    </h3>
                    <p className="text-sm text-slate-400">
                      Página completa para gestão de usuários. Permite listagem, filtragem por busca, criação de novos usuários e edição de dados existentes via Modal (<code>UserModal.tsx</code>).
                    </p>
                  </div>
                </div>

                <h3 className="text-white font-bold mb-4">Exemplo de Consumo API (api.ts)</h3>
                <CopyBlock 
                    title="services/api.ts"
                    lang="typescript"
                    code={`
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': \`Bearer \${localStorage.getItem('token')}\`
});

export const api = {
  // Autenticação
  login: async (email, password) => { ... },

  // Gestão de Usuários (CRUD) - Novo Feature
  getUsers: async () => fetch(\`\${API_URL}/admin/users\`, { headers: getHeaders() }).then(res => res.json()),
  upsertUser: async (user) => { ... },

  // Financeiro & Auditoria
  getPayments: async () => fetch(\`\${API_URL}/admin/payments\`, ...),
  getLogs: async () => fetch(\`\${API_URL}/admin/logs\`, ...),
  
  // Gatilho do Core (Gemini)
  triggerCollection: async (cronKey) => fetch(\`\${API_URL}/monitoring/trigger\`, {
      method: 'POST',
      headers: { ...getHeaders(), 'X-CRON-KEY': cronKey }
  })
};
                    `}
                />
             </div>
           )}

          {/* TAB: AI CORE */}
          {activeTab === 'ai-core' && (
             <div className="animate-fade-in space-y-6">
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">3. Google Gemini 2.5 Integration</h2>
                <p className="text-slate-400">
                    O core de inteligência utiliza o modelo <code>gemini-2.5-flash</code> para alta performance e baixo custo. A implementação garante respostas estruturadas (JSON) e auditoria de tokens.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                 <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold">1</div>
                    <div>
                        <h4 className="text-white font-bold">System Instructions</h4>
                        <p className="text-sm text-slate-400">Definição precisa de persona: "Analista Sênior de Reputação Corporativa".</p>
                    </div>
                 </div>
                 <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold">2</div>
                    <div>
                        <h4 className="text-white font-bold">Response Schema</h4>
                        <p className="text-sm text-slate-400">Saída forçada em JSON com campos: <code>sentiment</code>, <code>impact</code>, <code>summary</code>, e <code>keywords</code>.</p>
                    </div>
                 </div>
                 <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold">3</div>
                    <div>
                        <h4 className="text-white font-bold">Auditoria Financeira</h4>
                        <p className="text-sm text-slate-400">Calculamos o custo exato baseado em tokens de entrada ($0.125/1k) e saída ($0.375/1k) e registramos no DB.</p>
                    </div>
                 </div>
              </div>

              <CopyBlock 
                title="services/collectorService.js (Backend Logic)" 
                lang="javascript"
                code={`
const { GoogleGenAI } = require("@google/genai");

// Inicialização
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function analyzeWithGemini(text) {
    // Chamada à API com Schema Tipado
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: {
            systemInstruction: "Analise o sentimento e o risco de imagem corporativa.",
            responseMimeType: 'application/json',
            // Schema Opcional para validação rígida
            responseSchema: { ... }
        }
    });

    const usage = response.usageMetadata;
    
    // Cálculo de Custo (Pricing Gemini Flash)
    const cost = (usage.promptTokenCount / 1000 * 0.000125) + 
                 (usage.candidatesTokenCount / 1000 * 0.000375);

    return { 
        result: JSON.parse(response.text), 
        cost_usd: cost, 
        tokens: usage 
    };
}
                `}
              />
            </div>
          )}

          {/* TAB: BACKEND */}
          {activeTab === 'backend' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-2">4. Backend API Structure</h2>
                <p className="text-slate-400 mb-4">Arquitetura modular em Node.js/Express focada em separação de responsabilidades (Rotas, Services, Middleware).</p>
                <CopyBlock 
                    title="Estrutura de Arquivos"
                    lang="text"
                    code={`
/sie-pro-saas
├── .env                  # Segredos (DB_URL, JWT_SECRET, API_KEY, CRON_KEY)
├── server.js             # Entrypoint & Configuração CORS
├── config/db.js          # Pool PostgreSQL (pg)
├── middleware/auth.js    # Proteção de Rotas (verifyToken, isAdmin)
├── routes/
│   ├── auth.js           # Login (Emissão JWT)
│   ├── admin.js          # Rotas Protegidas (Gestão Users, Plugins, Logs)
│   ├── client.js         # Rotas do Cliente (Dashboard, Config)
│   └── monitoring.js     # Gatilho de Coleta (IA Pipeline)
└── services/
    ├── logService.js     # Abstração de Logs de Auditoria
    └── collectorService.js # Lógica de Negócio (Google Gemini Integration)
                    `}
                />
             </div>
          )}

          {/* TAB: DEPLOY */}
          {activeTab === 'deploy' && (
             <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">5. Ambiente Live (Produção)</h2>
              
              <div className="bg-emerald-950/20 border border-emerald-800 p-6 rounded-lg mb-8">
                  <h3 className="text-emerald-400 font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Configuração Atual: sie.jennyai.space
                  </h3>
                  
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900 p-4 rounded border border-slate-700">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Diretório Raiz</p>
                              <code className="text-sm text-slate-300 font-mono">/home/jennyai-sie/htdocs/sie.jennyai.space</code>
                          </div>
                          <div className="bg-slate-900 p-4 rounded border border-slate-700">
                              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Domínio Público</p>
                              <code className="text-sm text-blue-400 font-mono">https://sie.jennyai.space</code>
                          </div>
                      </div>

                      <div>
                        <h4 className="text-white font-bold text-sm mb-2">Arquivo .env (Produção)</h4>
                        <p className="text-xs text-slate-400 mb-2">Crie este arquivo na raiz do projeto com os dados fornecidos.</p>
                        <pre className="bg-black p-4 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto border border-emerald-900/50 shadow-inner leading-relaxed">
{`PORT=3000
NODE_ENV=production

# Database Config (PostgreSQL)
# Nota: Verifique se o banco suporta conexão em 3306 (padrão é 5432)
# ou se os dados fornecidos são de um banco MySQL.
# O sistema atual usa drivers PostgreSQL (pg).
DB_HOST=127.0.0.1
DB_PORT=3306 
DB_NAME=sie301
DB_USER=sie301
DB_PASSWORD=Gegerminal180

# AI Configuration (Gemini 2.5 Flash)
API_KEY=sAIzaSyBfXDRsKk_xVj7X2iOfxPtu6w0_tnbypes

# Security
JWT_SECRET=sie_secure_key_8823_change_me
CRON_KEY=sie_cron_trigger_x99`}
                        </pre>
                      </div>
                  </div>
              </div>

              <div className="space-y-4">
                  <h3 className="font-bold text-blue-400 mb-2 text-lg">Comandos de Instalação</h3>
                  
                  <div className="bg-slate-900 p-4 rounded border border-slate-700">
                      <p className="text-sm text-slate-400 mb-2">1. Instalação e Build (Na pasta raiz)</p>
                      <code className="block bg-black p-3 mt-2 text-xs text-green-400 font-mono border-l-4 border-green-600">
                        cd /home/jennyai-sie/htdocs/sie.jennyai.space<br/>
                        npm install<br/>
                        npm run build
                      </code>
                  </div>

                  <div className="bg-slate-900 p-4 rounded border border-slate-700">
                      <p className="text-sm text-slate-400 mb-2">2. Iniciar Servidor (PM2)</p>
                      <code className="block bg-black p-3 mt-2 text-xs text-green-400 font-mono border-l-4 border-green-600">
                        pm2 start server.js --name "sie-pro" --env production<br/>
                        pm2 save
                      </code>
                  </div>
                  
                  <div className="bg-slate-900 p-4 rounded border border-slate-700">
                      <p className="text-sm text-slate-400 mb-2">3. Logs e Monitoramento</p>
                      <code className="block bg-black p-3 mt-2 text-xs text-green-400 font-mono border-l-4 border-green-600">
                        pm2 logs sie-pro<br/>
                        pm2 monit
                      </code>
                  </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};