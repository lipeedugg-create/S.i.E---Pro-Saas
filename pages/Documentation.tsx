import React, { useState } from 'react';

interface DocumentationProps {
  onClose: () => void;
}

type TabType = 'manual' | 'deploy' | 'database' | 'backend' | 'ai-core';

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
    <div className="fixed inset-0 z-50 bg-[#0f172a] text-slate-300 overflow-hidden flex flex-col font-sans animate-fade-in">
      {/* Header */}
      <div className="h-16 bg-slate-950 border-b border-slate-800 flex justify-between items-center px-6 shadow-md shrink-0 z-10">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs">DOC</div>
           <div>
             <h1 className="text-white font-bold text-sm leading-tight">S.I.E. PRO - Central de Ajuda</h1>
             <p className="text-[10px] text-slate-500 font-mono">v5.2 Enterprise</p>
           </div>
        </div>
        <div className="flex items-center gap-4">
           {/* Desktop Tabs */}
           <div className="hidden lg:flex bg-slate-900 rounded-lg p-1 border border-slate-800 overflow-x-auto max-w-2xl">
              {[
                { id: 'deploy', label: 'Instalação & Setup' },
                { id: 'database', label: 'Banco de Dados' },
                { id: 'manual', label: 'Manual do Usuário' },
                { id: 'backend', label: 'Backend API' },
                { id: 'ai-core', label: 'Inteligência Artificial' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
           </div>
           
           <button 
             onClick={onClose}
             className="bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/30 px-4 py-2 rounded text-xs font-bold transition-colors flex items-center gap-2"
           >
             <span>✕</span> FECHAR
           </button>
        </div>
      </div>

      {/* Mobile Tabs Dropdown */}
      <div className="lg:hidden p-4 bg-slate-900 border-b border-slate-800">
         <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-lg p-2.5 focus:border-blue-500 outline-none"
         >
            <option value="deploy">🚀 Instalação & Setup</option>
            <option value="database">💾 Banco de Dados</option>
            <option value="manual">📖 Manual do Usuário</option>
            <option value="backend">⚙️ Backend & API</option>
            <option value="ai-core">🧠 Inteligência Artificial</option>
         </select>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#0b1120] scroll-smooth">
        <div className="max-w-5xl mx-auto pb-20">
          
          {/* TAB: DEPLOY & INSTALLATION */}
          {activeTab === 'deploy' && (
             <div className="animate-fade-in space-y-8">
              <div className="text-center md:text-left mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Instalação & Configuração</h2>
                  <p className="text-slate-400">Guia completo para configurar o ambiente Local (Dev) e Servidores VPS (Ubuntu). Siga os passos abaixo.</p>
              </div>

              {/* 1. LOCALHOST MANUAL GUIDE */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg">
                 <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                     <span className="text-emerald-400">💻</span> 1. Instalação Local (Passo a Passo)
                 </h3>
                 <div className="space-y-4 text-sm text-slate-300">
                     <div className="flex gap-4">
                         <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">1</div>
                         <div>
                             <h4 className="font-bold text-white">Instalar Pré-requisitos</h4>
                             <p className="text-slate-400 text-xs mt-1">
                                 Certifique-se de ter instalado: <a href="https://nodejs.org" target="_blank" className="text-blue-400 hover:underline">Node.js (v18+)</a> e <a href="https://www.postgresql.org/download/" target="_blank" className="text-blue-400 hover:underline">PostgreSQL</a>.
                             </p>
                         </div>
                     </div>
                     <div className="flex gap-4">
                         <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">2</div>
                         <div>
                             <h4 className="font-bold text-white">Criar Banco de Dados</h4>
                             <p className="text-slate-400 text-xs mt-1">
                                 Abra seu terminal ou PGAdmin e crie o banco:
                                 <code className="block bg-slate-950 p-2 mt-1 rounded text-emerald-400">CREATE DATABASE sie_pro;</code>
                             </p>
                         </div>
                     </div>
                     <div className="flex gap-4">
                         <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">3</div>
                         <div>
                             <h4 className="font-bold text-white">Configurar Variáveis de Ambiente (.env)</h4>
                             <p className="text-slate-400 text-xs mt-1">
                                 Crie um arquivo chamado <code>.env</code> na raiz do projeto e preencha conforme o modelo abaixo.
                             </p>
                         </div>
                     </div>
                 </div>

                 <div className="mt-6">
                    <CopyBlock 
                        title="Arquivo .env (Modelo Completo)"
                        lang="env"
                        code={`
PORT=3000
NODE_ENV=development

# Configuração do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sie_pro
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres

# Segurança (Gere chaves longas e aleatórias)
# Comando para gerar: openssl rand -hex 32
JWT_SECRET=super_secret_key_change_me_in_production_12345
CRON_KEY=secure_cron_key_123

# Integração Google Gemini (Obtenha em aistudio.google.com)
API_KEY=AIzaSy...
                        `}
                    />
                 </div>
              </div>

              {/* 2. AUTOMATED SCRIPT */}
              <div className="bg-slate-900/50 p-6 rounded-xl border border-blue-900/30">
                  <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Script Automático (Localhost)
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                      Se preferir, use este script bash para instalar dependências, gerar chaves seguras automaticamente e criar o arquivo .env.
                  </p>
                  
                  <CopyBlock 
                    title="setup_local.sh"
                    lang="bash"
                    code={`
#!/bin/bash

echo "🚀 Iniciando Setup S.I.E. PRO (Localhost)..."

# 1. Instalar Dependências
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando pacotes NPM..."
    npm install
else
    echo "✅ Dependências já instaladas."
fi

# 2. Gerar Chaves de Segurança
echo "🔑 Gerando chaves criptográficas..."
JWT_SECRET=$(openssl rand -hex 32)
CRON_KEY=$(openssl rand -hex 16)

# 3. Criar arquivo .env
if [ ! -f ".env" ]; then
    echo "📝 Criando arquivo .env Interativo..."
    
    read -p "Digite sua GOOGLE_API_KEY (Gemini): " API_KEY
    read -p "Digite senha do Postgres local (User: postgres): " DB_PASS

    cat <<EOF > .env
PORT=3000
NODE_ENV=development

# Database (PostgreSQL Local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sie_pro
DB_USER=postgres
DB_PASSWORD=$DB_PASS

# Security (Auto-Generated)
JWT_SECRET=$JWT_SECRET
CRON_KEY=$CRON_KEY

# AI Services
API_KEY=$API_KEY
EOF
    echo "✅ Arquivo .env criado com sucesso!"
else
    echo "⚠️  Arquivo .env já existe. Pulando criação."
fi

# 4. Iniciar Servidor
echo ""
echo "🎉 Setup Finalizado!"
echo "👉 Execute em um terminal: npm run dev"
echo "👉 Execute em outro terminal: npm start"
                    `}
                  />
              </div>
            </div>
          )}

          {/* TAB: DATABASE (Schema + Data) */}
          {activeTab === 'database' && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">💾 Estrutura & Dados Iniciais</h2>
                <p className="text-slate-400 mb-4">
                    Abaixo estão os scripts para criar a estrutura do banco (Schema) e popular com dados de exemplo (Seed) para que o sistema não inicie vazio.
                </p>
              </div>

              {/* SCHEMA */}
              <CopyBlock 
                title="1. Structure (Schema.sql)" 
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
    avatar TEXT,
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

              {/* SEED DATA */}
              <CopyBlock 
                title="2. Seed Data (Dados Iniciais Completos)" 
                lang="sql"
                warning={true}
                code={`
-- Execute este script para popular o banco com dados de exemplo funcionais.
-- Senha padrão para todos os usuários: "123456"

-- 1. Inserir Clientes de Teste
-- NOTA: O Admin (admin@sie.pro) já é criado automaticamente pelo sistema.
INSERT INTO users (id, name, email, password_hash, role, status, phone) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'TechSolutions Corp', 'demo@sie.pro', '$2a$10$X7T5w.z/k/j/h/g/f/e/d/c/b/a/0', 'client', 'active', '+55 11 99999-9999'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Construtora Exemplo', 'financeiro@construtora.com', '$2a$10$X7T5w.z/k/j/h/g/f/e/d/c/b/a/0', 'client', 'active', '+55 21 88888-8888'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Cliente Bloqueado Ltda', 'bloqueado@sie.pro', '$2a$10$X7T5w.z/k/j/h/g/f/e/d/c/b/a/0', 'client', 'suspended', '+55 31 77777-7777')
ON CONFLICT (email) DO NOTHING;

-- 2. Inserir Planos de Assinatura
INSERT INTO plans (id, name, price, description) VALUES
('starter', 'Starter', 99.00, 'Monitoramento básico para pequenas empresas. Atualização diária.'),
('pro', 'Enterprise Pro', 299.00, 'IA Avançada, Tempo Real e Alertas de Crise.'),
('gov', 'Governo & Public', 1500.00, 'Infraestrutura dedicada para órgãos públicos e grandes volumes.')
ON CONFLICT (id) DO NOTHING;

-- 3. Inserir Plugins (Marketplace)
-- O ID fixo garante que o sistema reconheça o plugin "Raio-X"
INSERT INTO plugins (id, name, category, price, status, icon, description) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99', 'Raio-X Administrativo', 'utility', 50.00, 'active', '🏛️', 'Consulta automatizada de estruturas governamentais via IA.'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'Análise de Sentimento Pro', 'analytics', 29.90, 'active', '🧠', 'Classificação avançada de tom (Positivo/Negativo) em notícias.'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'Exportador PDF', 'utility', 15.00, 'active', '📄', 'Gerar relatórios executivos em PDF com 1 clique.')
ON CONFLICT (id) DO NOTHING;

-- 4. Vincular Plugins aos Planos (Quem pode usar o quê)
INSERT INTO plan_plugins (plan_id, plugin_id) VALUES
('pro', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99'), -- Pro tem Raio-X
('gov', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99'), -- Gov tem Raio-X
('pro', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b01')  -- Pro tem Sentimento
ON CONFLICT DO NOTHING;

-- 5. Criar Assinaturas para os Usuários
INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'pro', 'active', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'starter', 'active', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'starter', 'expired', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- 6. Configuração de Monitoramento (Para o cliente Demo)
INSERT INTO monitoring_configs (user_id, keywords, urls_to_track, frequency, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 
 '["Corrupção", "Licitação", "Fraude", "Obras Atrasadas"]', 
 '["https://g1.globo.com/politica", "https://cnnbrasil.com.br"]', 
 'hourly', 
 true)
ON CONFLICT (user_id) DO NOTHING;

-- 7. Histórico Financeiro (Pagamentos Simulados)
INSERT INTO payments (subscription_id, amount, payment_date, reference_id, notes, admin_recorded_by)
SELECT s.id, 299.00, CURRENT_DATE - INTERVAL '10 days', 'PIX-ABC-123', 'Pagamento mensalidade PRO', NULL
FROM subscriptions s WHERE s.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01';

INSERT INTO payments (subscription_id, amount, payment_date, reference_id, notes, admin_recorded_by)
SELECT s.id, 99.00, CURRENT_DATE - INTERVAL '35 days', 'PIX-XYZ-987', 'Pagamento Starter (Mês Passado)', NULL
FROM subscriptions s WHERE s.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02';
                `}
              />
            </div>
          )}

          {/* TAB: USER MANUAL */}
          {activeTab === 'manual' && (
            <div className="animate-fade-in space-y-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Manual do Usuário</h2>
                    <p className="text-slate-400">Guia de referência para funcionalidades Administrativas e Área do Cliente.</p>
                </div>

                {/* Section 1: User Management */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                    <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold">1</span>
                        <h3 className="text-xl font-bold text-white">Gestão de Usuários (CRM)</h3>
                    </div>
                    <div className="p-6 space-y-4 text-slate-300 text-sm leading-relaxed">
                        <p>
                            A nova interface de <strong>Gestão de Usuários</strong> permite controle total sobre o ciclo de vida dos clientes. 
                            Acesse via menu lateral > <em>Gestão de Usuários</em>.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <h4 className="font-bold text-white mb-2">Campos de Perfil</h4>
                                <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                                    <li><strong>Status da Conta:</strong> Active, Inactive (Bloqueado), Suspended.</li>
                                    <li><strong>Contato:</strong> Telefone/WhatsApp para CRM.</li>
                                    <li><strong>Role:</strong> Admin (Acesso total) ou Client (Acesso restrito).</li>
                                </ul>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <h4 className="font-bold text-white mb-2">Bloqueio de Acesso</h4>
                                <p className="text-xs text-slate-400">
                                    Ao alterar o status de um usuário para <code>inactive</code>, o sistema invalida imediatamente o login.
                                    Na próxima tentativa de navegação ou validação de token, o usuário será desconectado forçadamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Impersonation */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                    <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-amber-900/30 text-amber-400 flex items-center justify-center font-bold">2</span>
                        <h3 className="text-xl font-bold text-white">Impersonation (Login como Usuário)</h3>
                    </div>
                    <div className="p-6 space-y-4 text-slate-300 text-sm leading-relaxed">
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <p className="mb-4">
                                    O recurso de <strong>Impersonation</strong> permite que um Administrador acesse a conta de qualquer cliente sem saber a senha original.
                                    Isso é essencial para suporte técnico e verificação de bugs visuais no dashboard do cliente.
                                </p>
                                <h4 className="font-bold text-white text-xs uppercase mb-2">Como funciona a segurança:</h4>
                                <ol className="list-decimal pl-5 space-y-2 text-xs text-slate-400">
                                    <li>O Admin clica em "Login" na lista de usuários.</li>
                                    <li>O backend verifica as credenciais do Admin (JWT atual).</li>
                                    <li>O backend gera um <strong>Token Temporário (1h)</strong> em nome do usuário alvo.</li>
                                    <li>O frontend recebe este token e substitui o token atual no <code>localStorage</code>.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Client Area (NEW) */}
                <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
                    <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-emerald-900/30 text-emerald-400 flex items-center justify-center font-bold">3</span>
                        <h3 className="text-xl font-bold text-white">Área do Cliente (Minha Conta)</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300 text-sm">
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-white mb-2 flex items-center gap-2">👤 Perfil & Avatar</h4>
                            <p className="text-xs text-slate-400">
                                O usuário pode fazer upload de uma foto de perfil (armazenada em Base64 no banco) ou utilizar o avatar padrão do sistema gerado com suas iniciais. Também permite a atualização de senha segura via hash (Bcrypt).
                            </p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-white mb-2 flex items-center gap-2">📊 Cotas de Uso (AI)</h4>
                            <p className="text-xs text-slate-400">
                                Exibe o consumo de tokens da API Gemini em tempo real. Uma barra de progresso mostra quanto da cota mensal do plano foi utilizada, permitindo ao usuário gerenciar seu volume de requisições.
                            </p>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-white mb-2 flex items-center gap-2">💳 Histórico Financeiro</h4>
                            <p className="text-xs text-slate-400">
                                Lista transparente de todos os pagamentos e renovações. Permite ao cliente verificar datas, valores e IDs de transação para conciliação contábil.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* TAB: AI CORE */}
          {activeTab === 'ai-core' && (
             <div className="animate-fade-in space-y-8">
                <div className="bg-slate-900 p-6 rounded-lg border border-slate-700 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">🧠 Integração Gemini 2.5 Flash</h2>
                    <p className="text-slate-400">
                        O núcleo de inteligência utiliza o modelo <code>gemini-2.5-flash</code> para alta performance e baixo custo.
                        Abaixo detalhamos a engenharia de prompt e o cálculo financeiro implementados.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cost Calculation */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4">💰 Cálculo de Custos (Tokenização)</h3>
                        <div className="space-y-4 text-sm text-slate-300">
                            <p>O sistema audita cada chamada à API e calcula o custo em USD com base na tabela oficial:</p>
                            <ul className="space-y-2 bg-slate-900 p-3 rounded border border-slate-800 font-mono text-xs">
                                <li className="flex justify-between">
                                    <span>Input Tokens (Prompt):</span>
                                    <span className="text-emerald-400">$0.000125 / 1k</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Output Tokens (Resposta):</span>
                                    <span className="text-blue-400">$0.000375 / 1k</span>
                                </li>
                            </ul>
                            <p className="text-xs text-slate-500 italic">
                                *Implementação em <code>services/collectorService.js</code> e <code>services/logService.js</code>.
                            </p>
                        </div>
                    </div>

                    {/* JSON Mode Strategy */}
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                        <h3 className="text-lg font-bold text-white mb-4">⚙️ Prompt Engineering (JSON Mode)</h3>
                        <p className="text-sm text-slate-300 mb-4">
                            Para garantir a integridade dos dados no banco SQL, utilizamos <strong>System Instructions</strong> estritas que forçam o modelo a retornar apenas JSON válido, sem blocos de código Markdown.
                        </p>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[10px] text-purple-300">
                            "Retorne APENAS um JSON com este formato... Não use markdown (\`\`\`json)."
                        </div>
                    </div>
                </div>
                
                <CopyBlock 
                    title="Exemplo de Coleta (collectorService.js)"
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

                <CopyBlock 
                    title="Raio-X Administrativo (Search Grounding)"
                    lang="javascript"
                    code={`
// Exemplo de uso de ferramentas de busca com Gemini (Plugin)
// services/aiSearchService.js

const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: "Pesquise quem é o prefeito atual de Curitiba...",
    config: {
        // System Instructions definem a 'persona' e regras negativas
        systemInstruction: "Você é um auditor. Não invente nomes...",
        tools: [{ googleSearch: {} }], // Grounding com dados reais da Web
        temperature: 0.1 // Baixa criatividade para precisão factual
    }
});
                    `}
                />
             </div>
          )}
          
          {/* TAB: BACKEND */}
          {activeTab === 'backend' && (
             <div className="animate-fade-in space-y-6">
                <h2 className="text-2xl font-bold text-white mb-4">Arquitetura Backend Node.js</h2>
                
                <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 mb-6">
                    <h3 className="text-white font-bold mb-4">⚙️ Serviços Autônomos</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-4 rounded border border-slate-700">
                            <h4 className="font-bold text-emerald-400 text-sm mb-2">Scheduler.js</h4>
                            <p className="text-xs text-slate-400">
                                Loop de verificação (60s tick) que dispara o <code>collectorService</code> para tarefas agendadas (Hourly/Daily) sem intervenção humana.
                            </p>
                        </div>
                        <div className="bg-slate-900 p-4 rounded border border-slate-700">
                            <h4 className="font-bold text-blue-400 text-sm mb-2">LogService.js</h4>
                            <p className="text-xs text-slate-400">
                                Auditoria centralizada. Registra todo consumo de tokens (Input/Output) na tabela <code>requests_log</code> para cálculo de custos.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800 p-5 rounded-lg border border-slate-700">
                    <h3 className="text-white font-bold mb-4">Camada de Segurança (Security Layer)</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                            <span className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded text-xs font-mono border border-purple-900/50">Centralized Auth</span>
                            <p className="text-sm text-slate-400">
                                <code>config/db.js</code> atua como Fonte Única da Verdade para <code>JWT_SECRET</code>, prevenindo falhas de validação de sessão em produção.
                            </p>
                        </div>
                        <div className="flex gap-3 items-start">
                             <span className="bg-orange-900/30 text-orange-400 px-2 py-1 rounded text-xs font-mono border border-orange-900/50">Impersonation API</span>
                             <p className="text-sm text-slate-400">
                                 Rota <code>POST /users/:id/impersonate</code> gera tokens temporários de curto prazo (1h) para suporte administrativo.
                             </p>
                        </div>
                    </div>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};