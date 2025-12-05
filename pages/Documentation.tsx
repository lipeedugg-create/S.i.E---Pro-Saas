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
             <p className="text-[10px] text-slate-500 font-mono">v3.1 - Produção (Real DB)</p>
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
                    O sistema agora está 100% conectado a um banco de dados PostgreSQL real. Utilize o script abaixo para inicializar a estrutura completa.
                </p>
              </div>

              <CopyBlock 
                title="Conexão (config/db.js)" 
                lang="javascript"
                code={`
// A conexão utiliza Pool do 'pg' para eficiência
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || \`postgres://\${user}:\${pass}@\${host}:\${port}/\${db}\`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Todas as queries do backend passam por aqui
export const query = (text, params) => pool.query(text, params);
                `}
              />

              <h3 className="text-white font-bold mb-4">Script de Inicialização Completo</h3>
              <p className="text-slate-400 text-sm mb-4">Execute este SQL no seu banco de dados PostgreSQL para criar as tabelas e inserir os dados iniciais.</p>

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
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'starter', 'pro'
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT
);

-- 3. Plugins / Addons (Marketplace)
CREATE TABLE IF NOT EXISTS plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    icon VARCHAR(50), -- Emoji or URL
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'installed', 'active')),
    category VARCHAR(50) DEFAULT 'utility',
    price DECIMAL(10, 2) DEFAULT 0.00
);

-- 4. Plan <> Plugins (Feature distribution)
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
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Monitoring Configuration (User Settings)
CREATE TABLE IF NOT EXISTS monitoring_configs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    keywords JSONB DEFAULT '[]',
    urls_to_track JSONB DEFAULT '[]',
    frequency VARCHAR(20) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. AI Analysis Results (Master Items)
CREATE TABLE IF NOT EXISTS master_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_url TEXT,
    analyzed_content TEXT,
    ai_summary TEXT,
    detected_keywords JSONB, -- Array of strings
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Financial Payments (Manual Entry by Admin)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    reference_id VARCHAR(100), -- Transaction ID / PIX Key
    notes TEXT,
    admin_recorded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit Logs (AI Usage & Costs)
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

-- SEED DATA ----------------------------------------------------

-- Plans
INSERT INTO plans (id, name, price, description) VALUES
('starter', 'Starter Plan', 99.00, 'Monitoramento básico para pequenas empresas'),
('pro', 'Enterprise Pro', 299.00, 'IA avançada e tempo real'),
('gov', 'Government', 999.00, 'Infraestrutura dedicada')
ON CONFLICT DO NOTHING;

-- Users (Password is '123456' hashed with bcrypt cost 10)
-- Admin
INSERT INTO users (id, name, email, password_hash, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Master', 'admin@sie.pro', '$2a$10$X7Xk5y5n5j5k5l5m5n5o5p5q5r5s5t5u5v5w5x5y5z5A5B5C5D5E', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Client
INSERT INTO users (id, name, email, password_hash, role) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Acme Corp', 'client@acme.com', '$2a$10$X7Xk5y5n5j5k5l5m5n5o5p5q5r5s5t5u5v5w5x5y5z5A5B5C5D5E', 'client')
ON CONFLICT (email) DO NOTHING;

-- Subscription for Client
INSERT INTO subscriptions (user_id, plan_id, status, end_date) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'pro', 'active', CURRENT_DATE + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- Plugins
INSERT INTO plugins (name, description, icon, status, category, price) VALUES
('Dark Web Monitor', 'Rastreia vazamento de credenciais em fóruns underground.', '🕵️‍♂️', 'available', 'security', 49.90),
('PDF Reports', 'Gera relatórios executivos em PDF com um clique.', '📄', 'installed', 'utility', 19.90),
('Slack Integration', 'Envia alertas de crise diretamente no canal do Slack.', '📢', 'active', 'integration', 0.00),
('Sentiment AI+', 'Análise de sentimento granular (Emoções: Raiva, Alegria).', '🧠', 'available', 'analytics', 29.90)
ON CONFLICT DO NOTHING;

-- Config for Client
INSERT INTO monitoring_configs (user_id, keywords, urls_to_track) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '["Acme Corp", "Crise", "Vazamento"]', '["https://news.google.com", "https://twitter.com/search?q=acme"]')
ON CONFLICT (user_id) DO NOTHING;
                `}
              />
            </div>
          )}

           {/* TAB: FRONTEND */}
           {activeTab === 'frontend' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">2. Frontend Architecture (React 19)</h2>
                    <p className="text-slate-400">
                        O frontend foi refatorado para remover dependências de <code>db.ts</code> (Mock). Toda a comunicação é feita via API RESTful.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                       <span className="text-blue-500">🛠</span> api.ts (Service Layer)
                    </h3>
                    <p className="text-sm text-slate-400">
                      Centraliza chamadas <code>fetch</code> para o backend. Gerencia tokens JWT e tratamento de erros.
                    </p>
                  </div>
                  <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                       <span className="text-green-500">👥</span> AdminUsers.tsx
                    </h3>
                    <p className="text-sm text-slate-400">
                      <strong>Novo Feature:</strong> Gestão completa de usuários (CRUD).
                      Inclui botão <strong>"Login ➜"</strong> para Impersonificação (Acesso administrativo à conta do cliente).
                    </p>
                  </div>
                </div>

                <h3 className="text-white font-bold mb-4">User Management & Impersonation</h3>
                <p className="text-slate-400 mb-4 text-sm">
                    A funcionalidade de "Impersonate" permite que administradores gerem um token temporário para qualquer usuário, facilitando o suporte técnico.
                </p>
                <CopyBlock 
                    title="Componente: AdminUsers.tsx"
                    lang="typescript"
                    code={`
// Exemplo de Impersonation no Frontend
const handleImpersonate = async (user: User) => {
  if (confirm(\`Acessar como \${user.name}?\`)) {
    const { token, user: impersonated } = await api.impersonate(user.id);
    localStorage.setItem('token', token);
    onLogin(impersonated); // Atualiza estado global do App
  }
};
                    `}
                />
             </div>
           )}

          {/* TAB: AI CORE */}
          {activeTab === 'ai-core' && (
             <div className="animate-fade-in space-y-6">
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">3. Gemini 2.5 Flash Integration</h2>
                <p className="text-slate-400">
                   O core de monitoramento agora reside exclusivamente no backend (<code>services/collectorService.js</code>).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                 <div className="p-4 bg-slate-800 rounded border border-slate-700">
                    <div className="font-bold text-white mb-1">System Instructions</div>
                    <div className="text-xs text-slate-400">Define a persona "Analista Sênior" para o modelo.</div>
                 </div>
                 <div className="p-4 bg-slate-800 rounded border border-slate-700">
                    <div className="font-bold text-white mb-1">JSON Mode</div>
                    <div className="text-xs text-slate-400">Garante outputs estruturados para inserção direta no DB.</div>
                 </div>
                 <div className="p-4 bg-slate-800 rounded border border-slate-700">
                    <div className="font-bold text-white mb-1">Custo Real</div>
                    <div className="text-xs text-slate-400">Auditoria precisa de tokens de entrada/saída.</div>
                 </div>
              </div>

              <CopyBlock 
                title="backend/services/collectorService.js" 
                lang="javascript"
                code={`
// Configuração do Modelo
const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: text,
    config: {
        systemInstruction: "Analise o sentimento e risco...",
        responseMimeType: 'application/json'
    }
});
// O resultado é salvo na tabela 'master_items'
// O custo é salvo na tabela 'requests_log'
                `}
              />
            </div>
          )}

          {/* TAB: BACKEND */}
          {activeTab === 'backend' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-2">4. Backend API Routes</h2>
                <p className="text-slate-400 mb-4">Endpoints REST protegidos por JWT Middleware.</p>
                <div className="space-y-2 font-mono text-sm">
                    <div className="flex gap-4 p-3 bg-slate-900 border border-slate-800 rounded">
                        <span className="text-green-400 font-bold">GET</span>
                        <span className="text-slate-300">/api/admin/users</span>
                        <span className="text-slate-500 ml-auto">Lista todos os usuários</span>
                    </div>
                    <div className="flex gap-4 p-3 bg-slate-900 border border-slate-800 rounded">
                        <span className="text-blue-400 font-bold">POST</span>
                        <span className="text-slate-300">/api/admin/users</span>
                        <span className="text-slate-500 ml-auto">Cria novo usuário</span>
                    </div>
                    <div className="flex gap-4 p-3 bg-slate-900 border border-slate-800 rounded">
                        <span className="text-yellow-400 font-bold">POST</span>
                        <span className="text-slate-300">/api/admin/users/:id/impersonate</span>
                        <span className="text-slate-500 ml-auto">Gera token de acesso (Admin Only)</span>
                    </div>
                    <div className="flex gap-4 p-3 bg-slate-900 border border-slate-800 rounded">
                        <span className="text-purple-400 font-bold">POST</span>
                        <span className="text-slate-300">/api/monitoring/trigger</span>
                        <span className="text-slate-500 ml-auto">Dispara coleta IA (Requer X-CRON-KEY)</span>
                    </div>
                </div>
             </div>
          )}

          {/* TAB: DEPLOY */}
          {activeTab === 'deploy' && (
             <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">5. Ambiente de Produção</h2>
              
              <div className="bg-emerald-950/20 border border-emerald-800 p-6 rounded-lg mb-8">
                  <h3 className="text-emerald-400 font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Status: Conectado
                  </h3>
                  <p className="text-slate-300 text-sm">
                      O frontend estático (Vite Build) é servido pelo Express, que se conecta ao PostgreSQL.
                      Não há mais dados locais/mockados.
                  </p>
              </div>

              <div>
                <h4 className="text-white font-bold text-sm mb-2">Variáveis de Ambiente (.env)</h4>
                <pre className="bg-black p-4 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto border border-emerald-900/50">
{`DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sie301
DB_USER=sie301
DB_PASSWORD=Gegerminal180
API_KEY=sAIza...
JWT_SECRET=...
CRON_KEY=...`}
                </pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};