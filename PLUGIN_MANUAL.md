# Documentação do Plugin: Raio-X Administrativo (Public Admin Search)

**Versão:** 1.0.0  
**Status:** Produção  
**Dependências:** Google Gemini API (Model: `gemini-2.5-flash`)

---

## 1. Visão Geral

O módulo **Raio-X Administrativo** é uma ferramenta de transparência que permite aos usuários consultarem a estrutura hierárquica e política de qualquer município brasileiro. O sistema utiliza Inteligência Artificial Generativa para buscar, cruzar e estruturar dados de fontes públicas em tempo real.

### Principais Funcionalidades
1.  **Poder Executivo:** Identificação de Prefeito e Vice-Prefeito, incluindo partido e histórico profissional.
2.  **Poder Legislativo:** Listagem dos principais vereadores e mesa diretora.
3.  **Quadro Técnico:** Mapeamento de secretários e cargos comissionados chave, com estimativa salarial baseada em dados de transparência.

---

## 2. Modelo de Dados (Database Schema)

O plugin utiliza a infraestrutura existente do S.I.E. PRO, interagindo principalmente com as tabelas `plugins`, `plan_plugins` e `requests_log`.

### Tabela: `plugins` (Registro do Módulo)
| Coluna | Tipo | Valor Fixo para este Plugin | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | UUID | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99` | ID único fixo para versionamento. |
| `name` | VARCHAR | "Raio-X Administrativo" | Nome de exibição na loja. |
| `category` | VARCHAR | "utility" | Categoria de filtro. |
| `status` | VARCHAR | "active" | Define se está visível para usuários. |

### Fluxo de Auditoria (`requests_log`)
Cada consulta realizada pelo usuário gera um registro financeiro:
*   **Endpoint:** `TOOL_ADMIN_SEARCH`
*   **Custo:** Calculado baseada na tokenização do Gemini (Input + Output).

---

## 3. Arquitetura da API e IA

### Endpoint Backend
*   **Rota:** `POST /api/client/tools/public-admin-search`
*   **Auth:** Requer Token JWT Bearer.
*   **Body:** `{ "city": "Nome da Cidade" }`

### Estrutura do Prompt (Gemini 2.5)
O sistema injeta um prompt de sistema estrito para garantir a resposta em JSON (JSON Mode).

**Schema de Saída (JSON):**
```json
{
  "city": "string",
  "mayor": {
    "name": "string",
    "role": "Prefeito",
    "party": "string",
    "past_roles": ["string"]
  },
  "vice_mayor": { ... },
  "councilors": [
    { "name": "string", "role": "Vereador", "party": "string" }
  ],
  "key_servants": [
    { 
      "name": "string", 
      "department": "string", 
      "role_type": "Comissionado" | "Efetivo", 
      "estimated_salary": "string" 
    }
  ],
  "last_updated": "string"
}
```

---

## 4. Guia de Instalação e Atualização (VPS)

Para instalar ou atualizar este plugin no ambiente de produção, siga os passos abaixo.

### Passo 1: Atualizar Código Fonte
Se houver mudanças no código React/Node:
```bash
# Na raiz do projeto na VPS
git pull origin main
npm install
npm run build
pm2 restart server
```

### Passo 2: Atualizar Banco de Dados
Para registrar o plugin no PostgreSQL, execute o script SQL fornecido.

**Opção A: Via Terminal (psql)**
```bash
psql -h localhost -U postgres -d sie_pro -f database_plugin.sql
```

**Opção B: Via Interface Admin**
O sistema foi desenhado para reconhecer a entrada no banco automaticamente. Se você inseriu os dados via SQL, o plugin aparecerá imediatamente em:
1.  Acesse o Painel Admin.
2.  Navegue até **Loja de Plugins**.
3.  Verifique se "Raio-X Administrativo" aparece como "Ativo" ou "Instalado".
4.  Se necessário, use o botão de toggle para ativar/desativar globalmente.

---

## 5. Troubleshooting

**Erro: "Serviço de IA indisponível"**
*   Verifique se a `API_KEY` do Google Gemini está configurada corretamente no arquivo `.env`.

**Erro: JSON Parse Error**
*   Ocorre quando a IA alucina e não entrega JSON válido. O frontend tratará isso exibindo uma mensagem de erro genérica. Tente novamente a busca.

**Plugin não aparece na Sidebar**
*   Verifique na tabela `plan_plugins` se o plano do usuário atual (ex: 'pro') está vinculado ao ID do plugin.
