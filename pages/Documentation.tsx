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
             <p className="text-[10px] text-slate-500 font-mono">v5.0 - Autonomous Agents & Architecture Refactor</p>
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
          
          {/* TAB: DATABASE (Full Schema) */}
          {activeTab === 'database' && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">💾 Database Schema (v5.0 Final)</h2>
                <p className="text-slate-400 mb-4">
                    Esquema completo utilizado pelo <code>initDb.js</code> para inicialização automática.
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-900/20 p-3 rounded border border-blue-900/50">
                    <span>ℹ️</span>
                    <strong>Nota:</strong> O sistema cria estas tabelas automaticamente ao iniciar se elas não existirem.
                </div>
              </div>

              <CopyBlock 
                title="PostgreSQL Schema (Init Script)" 
                lang="sql"
                code={`
-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS (CRM & Auth)
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

-- 2. PLANOS (SaaS Tiers)
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT
);

-- 3. PLUGINS (Marketplace)
CREATE TABLE IF NOT EXISTS plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    icon VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available',
    category VARCHAR(50) DEFAULT 'utility',
    price DECIMAL(10, 2) DEFAULT 0.00,
    config JSONB DEFAULT '{}'
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

-- 6. CONFIGURAÇÃO DE MONITORAMENTO (Scheduler Target)
CREATE TABLE IF NOT EXISTS monitoring_configs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    keywords JSONB DEFAULT '[]',
    urls_to_track JSONB DEFAULT '[]',
    frequency VARCHAR(20) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_run_at TIMESTAMP WITH TIME ZONE -- Controle do Scheduler
);

-- 7. ITENS PROCESSADOS (Resultados IA)
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
                `}
              />
            </div>
          )}

          {/* TAB: AI CORE */}
          {activeTab === 'ai-core' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
                    <h2 className="text-2xl font-bold text-white mb-2">🧠 Gemini 2.5 Integration Strategy</h2>
                    <p className="text-slate-400">
                        O núcleo de inteligência foi atualizado para utilizar o modelo <code>gemini-2.5-flash</code> para máxima performance e custo reduzido.
                    </p>
                </div>
                
                <CopyBlock 
                    title="Collector Service (Crawler + Analysis)"
                    lang="javascript"
                    code={`
// Análise de Sentimento com output JSON estrito
const prompt = \`
    Analise o seguinte texto extraído de uma página web.
    Contexto: \${keywords.join(', ')}.

    Retorne APENAS JSON:
    {
        "sentiment": "Positivo|Negativo|Neutro",
        "impact": "Alto|Médio|Baixo",
        "summary": "Resumo de 1 frase",
        "keywords": ["..."]
    }
\`;

const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
});
                    `}
                />
             </div>
          )}

          {/* TAB: BACKEND */}
          {activeTab === 'backend' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Backend Architecture (v5.0)</h2>
                
                <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 mb-6">
                    <h3 className="text-white font-bold mb-4">⚙️ Autonomous Services</h3>
                    <p className="text-slate-400 text-sm mb-4">
                        Refatoração para desacoplar a lógica de execução da API principal.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-4 rounded border border-slate-700">
                            <h4 className="font-bold text-emerald-400 text-sm mb-2">Scheduler.js</h4>
                            <p className="text-xs text-slate-400">
                                Executa um loop interno (setInterval) a cada 60s. Verifica <code>monitoring_configs</code> para encontrar tarefas pendentes (Hourly/Daily) e dispara o <code>collectorService</code> sem intervenção humana.
                            </p>
                        </div>
                        <div className="bg-slate-900 p-4 rounded border border-slate-700">
                            <h4 className="font-bold text-blue-400 text-sm mb-2">LogService.js</h4>
                            <p className="text-xs text-slate-400">
                                Módulo centralizado para auditoria. Garante que qualquer consumo de tokens (Crawler, Busca Pública, Plugins) seja registrado na tabela <code>requests_log</code> para faturamento.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-4">Security Layer</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                            <span className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded text-xs font-mono border border-purple-900/50">auth.js (Middleware)</span>
                            <p className="text-sm text-slate-400">Verificação JWT stateless. Bloqueia automaticamente usuários com status <code>suspended</code> ou <code>inactive</code> mesmo com token válido.</p>
                        </div>
                        <div className="flex gap-3 items-start">
                             <span className="bg-orange-900/30 text-orange-400 px-2 py-1 rounded text-xs font-mono border border-orange-900/50">Impersonation</span>
                             <p className="text-sm text-slate-400">Rota administrativa para gerar tokens temporários de acesso a contas de clientes para suporte (sem troca de senha).</p>
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
                    <h3 className="text-white font-bold mb-3">🔄 Session Hydration & Persistence</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        Implementação de robustez para manter o usuário logado após refresh (F5).
                    </p>
                    <ul className="list-disc pl-5 text-sm text-slate-400 space-y-2">
                        <li>
                            <strong>App.tsx (useEffect):</strong> Ao montar, verifica se existe um JWT no localStorage.
                        </li>
                        <li>
                            <strong>API (validateSession):</strong> Chama <code>GET /api/auth/me</code> para validar o token e recuperar dados atualizados do usuário.
                        </li>
                        <li>
                            <strong>Auto-Redirect:</strong> Se o token for inválido (401/403), limpa o storage e redireciona para Login automaticamente.
                        </li>
                    </ul>
                 </div>

                 <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-3">Componentes Administrativos (CRM)</h3>
                    <p className="text-sm text-slate-400">
                        O <code>AdminUsers.tsx</code> agora integra um CRM completo com filtragem, métricas de churn e modais de edição complexa (<code>UserModal.tsx</code>) para gestão de ciclo de vida do cliente.
                    </p>
                 </div>
             </div>
          )}

          {/* TAB: DEPLOY */}
          {activeTab === 'deploy' && (
             <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Deploy Production (Plug & Play)</h2>
              
              <div className="bg-emerald-950/20 border border-emerald-800 p-6 rounded-lg mb-8">
                  <h3 className="text-emerald-400 font-bold text-lg mb-4">Zero-Config DB Init</h3>
                  <p className="text-slate-300 text-sm mb-4">
                      O servidor agora conta com <code>initDatabase()</code> no startup. Não é necessário rodar scripts SQL manualmente na primeira instalação.
                  </p>
                  <ol className="list-decimal pl-5 text-sm text-slate-400 space-y-2 font-mono">
                      <li>git clone repo-url</li>
                      <li>npm install</li>
                      <li>cp .env.example .env</li>
                      <li>npm run build</li>
                      <li>node server.js</li>
                  </ol>
              </div>

              <div className="bg-slate-900 p-4 rounded border border-slate-800">
                  <h4 className="text-white font-bold mb-2">Variáveis de Ambiente (.env)</h4>
                  <pre className="text-xs text-slate-500 font-mono">
PORT=3000
API_KEY=google_gemini_key
JWT_SECRET=complex_secret
DATABASE_URL=postgres://user:pass@host:5432/db
                  </pre>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};