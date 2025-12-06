import React, { useState } from 'react';

interface DocumentationProps {
  onClose: () => void;
}

type TabType = 'database' | 'backend' | 'frontend' | 'financial' | 'crm' | 'ai-core' | 'deploy';

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
           <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs">DOC</div>
           <div>
             <h1 className="text-white font-bold text-sm leading-tight">S.I.E. PRO - Technical Docs</h1>
             <p className="text-[10px] text-slate-500 font-mono">v4.0 Enterprise - Full Schema & AI Core</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex bg-slate-900 rounded-lg p-1 border border-slate-800 overflow-x-auto max-w-lg">
              {(['database', 'ai-core', 'crm', 'financial', 'backend', 'frontend', 'deploy'] as TabType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all whitespace-nowrap ${
                    activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-lg' 
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
          
          {/* TAB: DATABASE (Full Schema Reference) */}
          {activeTab === 'database' && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">💾 Database Schema (v4.0 Final)</h2>
                <p className="text-slate-400">
                    O S.I.E. PRO utiliza um banco de dados relacional PostgreSQL altamente normalizado. 
                    Abaixo está o script completo para recriar o ambiente de produção.
                </p>
              </div>

              <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg mb-6">
                  <h3 className="text-blue-400 font-bold text-sm mb-2">Estrutura de Tabelas</h3>
                  <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono text-slate-300">
                      <li>1. users</li>
                      <li>2. plans</li>
                      <li>3. plugins</li>
                      <li>4. plan_plugins</li>
                      <li>5. subscriptions</li>
                      <li>6. monitoring_configs</li>
                      <li>7. master_items</li>
                      <li>8. payments</li>
                      <li>9. requests_log</li>
                  </ul>
              </div>

              <CopyBlock 
                title="init_schema_v4.sql" 
                lang="sql"
                code={`
-- Habilitar extensão para UUIDs (Essencial)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------
-- 1. USERS & AUTHENTICATION
-- Gerencia acesso, roles e status do ciclo de vida
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    phone VARCHAR(50),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 2. SAAS PLANS (Planos de Assinatura)
-- Define os níveis de serviço (Starter, Pro, Enterprise)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY, -- ex: 'starter', 'pro'
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT
);

-- -----------------------------------------------------
-- 3. PLUGINS (Marketplace)
-- Módulos adicionais que podem ser ativados/vendidos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    icon VARCHAR(50), -- Emoji ou URL
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'installed', 'active')),
    category VARCHAR(50) DEFAULT 'utility',
    price DECIMAL(10, 2) DEFAULT 0.00
);

-- -----------------------------------------------------
-- 4. PLAN_PLUGINS (Join Table)
-- Define quais plugins estão inclusos em quais planos
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS plan_plugins (
    plan_id VARCHAR(50) REFERENCES plans(id) ON DELETE CASCADE,
    plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, plugin_id)
);

-- -----------------------------------------------------
-- 5. SUBSCRIPTIONS
-- Vincula usuários a planos e controla validade
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) REFERENCES plans(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 6. MONITORING CONFIGS
-- Preferências do agente de IA (Keywords, URLs)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS monitoring_configs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    keywords JSONB DEFAULT '[]',
    urls_to_track JSONB DEFAULT '[]',
    frequency VARCHAR(20) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 7. MASTER ITEMS (Data Lake)
-- Resultados processados pela IA (Notícias, Relatórios)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS master_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_url TEXT,
    analyzed_content TEXT,
    ai_summary TEXT,
    detected_keywords JSONB, -- Array de strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 8. PAYMENTS (Financeiro)
-- Registro auditável de transações manuais/automáticas
-- -----------------------------------------------------
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

-- -----------------------------------------------------
-- 9. AUDIT LOGS (Requests & Cost)
-- Rastreabilidade de consumo de tokens Gemini API
-- -----------------------------------------------------
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

-- -----------------------------------------------------
-- DATA SEEDING (Dados Iniciais)
-- -----------------------------------------------------

-- Planos
INSERT INTO plans (id, name, price, description) VALUES
('starter', 'Starter Plan', 99.00, 'Monitoramento básico para pequenas operações.'),
('pro', 'Enterprise Pro', 299.00, 'IA Avançada, Tempo Real e Suporte Prioritário.'),
('gov', 'Governo', 0.00, 'Plano customizado para órgãos públicos.')
ON CONFLICT (id) DO NOTHING;

-- Usuário Admin Padrão (Senha: 123456)
INSERT INTO users (id, name, email, password_hash, role, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Master', 'admin@sie.pro', '$2a$10$X7Xk5y5n5j5k5l5m5n5o5p5q5r5s5t5u5v5w5x5y5z5A5B5C5D5E', 'admin', 'active')
ON CONFLICT (id) DO NOTHING;

-- Plugin: Raio-X
INSERT INTO plugins (id, name, description, icon, status, category) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Raio-X Administrativo', 'Ferramenta de transparência para mapeamento de cargos públicos.', '🏛️', 'active', 'utility')
ON CONFLICT (id) DO NOTHING;
                `}
              />
            </div>
          )}

          {/* TAB: AI CORE (Google Gemini) */}
          {activeTab === 'ai-core' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">🧠 Gemini AI Integration</h2>
                    <p className="text-slate-400">
                        A engine de inteligência utiliza a <strong>Google Gemini API</strong> para processamento de linguagem natural e estruturação de dados não estruturados (web scraping).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                      <h3 className="text-blue-400 font-bold mb-2">Modelos & Configuração</h3>
                      <ul className="space-y-2 text-sm text-slate-400">
                          <li><strong>Modelo:</strong> <code>gemini-2.5-flash</code> (Otimizado para latência).</li>
                          <li><strong>Temperatura:</strong> <code>0.1</code> (Foco em fatos, redução de alucinações).</li>
                          <li><strong>Formato:</strong> JSON Mode (Structured Output).</li>
                      </ul>
                   </div>
                   <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                      <h3 className="text-emerald-400 font-bold mb-2">Cálculo de Custos (Audit)</h3>
                      <p className="text-xs text-slate-400 mb-2">O sistema calcula o custo de cada requisição e armazena em <code>requests_log</code>.</p>
                      <div className="bg-black p-2 rounded font-mono text-xs text-green-400">
                        Input: $0.000125 / 1k tokens<br/>
                        Output: $0.000375 / 1k tokens
                      </div>
                   </div>
                </div>

                <h3 className="text-white font-bold mb-4">Prompt Engineering: Raio-X Administrativo</h3>
                <CopyBlock 
                    title="services/aiSearchService.js (Prompt Extract)"
                    lang="javascript"
                    code={`
const prompt = \`
    Você é o SISTEMA SIE (Strategic Intelligence Enterprise).
    Sua tarefa é gerar um relatório de transparência pública sobre a administração da cidade de: \${city}.

    DADOS NECESSÁRIOS:
    1. Prefeito Atual (Nome, Partido, Cargos Anteriores)
    2. Vice-Prefeito
    3. Vereadores (Principais)
    4. Funcionários Públicos Chave (Secretariado, Vínculo, Salário Estimado)

    FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
    {
        "city": "...",
        "mayor": { ... },
        "councilors": [ ... ],
        "key_servants": [ ... ]
    }
\`;
                    `}
                />
             </div>
          )}

          {/* TAB: CRM */}
          {activeTab === 'crm' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">👥 CRM & User Lifecycle</h2>
                    <p className="text-slate-400">
                        O módulo CRM (<code>AdminUsers.tsx</code>) foi completamente refatorado para oferecer controle total sobre o ciclo de vida do cliente.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                      <h3 className="text-blue-400 font-bold mb-2">Gestão de Status</h3>
                      <ul className="space-y-3 text-sm text-slate-400">
                          <li><code>active</code>: Acesso total ao sistema.</li>
                          <li><code>inactive</code>: Login bloqueado, dados preservados.</li>
                          <li><code>suspended</code>: Bloqueio por falta de pagamento ou violação de termos.</li>
                      </ul>
                   </div>
                   <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                      <h3 className="text-purple-400 font-bold mb-2">Funcionalidade: Impersonation</h3>
                      <p className="text-sm text-slate-400 mb-2">
                          Permite que administradores gerem um token de sessão válido para qualquer usuário, facilitando o suporte técnico.
                      </p>
                      <div className="bg-black p-3 rounded border border-slate-700 text-xs font-mono text-green-400">
                          POST /api/admin/users/:id/impersonate
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* TAB: FRONTEND */}
          {activeTab === 'frontend' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Frontend Architecture</h2>
                
                <h3 className="text-white font-bold mb-2">Componentes Refatorados</h3>
                <ul className="list-disc list-inside text-sm text-slate-400 space-y-2 mb-6">
                    <li>
                        <strong>UserModal.tsx:</strong> Agora utiliza um padrão de abas (Profile, Subscription, Security) para evitar modais muito longos e organizar logicamente as ações.
                    </li>
                    <li>
                        <strong>PublicAdminSearch.tsx:</strong> Implementa animações de loading (skeleton screens) e feedback visual durante a chamada da API do Gemini, além de exportação de JSON no cliente.
                    </li>
                    <li>
                        <strong>AdminDashboard.tsx:</strong> Inclui gráficos (CSS puro) para MRR e contadores em tempo real.
                    </li>
                </ul>

                <CopyBlock 
                    title="Estrutura de Rotas (App.tsx)"
                    lang="tsx"
                    code={`
// Admin Routes
case 'admin-dashboard': return <AdminDashboard />;
case 'admin-users': return <AdminUsers />; // CRM
case 'admin-addons': return <AdminAddons />; // Planos & Plugins

// Client Routes
case 'client-dashboard': return <ClientDashboard />;
case 'client-public-search': return <PublicAdminSearch />; // Tool
                    `}
                />
             </div>
          )}

          {/* TAB: FINANCIAL */}
          {activeTab === 'financial' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">💰 Financial Module v2</h2>
                <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 mb-6">
                    <h3 className="text-emerald-400 font-bold mb-2">Renovação Inteligente</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        O backend processa pagamentos manuais com lógica condicional de datas:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
                        <div className="bg-black p-3 rounded border border-slate-700">
                            SE (assinatura vencida) <br/>
                            ENTÃO (nova_data = HOJE + 30 dias)
                        </div>
                        <div className="bg-black p-3 rounded border border-slate-700">
                            SE (assinatura ativa) <br/>
                            ENTÃO (nova_data = DATA_ATUAL + 30 dias)
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* TAB: BACKEND */}
          {activeTab === 'backend' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Backend Services</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-400 font-mono">
                    <thead className="bg-slate-900 text-slate-500 border-b border-slate-700">
                      <tr>
                        <th className="p-3">Serviço</th>
                        <th className="p-3">Responsabilidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        <tr><td className="p-3 text-blue-400">auth.js</td><td>Autenticação JWT, Hashing (bcrypt), RBAC Middleware.</td></tr>
                        <tr><td className="p-3 text-blue-400">admin.js</td><td>CRUD Usuários, Gestão Financeira, Plugins, Logs.</td></tr>
                        <tr><td className="p-3 text-blue-400">client.js</td><td>Dashboard, Configs, Ferramentas de IA (Search).</td></tr>
                        <tr><td className="p-3 text-blue-400">collectorService.js</td><td>Core Loop de Monitoramento (Cron Job simulado).</td></tr>
                        <tr><td className="p-3 text-blue-400">aiSearchService.js</td><td>Interface direta com Gemini para Tools.</td></tr>
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {/* TAB: DEPLOY */}
          {activeTab === 'deploy' && (
             <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Deploy Checklist</h2>
              <div className="bg-emerald-950/20 border border-emerald-800 p-6 rounded-lg mb-8">
                  <h3 className="text-emerald-400 font-bold text-lg mb-4">Production Ready</h3>
                  <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
                      <li>Banco de Dados PostgreSQL provisionado e schema v4.0 aplicado.</li>
                      <li>Variáveis de ambiente (<code>API_KEY</code>, <code>JWT_SECRET</code>) configuradas.</li>
                      <li>Node.js v18+ rodando.</li>
                      <li>Frontend buildado (<code>npm run build</code>) e servido estaticamente pelo Express.</li>
                  </ul>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};