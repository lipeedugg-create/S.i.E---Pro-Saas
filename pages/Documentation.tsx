import React, { useState } from 'react';

interface DocumentationProps {
  onClose: () => void;
}

type TabType = 'ai-studio' | 'install' | 'architecture' | 'database';

export const Documentation: React.FC<DocumentationProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('ai-studio');

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
                alert("Prompt copiado para a área de transferência!");
            }}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-all font-bold flex items-center gap-1 shadow-lg shadow-blue-900/20"
        >
            <span>📋</span> COPIAR PROMPT
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
           <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-lg">AI</div>
           <div>
             <h1 className="text-white font-bold text-lg leading-tight">Engenharia de Plugins</h1>
             <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Google AI Studio Generator</p>
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
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 px-2">Menu Principal</p>
              {[
                { id: 'ai-studio', label: '✨ Gerador de Prompt', icon: '🤖' },
                { id: 'install', label: '📦 Guia de Instalação', icon: '⬇️' },
                { id: 'architecture', label: '📐 Arquitetura Técnica', icon: '🏗️' },
                { id: 'database', label: '💾 Banco de Dados', icon: '🗄️' },
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
                
                {/* TAB: AI STUDIO PROMPT */}
                {activeTab === 'ai-studio' && (
                    <div className="animate-fade-in-up space-y-8">
                        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-2xl p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                            <h2 className="text-3xl font-bold text-white mb-4">Crie Plugins em Segundos</h2>
                            <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
                                Use o poder do <strong>Google Gemini</strong> para programar novas funcionalidades para o S.I.E. PRO.
                                Copie o prompt abaixo, cole no AI Studio e descreva o que você quer.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">1</span>
                                    O Prompt Mestre (Copie e Cole)
                                </h3>
                                <span className="text-xs text-slate-500 font-mono">Compatível: Gemini 1.5 Pro / 2.5 Flash</span>
                            </div>
                            
                            <p className="text-slate-400 text-sm">
                                Este prompt contém todas as regras de segurança, autenticação e comunicação via Iframe necessárias para que o código gerado funcione na primeira tentativa.
                            </p>

                            <CopyBlock 
                                title="Prompt de Engenharia S.I.E. PRO v5.0"
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
1. manifest.json (Metadados)
2. index.html (Aplicação Completa em um arquivo)

[MODELO DE CÓDIGO - INDEX.HTML]
Use este esqueleto para garantir compatibilidade:

<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React/Babel Opcional -->
</head>
<body class="bg-slate-900 text-slate-200 p-4 font-sans">
  <div id="app">
     <!-- SEU UI AQUI -->
     <div id="status" class="text-xs text-slate-500 mb-4">Aguardando Autenticação...</div>
     <button id="btnAction" class="bg-blue-600 text-white px-4 py-2 rounded" disabled>Executar Ação</button>
     <div id="result" class="mt-4 p-4 bg-slate-800 rounded hidden"></div>
  </div>

  <script>
    let authToken = null;
    let currentUser = null;
    // IMPORTANTE: O ID deve ser igual ao do manifest.json
    const PLUGIN_ID = "ID_DO_PLUGIN_AQUI"; 

    // 1. Handshake de Autenticação
    window.addEventListener('message', (event) => {
      if (event.data.type === 'AUTH_TOKEN') {
        authToken = event.data.token;
        currentUser = JSON.parse(event.data.user || '{}');
        document.getElementById('status').innerText = 'Conectado como: ' + currentUser.name;
        document.getElementById('btnAction').disabled = false;
        // Iniciar lógica do app...
      }
    });

    // 2. Chamada à IA (Exemplo)
    document.getElementById('btnAction').addEventListener('click', async () => {
       if(!authToken) return;
       // UI Loading State...
       
       try {
         const resp = await fetch('/api/client/plugin/ai', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + authToken
            },
            body: JSON.stringify({
                plugin_id: PLUGIN_ID,
                user_prompt: "Texto do usuário para a IA processar..."
            })
         });
         const data = await resp.json();
         // Renderizar data.result...
       } catch (e) {
         console.error(e);
       }
    });
  </script>
</body>
</html>

[SOLICITAÇÃO DO USUÁRIO]
Descreva aqui o plugin que você deseja (Ex: "Um gerador de e-mails de cobrança", "Um analisador de leis municipais", etc).
`} 
                            />
                        </div>
                    </div>
                )}

                {/* TAB: INSTALL GUIDE */}
                {activeTab === 'install' && (
                    <div className="animate-fade-in-up space-y-8">
                        <div className="border-b border-slate-800 pb-6 mb-6">
                            <h2 className="text-3xl font-bold text-white mb-2">Como Instalar Plugins</h2>
                            <p className="text-slate-400">Transforme o código gerado pela IA em funcionalidade real no sistema.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white text-xl shrink-0 border border-slate-700">1</div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Gerar os Arquivos</h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Use o prompt da aba anterior no Google AI Studio. A IA vai gerar o código para <code>manifest.json</code> e <code>index.html</code>.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white text-xl shrink-0 border border-slate-700">2</div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Criar o ZIP</h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Salve os arquivos em uma pasta e compacte-os diretamente (não compacte a pasta, compacte os arquivos).
                                            <br/>
                                            <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded mt-2 inline-block">Ex: meudashboard.zip</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white text-xl shrink-0 border border-slate-700">3</div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Upload no Admin</h3>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Vá em <strong>Admin &gt; Loja de Plugins</strong> e clique em "Upload Plugin". O sistema fará a validação e instalação automática.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-inner">
                                <h4 className="font-bold text-white mb-4 text-sm uppercase">Estrutura do Arquivo ZIP</h4>
                                <div className="font-mono text-sm space-y-2">
                                    <div className="flex items-center gap-2 text-yellow-400">
                                        📁 meudashboard.zip
                                    </div>
                                    <div className="pl-6 border-l border-slate-700 ml-2 space-y-2">
                                        <div className="flex items-center gap-2 text-blue-300">
                                            📄 manifest.json <span className="text-slate-500 text-xs">(Obrigatório)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-emerald-300">
                                            📄 index.html <span className="text-slate-500 text-xs">(Obrigatório)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            📄 style.css <span className="text-slate-600 text-xs">(Opcional)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            📄 install.sql <span className="text-slate-600 text-xs">(Avançado)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: ARCHITECTURE */}
                {activeTab === 'architecture' && (
                    <div className="animate-fade-in-up">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Arquitetura de Segurança</h2>
                            <p className="text-slate-400">Entenda como o sandbox protege o sistema principal.</p>
                        </div>

                        <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-blue-900/20 rounded-full flex items-center justify-center text-4xl mb-4 border border-blue-500/30">🖥️</div>
                                    <h3 className="font-bold text-white mb-2">Host (React App)</h3>
                                    <p className="text-xs text-slate-400">Gerencia autenticação, roteamento e estado global. Injeta o token no plugin.</p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="h-1 w-full bg-slate-700 relative">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-1 text-[10px] text-slate-400 border border-slate-600 rounded">
                                            postMessage
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-emerald-900/20 rounded-full flex items-center justify-center text-4xl mb-4 border border-emerald-500/30">🧩</div>
                                    <h3 className="font-bold text-white mb-2">Plugin (Iframe)</h3>
                                    <p className="text-xs text-slate-400">Ambiente isolado. Não acessa localStorage ou Cookies do pai. Usa API Gateway.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB: DATABASE */}
                {activeTab === 'database' && (
                    <div className="animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-white mb-6">Schema SQL Reference</h2>
                        <CopyBlock 
                            title="Tabelas do Sistema (PostgreSQL)"
                            code={`
-- TABELAS PRINCIPAIS
users (id, email, password_hash, role, status)
plans (id, name, price, token_limit)
subscriptions (id, user_id, plan_id, status, end_date)

-- TABELAS DE PLUGINS
plugins (id VARCHAR(100), name, status, config, entry_point)
plan_plugins (plan_id, plugin_id) -- Controle de Acesso (ACL)

-- AUDITORIA & FINANCEIRO
requests_log (id, user_id, endpoint, cost_usd, timestamp)
payments (id, subscription_id, amount, date)
                            `}
                        />
                    </div>
                )}

            </div>
          </div>
      </div>
    </div>
  );
};