import React, { useState } from 'react';

interface DocumentationProps {
  onClose: () => void;
}

type TabType = 'ai-studio' | 'install' | 'architecture' | 'database';

export const Documentation: React.FC<DocumentationProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('database');

  const CopyBlock = ({ title, code }: { title: string, code: string }) => (
    <div className="mb-8 rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-[#0d1117]">
      <div className="px-4 py-3 flex justify-between items-center border-b border-slate-700/50 bg-slate-800/50 backdrop-blur">
        <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">{title}</span>
        </div>
        <button 
            onClick={() => {
                navigator.clipboard.writeText(code);
                alert("Conteúdo copiado!");
            }}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-all font-bold flex items-center gap-1 shadow-lg shadow-blue-900/20"
        >
            <span>📋</span> COPIAR
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-xs md:text-sm leading-relaxed text-emerald-300 whitespace-pre-wrap selection:bg-blue-500/30">
          <code>{code.trim()}</code>
        </pre>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] text-slate-300 overflow-hidden flex flex-col font-sans animate-fade-in">
      {/* Header */}
      <div className="h-20 bg-slate-950 border-b border-slate-800 flex justify-between items-center px-8 shadow-xl shrink-0 z-20">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg">DOC</div>
           <div>
             <h1 className="text-white font-bold text-lg leading-tight">Documentação Técnica S.I.E. PRO</h1>
             <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Enterprise v2.0 Reference</p>
           </div>
        </div>
        <button 
             onClick={onClose}
             className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
           >
             FECHAR ✕
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 gap-2 shrink-0">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 px-2">Navegação</p>
              {[
                { id: 'database', label: '💾 Schema do Banco', icon: '🗄️' },
                { id: 'architecture', label: '📐 Arquitetura & Seg', icon: '🏗️' },
                { id: 'ai-studio', label: '✨ Plugins Generator', icon: '🤖' },
                { id: 'install', label: '📦 Guia de Instalação', icon: '⬇️' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${
                    activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-[#0b1120] relative">
            <div className="max-w-5xl mx-auto p-8 pb-24">
                
                {/* TAB: DATABASE SCHEMA */}
                {activeTab === 'database' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Schema PostgreSQL v2.0</h2>
                            <p className="text-slate-400">
                                Definição completa das tabelas do sistema, incluindo as novas colunas de CRM (status, last_login) e gestão de plugins.
                                O sistema utiliza a extensão <code>pgcrypto</code> para geração de UUIDs.
                            </p>
                        </div>

                        <CopyBlock 
                            title="DDL SQL (PostgreSQL)"
                            code={`
-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USUÁRIOS & AUTENTICAÇÃO
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('admin', 'client')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    phone VARCHAR(50),
    avatar TEXT, -- Base64 ou URL
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PLANOS COMERCIAIS
CREATE TABLE plans (
    id VARCHAR(50) PRIMARY KEY, -- Ex: 'starter', 'pro'
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    token_limit BIGINT DEFAULT 10000 -- Cota de uso da IA
);

-- 3. CICLO DE ASSINATURA
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) REFERENCES plans(id),
    status VARCHAR(20) DEFAULT 'active',
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE, -- Controla o vencimento/renovação
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. MARKETPLACE DE PLUGINS
CREATE TABLE plugins (
    id VARCHAR(100) PRIMARY KEY, -- Slug legível (ex: 'raio-x-admin')
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0.0',
    icon VARCHAR(50), -- Emoji ou URL
    status VARCHAR(50) DEFAULT 'available', -- available, installed, active
    category VARCHAR(50) DEFAULT 'utility',
    price DECIMAL(10, 2) DEFAULT 0.00,
    config JSONB DEFAULT '{}', -- Armazena System Prompts
    entry_point VARCHAR(255), -- Caminho do arquivo principal (ex: index.html)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. CONTROLE DE ACESSO (ACL) - PLANOS X PLUGINS
CREATE TABLE plan_plugins (
    plan_id VARCHAR(50) REFERENCES plans(id) ON DELETE CASCADE,
    plugin_id VARCHAR(100) REFERENCES plugins(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, plugin_id)
);

-- 6. CONFIGURAÇÃO DO AGENTE DE MONITORAMENTO
CREATE TABLE monitoring_configs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    keywords JSONB DEFAULT '[]',
    urls_to_track JSONB DEFAULT '[]',
    frequency VARCHAR(20) DEFAULT 'daily',
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_run_at TIMESTAMP WITH TIME ZONE
);

-- 7. ITENS COLETADOS (RESULTADOS)
CREATE TABLE master_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    source_url TEXT,
    analyzed_content TEXT, -- Texto extraído (truncado)
    ai_summary TEXT, -- Resumo gerado pelo Gemini
    detected_keywords JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. FINANCEIRO & AUDITORIA
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    reference_id VARCHAR(100), -- Ex: ID da Transação PIX
    notes TEXT,
    admin_recorded_by UUID REFERENCES users(id), -- Quem registrou
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requests_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    endpoint VARCHAR(100),
    request_tokens INT DEFAULT 0,
    response_tokens INT DEFAULT 0,
    cost_usd DECIMAL(10, 6) DEFAULT 0, -- Custo calculado da API Gemini
    status VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255),
    subject VARCHAR(100),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
                            `}
                        />
                    </div>
                )}

                {/* TAB: ARCHITECTURE */}
                {activeTab === 'architecture' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Arquitetura de Segurança & Recursos</h2>
                            <p className="text-slate-400">Detalhes técnicos sobre autenticação, permissionamento e o novo sistema de Impersonation.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {/* Impersonation Section */}
                            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-purple-400">🎭</span> Sistema de Impersonation (Login como Cliente)
                                </h3>
                                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                                    Permite que administradores acessem a conta de um cliente para suporte técnico sem necessidade de saber a senha do usuário.
                                </p>
                                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-blue-300">
                                    <p className="mb-2"><span className="text-slate-500">1. Admin Request:</span> POST /api/admin/users/:id/impersonate (Header: Auth Admin)</p>
                                    <p className="mb-2"><span className="text-slate-500">2. Backend Verify:</span> Valida se o solicitante é admin.</p>
                                    <p className="mb-2"><span className="text-slate-500">3. Token Gen:</span> Gera novo JWT assinado com o <code>user_id</code> do alvo, mas com expiração curta (1h).</p>
                                    <p><span className="text-slate-500">4. Frontend:</span> Substitui o token no <code>localStorage</code> e recarrega a aplicação.</p>
                                </div>
                            </div>

                            {/* Plugin Sandbox */}
                            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="text-emerald-400">🧩</span> Plugin Sandbox (Micro-Frontend)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-6">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-blue-900/20 rounded-full flex items-center justify-center text-2xl mb-4 border border-blue-500/30">🖥️</div>
                                        <h4 className="font-bold text-white text-sm">Host (React App)</h4>
                                        <p className="text-xs text-slate-400 mt-2">Gerencia autenticação e injeta o token no Iframe via <code>postMessage</code>.</p>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className="h-0.5 w-full bg-slate-700 relative">
                                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-600 rounded">
                                                Auth Handshake
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-emerald-900/20 rounded-full flex items-center justify-center text-2xl mb-4 border border-emerald-500/30">📦</div>
                                        <h4 className="font-bold text-white text-sm">Plugin (Iframe)</h4>
                                        <p className="text-xs text-slate-400 mt-2">Ambiente isolado. Usa a API Gateway (<code>/api/client/plugin/ai</code>) para acessar o Gemini.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: AI STUDIO PROMPT */}
                {activeTab === 'ai-studio' && (
                    <div className="animate-fade-in-up space-y-8">
                        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-8 text-center relative overflow-hidden">
                            <h2 className="text-3xl font-bold text-white mb-4">Crie Plugins em Segundos</h2>
                            <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
                                Use o poder do <strong>Google Gemini</strong> para programar novas funcionalidades para o S.I.E. PRO.
                            </p>
                        </div>

                        <CopyBlock 
                            title="Prompt de Engenharia S.I.E. PRO v2.0"
                            code={`
Atue como um Arquiteto de Software Sênior especialista no ecossistema S.I.E. PRO.
Sua tarefa é criar um PLUGIN COMPLETO (Micro-Frontend) baseado na solicitação do usuário.

[CONTEXTO TÉCNICO - OBRIGATÓRIO]
1. Arquitetura: O plugin roda em um IFRAME isolado (sandbox).
2. Tech Stack: HTML5 + JavaScript (Vanilla ou React via CDN) + TailwindCSS (via CDN).
3. Auth: O plugin recebe o token JWT do sistema pai via 'window.addEventListener("message")'.
4. Backend: O plugin DEVE usar o Generic AI Gateway para inteligência.
   - Endpoint: POST /api/client/plugin/ai
   - Header: Authorization: Bearer <TOKEN_RECEBIDO>
   - Body: { "plugin_id": "SEU_ID", "user_prompt": "..." }

[ESTRUTURA DE RESPOSTA]
Você deve gerar dois arquivos dentro de um bloco de código, prontos para serem salvos:
1. manifest.json (Metadados - entry_point padrão é "index.html")
2. index.html (Aplicação Completa em um arquivo)

[MODELO DE CÓDIGO - INDEX.HTML]
Use este esqueleto para garantir compatibilidade:

<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-200 p-4 font-sans">
  <div id="app">
     <div id="status" class="text-xs text-slate-500 mb-4">Aguardando Autenticação...</div>
     <button id="btnAction" class="bg-blue-600 text-white px-4 py-2 rounded" disabled>Executar Ação</button>
     <div id="result" class="mt-4 p-4 bg-slate-800 rounded hidden"></div>
  </div>

  <script>
    let authToken = null;
    const PLUGIN_ID = "ID_DO_PLUGIN_AQUI"; 

    // 1. Handshake de Autenticação
    window.addEventListener('message', (event) => {
      if (event.data.type === 'AUTH_TOKEN') {
        authToken = event.data.token;
        document.getElementById('status').innerText = 'Conectado';
        document.getElementById('btnAction').disabled = false;
      }
    });

    // 2. Chamada à IA
    document.getElementById('btnAction').addEventListener('click', async () => {
       if(!authToken) return;
       // ... Lógica de fetch para /api/client/plugin/ai
    });
  </script>
</body>
</html>
`} 
                        />
                    </div>
                )}

                {/* TAB: INSTALL GUIDE */}
                {activeTab === 'install' && (
                    <div className="animate-fade-in-up space-y-8">
                        <div className="border-b border-slate-800 pb-6 mb-6">
                            <h2 className="text-3xl font-bold text-white mb-2">Instalação & Migração</h2>
                            <p className="text-slate-400">Como colocar o sistema em produção e atualizar o banco de dados.</p>
                        </div>

                        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-inner mb-6">
                            <h4 className="font-bold text-white mb-4 text-sm uppercase">Auto-Migration (Node.js)</h4>
                            <p className="text-sm text-slate-400 mb-4">
                                O sistema possui um script de inicialização (<code>config/initDb.js</code>) que roda automaticamente ao iniciar o servidor (<code>npm start</code>).
                                Ele verifica a existência das tabelas e cria colunas faltantes se necessário.
                            </p>
                            <div className="font-mono text-xs bg-slate-950 p-4 rounded text-emerald-400">
                                &gt; node server.js<br/>
                                🔌 Conectando ao PostgreSQL...<br/>
                                🔄 Verificando integridade do Schema SQL...<br/>
                                ✅ Admin Default criado/verificado<br/>
                                🚀 Servidor S.I.E. PRO rodando na porta 3000
                            </div>
                        </div>
                    </div>
                )}

            </div>
          </div>
      </div>
    </div>
  );
};