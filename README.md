# S.I.E. PRO (v4.0) - Strategic Intelligence Enterprise

**S.I.E. PRO** is a full-stack SaaS platform for strategic reputation monitoring and governmental intelligence. It utilizes **Google Gemini 2.5 Flash** to analyze news, social signals, and public transparency data in real-time.

## 🚀 Tech Stack

- **Frontend:** React 19, TailwindCSS, Vite.
- **Backend:** Node.js, Express.
- **Database:** PostgreSQL (via `pg` pool).
- **AI Core:** Google Gemini API (`gemini-2.5-flash`).
- **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (RBAC).

---

## 🛠️ Installation & Setup

### 1. Prerequisites
- Node.js v18+
- PostgreSQL Database

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development

# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sie_pro
DB_USER=postgres
DB_PASSWORD=your_password

# Security
JWT_SECRET=super_secret_key_change_in_production
CRON_KEY=secure_key_for_triggering_jobs

# AI Configuration
API_KEY=your_google_gemini_api_key
```

### 3. Database Setup
Run the SQL script found in `pages/Documentation.tsx` (Database Tab) to initialize the v4.0 Schema.

### 4. Run the Application

**Development Mode:**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm start
```

**Production Build:**
```bash
# Build React App
npm run build

# Start Server (Serves static build + API)
node server.js
```

---

## 🔑 Key Features (v4.0 Enterprise)

### 1. Advanced CRM & User Lifecycle
- **Status Control:** Admins can manage user states (`active`, `inactive`, `suspended`).
- **Impersonation:** Securely log in as any client for support purposes.
- **Audit:** Track `last_login` and API usage costs.

### 2. Plugin Marketplace
- **Architecture:** Modular system allowing features to be enabled/disabled per plan.
- **Raio-X Administrativo:** An AI-powered tool (Plugin) that generates transparency reports for Brazilian cities using Gemini.

### 3. Financial Management v2
- **Atomic Renewals:** Payment recording automatically updates subscription validity based on current status logic.
- **Revenue Analytics:** Real-time MRR (Monthly Recurring Revenue) dashboard.

### 4. AI & Monitoring
- **Real-time Feed:** Stream of analyzed URLs/News with sentiment analysis.
- **Cost Tracking:** Every AI token is counted and converted to USD cost for billing transparency.

---

## 📂 Project Structure

- `/config` - Database connection pool.
- `/middleware` - Auth and Admin verification.
- `/routes` - API definitions (Auth, Admin, Client, Monitoring).
- `/services` - Business logic (Gemini integration, Logs, AI Search).
- `/src` (root for frontend) - React components and pages.