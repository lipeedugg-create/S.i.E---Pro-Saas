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
            className="absolute top-2 right-2 bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-slate-700 hover:bg-slate-700"
        >
            Copiar Comando
        </button>
        <pre className="font-mono text-xs md:text-sm leading-relaxed text-emerald-300 whitespace-pre-wrap">
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
             <p className="text-[10px] text-slate-500 font-mono">v4.3 - User Management & Impersonation</p>
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
                <h2 className="text-2xl font-bold text-white mb-2">💾 Database Schema (CRM Update)</h2>
                <p className="text-slate-400 mb-4">
                    Atualização crítica para suportar campos de CRM na tabela <code>users</code>. Execute o script abaixo para atualizar sua base.
                </p>
                <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-900/20 p-3 rounded border border-yellow-900/50">
                    <span>⚠️</span>
                    <strong>Atenção:</strong> Script idempotente (IF NOT EXISTS). Seguro para rodar em produção.
                </div>
              </div>

              <CopyBlock 
                title="TERMINAL SSH (Paste & Enter)" 
                lang="bash"
                code={`
psql "postgres://sie301:Gegerminal180@127.0.0.1:5432/sie301" << 'EOF'

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
-- Migração V4.1 (CRM Fields)
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
-- Migração V4.2 (Configuração de Prompt)
ALTER TABLE plugins ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_run_at TIMESTAMP WITH TIME ZONE -- Novo V4.3
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

EOF
                `}
              />
            </div>
          )}

          {/* TAB: AI CORE */}
          {activeTab === 'ai-core' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-2xl font-bold text-white mb-2">🧠 Custom Plugin Prompts</h2>
                    <p className="text-slate-400">
                        O serviço busca o prompt do banco de dados (tabela <code>plugins.config</code>). Isso permite ajustar o comportamento da IA sem redeploy.
                    </p>
                </div>
                
                <CopyBlock 
                    title="services/aiSearchService.js (Dynamic Logic)"
                    lang="javascript"
                    code={`
// Busca configuração do banco
const pluginConfig = await getPluginConfigFromDB('a0eebc99...');

const finalPrompt = \`
  \${pluginConfig.systemPrompt || DEFAULT_PROMPT}

  RESTRIÇÕES (NEGATIVE PROMPT):
  \${pluginConfig.negativePrompt || ''}
\`;
                    `}
                />
             </div>
          )}

          {/* TAB: BACKEND */}
          {activeTab === 'backend' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Backend Architecture</h2>
                
                <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 mb-6">
                    <h3 className="text-white font-bold mb-4">🔐 Security & User Management (v4.3)</h3>
                    <p className="text-slate-400 text-sm mb-4">Implementação de controle total sobre o ciclo de vida dos usuários.</p>
                    
                    <div className="space-y-4">
                        <div>
                            <span className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded text-xs font-mono border border-purple-900/50">POST /api/admin/users/:id/impersonate</span>
                            <p className="text-sm text-slate-400 mt-1">
                                <strong>Admin Impersonation:</strong> Gera um JWT de curta duração (1h) assinado como o usuário alvo. Permite que admins acessem a visão do cliente para suporte técnico sem saber a senha.
                                <br/><em className="text-xs text-slate-500">Logado no servidor e requer role 'admin'.</em>
                            </p>
                        </div>
                        <div>
                             <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs font-mono border border-blue-900/50">PATCH /api/admin/users/:id/status</span>
                             <p className="text-sm text-slate-400 mt-1">
                                 Atualiza status para <code>active</code>, <code>inactive</code> ou <code>suspended</code>. Middleware de login bloqueia acesso imediato de contas não ativas.
                             </p>
                        </div>
                        <div>
                             <span className="bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded text-xs font-mono border border-emerald-900/50">POST /api/admin/users/:id/subscription</span>
                             <p className="text-sm text-slate-400 mt-1">
                                 Atribui ou migra o plano do usuário. Calcula automaticamente a data de renovação (+30 dias) ou ajusta datas retroativas.
                             </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-4">Plugin Configuration Endpoints</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                            <span className="bg-orange-900/30 text-orange-400 px-2 py-1 rounded text-xs font-mono border border-orange-900/50">PATCH /api/admin/plugins/:id/config</span>
                            <p className="text-sm text-slate-400">Atualiza o Prompt de Sistema e o Prompt Negativo de um plugin específico.</p>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* TAB: FRONTEND */}
          {activeTab === 'frontend' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Frontend Architecture</h2>
                 
                 <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 mb-6">
                    <h3 className="text-white font-bold mb-3">Novos Módulos Administrativos (v4.3)</h3>
                    <ul className="list-disc pl-5 text-sm text-slate-400 space-y-2">
                        <li>
                            <strong>AdminUsers.tsx:</strong> Página principal de CRM. Inclui tabela com filtragem avançada (Nome, Status, Plano) e métricas rápidas (Novos Usuários, Churn rate implícito).
                        </li>
                        <li>
                            <strong>UserModal.tsx:</strong> Componente complexo com abas:
                            <ul className="list-circle pl-5 mt-1 text-xs text-slate-500">
                                <li><em>Perfil:</em> Edição de dados cadastrais e senha.</li>
                                <li><em>Assinatura:</em> Atribuição de planos e ajuste manual de vencimento.</li>
                                <li><em>Segurança:</em> Botões de pânico (Bloquear Usuário, Reset de Senha) e logs de acesso.</li>
                            </ul>
                        </li>
                    </ul>
                 </div>

                 <p className="text-slate-400">Adicionado também <code>PluginConfigModal.tsx</code> para edição visual dos prompts de IA.</p>
             </div>
          )}

          {activeTab === 'deploy' && (
             <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Deploy Instructions</h2>
              <div className="bg-emerald-950/20 border border-emerald-800 p-6 rounded-lg mb-8">
                  <h3 className="text-emerald-400 font-bold text-lg mb-4">Atualização v4.3</h3>
                  <p className="text-slate-300 text-sm mb-4">
                      Se você está atualizando de uma versão anterior, execute o script SQL da aba <strong>DATABASE</strong> para adicionar as colunas de CRM. O backend não iniciará corretamente sem as colunas <code>status</code> e <code>last_run_at</code>.
                  </p>
                  <code className="bg-black/50 p-2 rounded block mt-2 text-xs font-mono">
                      npm install && npm run build && pm2 restart server
                  </code>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};