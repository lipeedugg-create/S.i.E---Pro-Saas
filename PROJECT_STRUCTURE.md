# 1. Mapa do Projeto (Backend Node.js/Express)

Conforme especificação da arquitetura S.I.E. PRO (v5.0 Enterprise):

```text
/sie-pro-saas
├── .env                  # Configurações de DB, JWT e CRON_KEY
├── package.json          # Dependências: express, pg, bcryptjs, jwt, dotenv, @google/genai
├── server.js             # Ponto de entrada (API Gateway + Static Serve)
├── config/
│   ├── db.js             # Conexão PostgreSQL (Pool com suporte SSL)
│   └── initDb.js         # Script de Inicialização e Auto-Migration (Schema v5.0)
├── middleware/
│   └── auth.js           # Funções authenticate (JWT) e authorizeAdmin
├── services/
│   ├── logService.js     # CRÍTICO: Registra custos (requests_log)
│   ├── collectorService.js # CORE: Crawler + Análise Gemini 2.5 Flash
│   ├── aiSearchService.js  # PLUGIN: Lógica do Raio-X Administrativo (Public Admin Search)
│   └── scheduler.js      # CRON: Gerenciador de tarefas em background (60s tick)
└── routes/
    ├── auth.js           # Login e Validação de Sessão
    ├── admin.js          # Controle Total: CRUD Users, Plans, Plugins, Payments
    ├── client.js         # Área do Cliente: Dashboard, Config e Tools
    └── monitoring.js     # Webhook para triggers externos
```

# 2. Schema SQL Final (v5.0 Consolidated)

O sistema utiliza PostgreSQL com extensão `pgcrypto` para UUIDs.
O script `config/initDb.js` gerencia a criação e migração destas tabelas automaticamente.

### Tabelas Principais
1. **`users`**: Armazena credenciais, roles (admin/client) e status do CRM (active/inactive/suspended).
2. **`plans`**: Definição dos níveis de assinatura (Starter, Enterprise, etc).
3. **`plugins`**: Catálogo de módulos adicionais (Marketplace).
4. **`plan_plugins`**: Tabela pivô definindo quais planos acessam quais plugins.
5. **`subscriptions`**: Gerencia o ciclo de vida da assinatura e data de vencimento (`end_date`).

### Tabelas de Inteligência & Logs
6. **`monitoring_configs`**: Configurações do agente de coleta (keywords, urls, frequencia).
7. **`master_items`**: Armazena as notícias coletadas e os resumos gerados pela IA.
8. **`payments`**: Registro imutável de transações financeiras manuais.
9. **`requests_log`**: Auditoria detalhada de consumo de tokens da API Gemini para faturamento.

---

### Notas de Deploy
* **Inicialização:** O servidor executa `initDatabase()` ao iniciar. Se as tabelas não existirem, elas são criadas. Se existirem colunas faltando (ex: atualização de versão), elas são adicionadas via `ALTER TABLE`.
* **Admin Padrão:** O sistema cria automaticamente `admin@sie.pro` / `admin123` se nenhum usuário existir.
