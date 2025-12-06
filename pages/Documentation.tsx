import React, { useState } from 'react';

interface DocumentationProps {
  onClose: () => void;
}

type TabType = 'database' | 'backend' | 'frontend' | 'financial' | 'crm' | 'ai-core' | 'deploy';

export const Documentation: React.FC<DocumentationProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('ai-core');

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
             <p className="text-[10px] text-slate-500 font-mono">v3.6 - Gemini AI, CRM & Architecture</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex bg-slate-900 rounded-lg p-1 border border-slate-800 overflow-x-auto max-w-lg">
              {(['ai-core', 'crm', 'financial', 'backend', 'frontend', 'database', 'deploy'] as TabType[]).map(tab => (
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
          
          {/* TAB: AI CORE (Google Gemini) */}
          {activeTab === 'ai-core' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">🧠 Gemini AI Integration</h2>
                    <p className="text-slate-400">
                        O coração do S.I.E. PRO utiliza a <strong>Google Gemini API</strong> para processamento de linguagem natural, análise de sentimento e geração de inteligência estruturada (JSON).
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                   <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                      <h3 className="text-blue-400 font-bold mb-2">Modelos Utilizados</h3>
                      <ul className="space-y-2 text-sm text-slate-400">
                          <li><code>gemini-2.5-flash</code>: Monitoramento em tempo real e Análise de Sentimento (Alta velocidade, baixo custo).</li>
                      </ul>
                   </div>
                   <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                      <h3 className="text-purple-400 font-bold mb-2">Funcionalidades AI</h3>
                      <ul className="space-y-2 text-sm text-slate-400">
                          <li>• JSON Mode (Structured Output)</li>
                          <li>• System Instructions (Role Play)</li>
                          <li>• Token Usage Audit (Financial)</li>
                      </ul>
                   </div>
                   <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                      <h3 className="text-emerald-400 font-bold mb-2">Serviços Implementados</h3>
                      <ul className="space-y-2 text-sm text-slate-400">
                          <li><code>collectorService.js</code>: Análise de notícias.</li>
                          <li><code>aiSearchService.js</code>: Raio-X Governamental.</li>
                      </ul>
                   </div>
                </div>

                <h3 className="text-white font-bold mb-4">Exemplo de Implementação (SDK v1.31)</h3>
                <CopyBlock 
                    title="services/aiSearchService.js"
                    lang="javascript"
                    code={`
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        responseMimeType: 'application/json', // Garante resposta estruturada
        temperature: 0.1, // Reduz alucinações para dados factuais
    }
});

// A resposta já vem pronta para parse
const data = JSON.parse(response.text);
                    `}
                />

                <h3 className="text-white font-bold mb-4">Prompt Engineering: Raio-X Administrativo</h3>
                <p className="text-sm text-slate-400 mb-2">Prompt utilizado para gerar relatórios de transparência pública:</p>
                <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap">
{`"Você é o SISTEMA SIE (Strategic Intelligence Enterprise).
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
}"`}
                </div>
             </div>
          )}

          {/* TAB: CRM */}
          {activeTab === 'crm' && (
             <div className="animate-fade-in space-y-6">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">👥 Gestão de Usuários (CRM)</h2>
                    <p className="text-slate-400">
                        O novo painel CRM oferece controle granular sobre o ciclo de vida do cliente, incluindo status da conta, impersonação e histórico de acesso.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                      <h3 className="text-blue-400 font-bold mb-2">Funcionalidades do Painel</h3>
                      <ul className="space-y-3 text-sm text-slate-400">
                          <li><strong>KPIs em Tempo Real:</strong> Cards no topo exibindo total de usuários, ativos, inativos e novos cadastros no mês.</li>
                          <li><strong>Filtros Avançados:</strong> Busca por texto e filtros combinados por Status (Ativo/Inativo) e Plano.</li>
                          <li><strong>Status Lifecycle:</strong> Admins podem suspender ou reativar contas instantaneamente via <code>PATCH /users/:id/status</code>.</li>
                      </ul>
                   </div>
                   <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                      <h3 className="text-purple-400 font-bold mb-2">Admin Impersonation</h3>
                      <p className="text-sm text-slate-400 mb-2">
                          Permite que administradores acessem a conta de um cliente para suporte técnico sem solicitar senha.
                      </p>
                      <div className="bg-black p-3 rounded border border-slate-700 text-xs font-mono text-green-400">
                          POST /api/admin/users/:id/impersonate<br/>
                          Response: {'{ "token": "JWT_SCOPED_TO_USER", ... }'}
                      </div>
                   </div>
                </div>

                <CopyBlock 
                    title="User Object Schema (v3.1)"
                    lang="json"
                    code={`
{
  "id": "uuid...",
  "name": "Cliente Enterprise",
  "status": "active", // 'active' | 'inactive' | 'suspended'
  "last_login": "2024-10-15T10:00:00Z", // Atualizado no login
  "phone": "+55 11 9999-9999",
  "role": "client"
}
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
                        Componentes refatorados para suportar a complexidade do novo CRM e funcionalidades financeiras.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-slate-800 p-4 rounded border border-slate-700">
                        <h4 className="text-white font-bold mb-2">AdminUsers.tsx (Dashboard)</h4>
                        <p className="text-sm text-slate-400">Refatorado de uma lista simples para um Dashboard completo com tabela rica, avatares, badges de status coloridos e barra de ferramentas de filtragem.</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded border border-slate-700">
                        <h4 className="text-white font-bold mb-2">UserModal.tsx (Editor)</h4>
                        <p className="text-sm text-slate-400">Agora implementa um sistema de <strong>Abas</strong>:</p>
                        <ul className="list-disc list-inside text-xs text-slate-500 mt-1">
                            <li><strong>Perfil:</strong> Dados básicos e senha.</li>
                            <li><strong>Assinatura:</strong> Histórico financeiro e ajuste manual de datas.</li>
                            <li><strong>Segurança:</strong> Zona de perigo (Bloqueio/Banimento).</li>
                        </ul>
                    </div>
                </div>
             </div>
          )}

          {/* TAB: FINANCIAL */}
          {activeTab === 'financial' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">💰 Gestão Financeira (v2.0)</h2>
                <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 mb-6">
                    <h3 className="text-emerald-400 font-bold mb-2">Lógica de Renovação Atômica</h3>
                    <p className="text-sm text-slate-400 mb-4">
                        O backend utiliza transações SQL (<code>BEGIN/COMMIT</code>) para garantir integridade. Ao registrar um pagamento:
                    </p>
                    <ol className="list-decimal list-inside text-sm text-slate-300 space-y-1">
                        <li>O pagamento é inserido na tabela <code>payments</code>.</li>
                        <li>A assinatura é atualizada automaticamente.</li>
                        <li>Se estava vencida: Renova a partir de HOJE + 30 dias.</li>
                        <li>Se estava ativa: Soma 30 dias ao vencimento atual.</li>
                    </ol>
                </div>
             </div>
          )}

          {/* TAB: BACKEND */}
          {activeTab === 'backend' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Backend & API Routes</h2>
                <div className="bg-slate-800 p-4 rounded border border-slate-700 overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-400 font-mono">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-500">
                        <th className="pb-2">Método</th>
                        <th className="pb-2">Endpoint</th>
                        <th className="pb-2">Descrição</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr><td className="py-2 text-blue-400">GET</td><td>/api/admin/users</td><td>Lista enriquecida (CRM)</td></tr>
                      <tr><td className="py-2 text-purple-400">POST</td><td>/api/admin/users/:id/impersonate</td><td>Gerar Token de Impersonation</td></tr>
                      <tr><td className="py-2 text-yellow-400">PATCH</td><td>/api/admin/users/:id/status</td><td>Alterar Status (active/inactive)</td></tr>
                      <tr><td className="py-2 text-green-400">POST</td><td>/api/client/tools/public-admin-search</td><td>Plugin IA: Raio-X Administrativo</td></tr>
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {/* TAB: DATABASE */}
          {activeTab === 'database' && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Schema SQL (v3.1)</h2>
              <p className="text-slate-400 text-sm mb-4">Campos adicionados para suporte ao CRM e Auditoria.</p>
              <CopyBlock 
                title="Tabela Users (Atualizada)" 
                lang="sql"
                code={`
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Campos Básicos
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'client',
    -- Novos Campos v3.1
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    phone VARCHAR(50),
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
                `}
              />
            </div>
          )}

          {/* TAB: DEPLOY */}
          {activeTab === 'deploy' && (
             <div className="animate-fade-in space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Deploy em Produção</h2>
              <div className="bg-emerald-950/20 border border-emerald-800 p-6 rounded-lg mb-8">
                  <h3 className="text-emerald-400 font-bold text-lg mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Status: Production Ready
                  </h3>
                  <p className="text-slate-300 text-sm">
                      A aplicação utiliza variáveis de ambiente para chaves de API (Gemini) e conexão de banco de dados. 
                  </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};