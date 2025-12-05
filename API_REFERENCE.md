# S.I.E. PRO - API Reference

Base URL: `http://localhost:3000/api`

## Authentication

### Login
Generates a JWT token for session management.
- **POST** `/auth/login`
- **Body:** `{ "email": "admin@sie.pro", "password": "..." }`
- **Response:** `{ "token": "ey...", "user": { ... } }`

---

## Admin Module
*Headers required: `Authorization: Bearer <token>` (Admin Role)*

### User Management
- **GET** `/admin/users` - List all users.
- **POST** `/admin/users` - Create a new user.
  - Body: `{ "name": "...", "email": "...", "role": "client" }`
- **PUT** `/admin/users/:id` - Update user details.

### 👤 Impersonation (New)
Allows an admin to log in as a specific client without knowing their password.
- **POST** `/admin/users/:id/impersonate`
- **Response:**
  ```json
  {
    "token": "eyJhbG...", // Token scoped to the target user
    "user": {
      "id": "target_user_id",
      "role": "client",
      "name": "Target User Name"
    }
  }
  ```

### Financials
- **GET** `/admin/payments` - List payment history.
- **POST** `/admin/payments` - Record a manual payment.
  - **Effect:** Automatically extends the user's subscription by 30 days.
  - Body: `{ "subscription_id": "...", "amount": 299.00, "reference_id": "PIX123" }`

### Logs
- **GET** `/admin/logs` - Fetch audit logs of AI usage and costs.

---

## Client Module
*Headers required: `Authorization: Bearer <token>`*

### Monitoring Configuration
- **GET** `/client/config` - Get current keywords and URLs.
- **PUT** `/client/config` - Update monitoring rules.
  - Body: `{ "keywords": ["Keyword1"], "urls_to_track": ["http://..."], "is_active": true }`

### Dashboard Data
- **GET** `/client/items` - Fetch the latest analyzed news items (Master Items).

---

## Core Monitoring (System)

### Trigger Collection Cycle
Manually triggers the scraping and AI analysis process.
- **POST** `/monitoring/trigger`
- **Headers:** `X-CRON-KEY: <value_from_env>`
- **Process:**
  1. Finds active configurations.
  2. Scrapes URLs (simulated).
  3. Sends content to **Gemini 2.5 Flash**.
  4. Stores structured JSON result (`sentiment`, `summary`) in `master_items`.
  5. Logs token usage and cost in `requests_log`.
