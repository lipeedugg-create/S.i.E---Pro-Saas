# S.I.E. PRO (v2.0) - Strategic Intelligence Enterprise

**S.I.E. PRO** é uma plataforma SaaS full-stack para monitoramento de reputação estratégica e inteligência governamental. Utiliza **Google Gemini 2.5 Flash** para analisar notícias, sinais sociais e dados de transparência pública em tempo real.

## 🚀 Tech Stack

- **Frontend:** React 19, TailwindCSS, Vite.
- **Backend:** Node.js, Express.
- **Database:** PostgreSQL (via `pg` pool otimizado).
- **AI Core:** Google Gemini API (`gemini-2.5-flash`).
- **Authentication:** JWT (JSON Web Tokens) com RBAC e Impersonation.

---

## 🛠️ Instalação e Setup

### 1. Pré-requisitos
- Node.js v18+
- PostgreSQL Database

### 2. Variáveis de Ambiente
Crie um arquivo `.env` na raiz:

```env
PORT=3000
NODE_ENV=development

# Database Connection
# Exemplo Local
DATABASE_URL=postgres://postgres:senha@localhost:5432/sie_pro
# Exemplo Cloud (Neon/Render) - O sistema detecta SSL automaticamente
# DATABASE_URL=postgres://user:pass@ep-xyz.us-east-1.aws.neon.tech/sie_pro?sslmode=require

# Security
JWT_SECRET=super_secret_key_change_in_production
CRON_KEY=secure_key_for_triggering_jobs

# AI Configuration
API_KEY=your_google_gemini_api_key
```

### 3. Migração de Banco de Dados
O sistema possui **Auto-Migration**. Ao iniciar o servidor pela primeira vez (`npm start`), o script `config/initDb.js` criará todas as tabelas necessárias e o usuário Admin padrão.

### 4. Executar a Aplicação

**Modo Desenvolvimento:**
```bash
# Terminal 1: Frontend (Vite)
npm run dev

# Terminal 2: Backend (Express)
npm start
```

**Modo Produção:**
```bash
# Build do React App
npm run build

# Iniciar Servidor (Serve o build estático + API)
node server.js
```

---

## 🔑 Funcionalidades Principais (v2.0 Enterprise)

### 1. CRM & Gestão de Usuários (Novo)
- **Painel Admin:** Listagem completa com filtros de status e plano.
- **Status de Conta:** Bloqueie ou ative usuários (`active`, `inactive`, `suspended`).
- **Impersonation:** Login como cliente. O admin pode acessar a visão do usuário para suporte sem saber a senha.

### 2. Marketplace de Plugins
- **Arquitetura Modular:** Instale funcionalidades extras via upload de arquivos `.ZIP`.
- **Raio-X Administrativo:** Ferramenta nativa que gera relatórios de transparência municipal usando IA.
- **AI Gateway:** Plugins frontend podem acessar o Gemini de forma segura e auditada.

### 3. Gestão Financeira
- **Renovação Atômica:** O registro de pagamento estende automaticamente a validade da assinatura.
- **Analytics:** Dashboard de MRR (Receita Recorrente Mensal) em tempo real.

### 4. Monitoramento & IA
- **Crawler Inteligente:** Varredura de URLs com análise de sentimento.
- **Auditoria de Custos:** Rastreamento preciso de consumo de tokens (Input/Output) convertido para Dólar.

---

## 📂 Estrutura de Pastas

- `/config` - Conexão de banco e scripts de init.
- `/routes` - Definições de API (Auth, Admin, Client).
- `/services` - Lógica de negócio (Gemini, Logs, Scheduler).
- `/src` - Código fonte React (Pages, Components).
- `/plugins` - Diretório de arquivos estáticos dos plugins instalados.
