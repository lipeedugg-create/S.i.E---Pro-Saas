# 1. Mapa do Projeto (S.I.E. PRO v2.0)

Arquitetura Backend Node.js/Express + Frontend React 19.

```text
/sie-pro-saas
├── .env                  # Configurações de DB, JWT e CRON_KEY
├── package.json          # Dependências: express, pg, bcryptjs, jwt, dotenv, @google/genai
├── server.js             # Ponto de entrada (API Gateway + Static Serve + Scheduler)
├── config/
│   ├── db.js             # Conexão PostgreSQL (Pool Otimizado com SSL)
│   └── initDb.js         # Script de Inicialização e Auto-Migration (Schema v2.0)
├── middleware/
│   └── auth.js           # Funções authenticate (JWT) e authorizeAdmin
├── services/
│   ├── logService.js     # CRÍTICO: Registra custos (requests_log)
│   ├── collectorService.js # CORE: Crawler + Análise Gemini 2.5 Flash
│   ├── aiSearchService.js  # PLUGIN: Lógica do Raio-X Administrativo (Public Admin Search)
│   └── scheduler.js      # CRON: Gerenciador de tarefas em background (60s tick)
└── routes/
    ├── auth.js           # Login, Register, Recover, Public Plans
    ├── admin.js          # Controle Total: 
    │                     # - Users (CRUD, Impersonate, Status)
    │                     # - Plans (CRUD)
    │                     # - Plugins (Upload, Config, Toggle)
    │                     # - Payments (Manual Entry)
    ├── client.js         # Área do Cliente: 
    │                     # - Dashboard (Items Feed)
    │                     # - Config (Keywords/URLs)
    │                     # - Profile & Financials
    │                     # - Generic AI Plugin Gateway
    └── monitoring.js     # Webhook para triggers externos
```

# 2. Funcionalidades Chave (Backend)

### User Management (Admin)
*   **CRUD Completo:** Criação, edição e listagem de usuários.
*   **Gestão de Status:** Bloqueio (`suspended`) e ativação (`active`) de contas.
*   **Impersonation:** Rota `POST /users/:id/impersonate` gera token de acesso temporário para o admin logar como cliente.

### Plugin System
*   **Estrutura:** Plugins são pastas estáticas servidas em `/plugins/:id`.
*   **Isolamento:** Rodam em `iframe` com sandbox no frontend.
*   **Comunicação:** Usam `window.postMessage` para handshake de token.
*   **AI Gateway:** Rota `POST /client/plugin/ai` permite que plugins usem o Gemini sem expor a API Key no frontend.

### Financial Core
*   **Pagamentos Manuais:** Registro de entradas via Admin que estendem automaticamente a data de `end_date` da assinatura.
*   **Auditoria de Uso:** Cada request para o Gemini é logado em `requests_log` com custo calculado (Tokens In/Out).

# 3. Referência Técnica e Documentação

Arquivos essenciais para manutenção e escalabilidade do sistema:

*   **`DATABASE_SCHEMA.md`**: Definição completa das tabelas SQL, relacionamentos, tipos de dados e scripts de seed inicial.
*   **`API_REFERENCE.md`**: Documentação dos endpoints REST, métodos, payloads e respostas.
*   **`PLUGIN_MANUAL.md`**: Guia para desenvolvimento, empacotamento (.zip) e upload de novos plugins.
*   **`README.md`**: Guia de instalação, variáveis de ambiente e comandos de execução.