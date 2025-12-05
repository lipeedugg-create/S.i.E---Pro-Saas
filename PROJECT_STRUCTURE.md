# 1. Mapa do Projeto (Backend Node.js/Express)

Conforme especificação da arquitetura S.I.E. PRO (v2.0):

```text
/sie-pro-saas
├── .env                  # Configurações de DB, JWT e CRON_KEY
├── package.json          # Dependências: express, pg, bcryptjs, jwt, dotenv
├── server.js             # Ponto de entrada (API Gateway)
├── config/
│   └── db.js             # Conexão PostgreSQL (Pool)
├── middleware/
│   └── auth.js           # Funções authenticate (JWT) e authorizeAdmin
├── services/
│   ├── logService.js     # CRÍTICO: Registra custos (requests_log)
│   └── collectorService.js # CORE: Lógica de Coleta, Análise de IA Mockup e Persistência
└── routes/
    ├── auth.js           # Rota /api/auth/login
    ├── admin.js          # Controle Total: CRUD, /payment, /logs, /features-and-plans
    └── monitoring.js     # Usuário: /config, /dashboard, /trigger (Cron Job)
```

# 2. Schema SQL Final (Resumo)

Tabelas Implementadas:
1. features
2. plans
3. plan_features
4. users
5. subscriptions
6. user_monitoring_config
7. master_items
8. payments (Gestão Financeira)
9. requests_log (Auditoria de Custos)
