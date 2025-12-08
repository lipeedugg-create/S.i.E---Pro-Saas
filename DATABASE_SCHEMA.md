# S.I.E. PRO v2.0 - Database Schema Reference

Este documento detalha a estrutura do banco de dados PostgreSQL utilizado no S.I.E. PRO. O sistema utiliza a extensão `pgcrypto` para geração de UUIDs e mantém integridade referencial estrita.

## 1. Configurações e Extensões

```sql
-- Habilita geração de UUIDs randômicos v4
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

## 2. Tabelas Principais (Core)

### `users`
Armazena todos os usuários do sistema (Clientes e Administradores).

| Coluna | Tipo | Constraints | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único. |
| `name` | VARCHAR(255) | NOT NULL | Nome completo. |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email de login. |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash Bcrypt. |
| `role` | VARCHAR(50) | CHECK ('admin', 'client') | Nível de acesso. |
| `status` | VARCHAR(20) | CHECK ('active', 'inactive', 'suspended') | Estado da conta. |
| `phone` | VARCHAR(50) | | Telefone de contato. |
| `avatar` | TEXT | | URL ou Base64 da foto de perfil. |
| `last_login` | TIMESTAMP | | Data do último acesso. |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Data de registro. |

### `plans`
Catálogo de planos de assinatura disponíveis.

| Coluna | Tipo | Constraints | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(50) | PRIMARY KEY | ID legível (slug), ex: 'pro'. |
| `name` | VARCHAR(100) | NOT NULL | Nome comercial do plano. |
| `price` | DECIMAL(10, 2) | NOT NULL | Valor mensal. |
| `description` | TEXT | | Lista de benefícios. |
| `token_limit` | BIGINT | DEFAULT 10000 | Cota mensal de tokens IA. |

### `subscriptions`
Gerencia o ciclo de vida da assinatura do usuário.

| Coluna | Tipo | Constraints | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | ID da assinatura. |
| `user_id` | UUID | FK -> users(id) ON DELETE CASCADE | Usuário assinante. |
| `plan_id` | VARCHAR(50) | FK -> plans(id) | Plano contratado. |
| `status` | VARCHAR(20) | DEFAULT 'active' | Estado da assinatura. |
| `start_date` | DATE | DEFAULT CURRENT_DATE | Início do ciclo. |
| `end_date` | DATE | | Data de expiração/renovação. |

---

## 3. Módulo de Plugins (Marketplace)

### `plugins`
Registro de extensões instaladas no sistema.

| Coluna | Tipo | Constraints | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | VARCHAR(100) | PRIMARY KEY | Slug único do plugin. |
| `name` | VARCHAR(100) | NOT NULL | Nome de exibição. |
| `version` | VARCHAR(20) | DEFAULT '1.0.0' | Versão semântica. |
| `status` | VARCHAR(50) | DEFAULT 'available' | 'available', 'installed', 'active'. |
| `config` | JSONB | DEFAULT '{}' | Configurações de IA (Prompts). |
| `entry_point` | VARCHAR(255) | | Caminho do arquivo principal (index.html). |

### `plan_plugins` (Pivot Table)
Controla quais planos têm acesso a quais plugins (ACL).

| Coluna | Tipo | Constraints |
| :--- | :--- | :--- |
| `plan_id` | VARCHAR(50) | FK -> plans(id), PK Composta |
| `plugin_id` | VARCHAR(100) | FK -> plugins(id), PK Composta |

---

## 4. Monitoramento e Inteligência

### `monitoring_configs`
Configurações do agente de coleta por usuário.

| Coluna | Tipo | Constraints | Descrição |
| :--- | :--- | :--- | :--- |
| `user_id` | UUID | PK, FK -> users(id) | 1:1 com Users. |
| `keywords` | JSONB | DEFAULT '[]' | Array de strings. |
| `urls_to_track` | JSONB | DEFAULT '[]' | Array de URLs alvo. |
| `frequency` | VARCHAR(20) | DEFAULT 'daily' | 'hourly' ou 'daily'. |
| `is_active` | BOOLEAN | DEFAULT true | Master switch do robô. |
| `last_run_at` | TIMESTAMP | | Timestamp da última execução. |

### `master_items`
Resultados processados pela IA (Feed de Notícias).

| Coluna | Tipo | Constraints | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | ID do item. |
| `user_id` | UUID | FK -> users(id) | Dono do dado. |
| `source_url` | TEXT | | Link original. |
| `ai_summary` | TEXT | | Resumo gerado pelo Gemini. |
| `detected_keywords` | JSONB | | Tags encontradas. |

---

## 5. Financeiro e Auditoria

### `payments`
Registro histórico de transações financeiras (Entradas).

| Coluna | Tipo | Constraints | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | ID do pagamento. |
| `subscription_id` | UUID | FK -> subscriptions(id) | Vinculo com assinatura. |
| `amount` | DECIMAL | NOT NULL | Valor pago. |
| `payment_date` | DATE | DEFAULT CURRENT_DATE | Data do pagamento. |
| `reference_id` | VARCHAR | | ID externo (PIX, Stripe). |
| `admin_recorded_by` | UUID | FK -> users(id) | Quem registrou (se manual). |

### `requests_log`
Log de consumo de API para Billing baseado em uso.

| Coluna | Tipo | Constraints | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | ID do log. |
| `user_id` | UUID | FK -> users(id) | Usuário que originou. |
| `endpoint` | VARCHAR | | Rota ou Ferramenta usada. |
| `request_tokens` | INT | | Tokens de entrada (Prompt). |
| `response_tokens` | INT | | Tokens de saída (Completion). |
| `cost_usd` | DECIMAL | | Custo calculado em Dólar. |

---

## 6. Dados Iniciais (Seed Data)

Ao iniciar o sistema (`config/initDb.js`), os seguintes dados são garantidos:

### Planos Padrão
```sql
INSERT INTO plans (id, name, price, description, token_limit) VALUES
('starter', 'Starter', 99.00, 'Monitoramento básico.', 10000),
('pro', 'Enterprise Pro', 299.00, 'IA Avançada e Tempo Real.', 1000000),
('gov', 'Governo & Public', 1500.00, 'Infraestrutura dedicada.', 5000000);
```

### Plugin Nativo
```sql
INSERT INTO plugins (id, name, category, status, entry_point) VALUES
('public-admin-search', 'Raio-X Administrativo', 'analytics', 'active', NULL);
```

### Acesso aos Plugins
```sql
INSERT INTO plan_plugins (plan_id, plugin_id) VALUES 
('pro', 'public-admin-search'),
('gov', 'public-admin-search');
```

### Usuário Administrador
*   **Email:** `admin@sie.pro`
*   **Senha:** `admin123` (Hash gerado via Bcrypt na inicialização)
*   **Role:** `admin`
