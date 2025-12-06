import React, { useState } from 'react';

interface DocumentationProps {
  onClose: () => void;
}

type TabType = 'database' | 'ai-core' | 'backend' | 'frontend' | 'deploy';

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
             <h1 className="text-white font-bold text-sm leading-tight">S.I.E. PRO - Documentação Técnica</h1>
             <p className="text-[10px] text-slate-500 font-mono">v4.1 - Robust Migration Schema & AI Core</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex bg-slate-900 rounded-lg p-1 border border-slate-800 overflow-x-auto max-w-lg">
              {(['database', 'ai-core', 'backend', 'frontend', 'deploy'] as TabType[]).map(tab => (
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
          
          {/* TAB: DATABASE (Migration Safe) */}
          {activeTab === 'database' && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">💾 Database Schema v4.1 (Migration Safe)</h2>
                <p className="text-slate-400">
                    Este script é <strong>idempotente</strong>. Ele cria tabelas se não existirem e adiciona colunas novas (como <code>status</code> e <code>phone</code>) em tabelas legadas sem perder dados.
                </p>
              </div>

              <CopyBlock 
                title="init_schema_v4_1_robust.sql" 
                lang="sql"
                code={`
-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABELA USERS (Base)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.1 MIGRAÇÃO: Adicionar colunas novas se não existirem (Safe Update)
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 2. PLANOS
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT
);

-- 3. PLUGINS
CREATE TABLE IF NOT EXISTS plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    icon VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'installed', 'active')),
    category VARCHAR(50) DEFAULT 'utility',
    price DECIMAL(10, 2) DEFAULT 0.00
);

-- 4. RELAÇÃO PLANOS <> PLUGINS
CREATE TABLE IF NOT EXISTS plan_plugins (
    plan_id VARCHAR(50) REFERENCES plans(id) ON DELETE CASCADE,
    plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, plugin_id)
);

-- 5. ASSINATURAS
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) REFERENCES plans(id),
    status VARCHAR(20) DEFAULT 'active',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CONFIGURAÇÃO DE MONITORAMENTO
CREATE TABLE IF NOT EXISTS monitoring_configs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    keywords JSONB DEFAULT '[]',
    urls_to_track JSONB DEFAULT '[]',
    frequency VARCHAR(20) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ITENS PROCESSADOS (Master Data)
CREATE TABLE IF NOT EXISTS master_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_url TEXT,
    analyzed_content TEXT,
    ai_summary TEXT,
    detected_keywords JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. PAGAMENTOS
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

-- 9. LOGS DE AUDITORIA (CUSTOS IA)
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

-- SEED DATA (Apenas se não existir conflito)
INSERT INTO plans (id, name, price, description) VALUES
('starter', 'Starter Plan', 99.00, 'Monitoramento básico para pequenas operações.'),
('pro', 'Enterprise Pro', 299.00, 'IA Avançada, Tempo Real e Suporte Prioritário.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO plugins (id, name, description, icon, status, category) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Raio-X Administrativo', 'Ferramenta de transparência para mapeamento de cargos públicos.', '🏛️', 'active', 'utility')
ON CONFLICT (id) DO NOTHING;

-- Usuário Admin (Senha: 123456)
-- IMPORTANTE: Garante que os campos novos tenham valor na inserção
INSERT INTO users (id, name, email, password_hash, role, status, phone) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin Master', 'admin@sie.pro', '$2a$10$X7Xk5y5n5j5k5l5m5n5o5p5q5r5s5t5u5v5w5x5y5z5A5B5C5D5E', 'admin', 'active', '+5511999999999')
ON CONFLICT (id) DO UPDATE SET status = 'active'; 
                `}
              />
            </div>
          )}

          {/* TAB: AI CORE */}
          {activeTab === 'ai-core' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-2xl font-bold text-white mb-2">🧠 Gemini 2.5 Integration</h2>
                    <p className="text-slate-400">
                        O serviço <code>aiSearchService.js</code> utiliza <strong>Prompt Engineering Avançado</strong> para extrair dados estruturados (JSON) de informações não estruturadas sobre governança pública.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                      <h3 className="text-blue-400 font-bold mb-2">Parâmetros do Modelo</h3>
                      <ul className="text-sm text-slate-400 space-y-2">
                          <li><strong>Model:</strong> <code>gemini-2.5-flash</code></li>
                          <li><strong>Temperature:</strong> <code>0.1</code> (Alta determinística)</li>
                          <li><strong>Response Format:</strong> <code>JSON Schema Enforcement</code></li>
                      </ul>
                   </div>
                   <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                       <h3 className="text-emerald-400 font-bold mb-2">Token Cost Tracking</h3>
                       <p className="text-xs text-slate-400">
                           Cada requisição é auditada em <code>requests_log</code>.
                           <br/>Input: <strong>$0.10 / 1M tokens</strong>
                           <br/>Output: <strong>$0.30 / 1M tokens</strong>
                       </p>
                   </div>
                </div>

                <CopyBlock 
                    title="services/aiSearchService.js (Atual Prompt)"
                    lang="javascript"
                    code={`
const prompt = \`
    Você é o SISTEMA SIE (Strategic Intelligence Enterprise).
    Sua tarefa é gerar um relatório de transparência pública sobre a administração da cidade de: \${city} (Brasil).

    DADOS NECESSÁRIOS:
    1. Prefeito Atual (Nome, Partido, Cargos Anteriores na carreira)
    2. Vice-Prefeito (Nome, Partido)
    3. Vereadores (Liste pelo menos 5 principais ou mesa diretora...)
    4. Funcionários Públicos Chave (Secretários Municipais ex: Saúde, Educação...)

    FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
    {
        "city": "\${city}",
        "mayor": { "name": "...", "role": "Prefeito", "party": "...", "past_roles": ["..."] },
        "councilors": [ ... ],
        "key_servants": [ ... ],
        "last_updated": "Data atual"
    }
\`;
                    `}
                />
             </div>
          )}

          {/* TAB: BACKEND */}
          {activeTab === 'backend' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Backend Architecture (Node.js)</h2>
                <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-4">Endpoints Críticos</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                            <span className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded text-xs font-mono border border-purple-900/50">POST /api/admin/users/:id/impersonate</span>
                            <p className="text-sm text-slate-400">Gera um JWT temporário com scope do usuário alvo, permitindo ao admin "ver o que o cliente vê".</p>
                        </div>
                        <div className="flex gap-3 items-start">
                            <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs font-mono border border-green-900/50">POST /api/monitoring/trigger</span>
                            <p className="text-sm text-slate-400">Disparado por Cron Job. Varre todas as configs ativas e chama o Gemini para análise de sentimento.</p>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* TAB: FRONTEND */}
          {activeTab === 'frontend' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Frontend Architecture (React 19)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-800 p-4 rounded border border-slate-700">
                        <h4 className="text-white font-bold mb-2">PublicAdminSearch.tsx</h4>
                        <p className="text-sm text-slate-400">Implementa padrão de <strong>Skeleton Loading</strong> enquanto aguarda a resposta da IA (que pode levar 5-10s). Inclui exportação de JSON no cliente.</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded border border-slate-700">
                        <h4 className="text-white font-bold mb-2">UserModal.tsx</h4>
                        <p className="text-sm text-slate-400">Refatorado para usar <strong>Abas (Tabs)</strong>, separando dados cadastrais, financeiros e zona de perigo (bloqueio de conta).</p>
                    </div>
                </div>
             </div>
          )}

          {/* TAB: DEPLOY */}
          {activeTab === 'deploy' && (
             <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Deploy Instructions</h2>
              <div className="bg-emerald-950/20 border border-emerald-800 p-6 rounded-lg mb-8">
                  <h3 className="text-emerald-400 font-bold text-lg mb-4">Atualização de Versão (v4.0 ➜ v4.1)</h3>
                  <p className="text-slate-300 text-sm mb-4">
                      Se você já tem o banco rodando, execute o script SQL da aba "Database". Ele detectará automaticamente colunas ausentes (`status`, `phone`) e as criará, preservando seus dados existentes.
                  </p>
                  <div className="bg-black p-3 rounded font-mono text-xs text-green-400 border border-slate-800">
                      psql -h localhost -U postgres -d sie_pro -f init_schema_v4_1_robust.sql
                  </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};