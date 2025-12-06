import { query } from './db.js';
import bcrypt from 'bcryptjs';

export const initDatabase = async () => {
  console.log('🔄 Verificando estrutura do Banco de Dados...');

  const sql = `
    -- Habilitar UUIDs
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- 1. USERS
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('admin', 'client')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        phone VARCHAR(50),
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. PLANS
    CREATE TABLE IF NOT EXISTS plans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT
    );

    -- 3. PLUGINS
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

    -- 4. PLAN_PLUGINS
    CREATE TABLE IF NOT EXISTS plan_plugins (
        plan_id VARCHAR(50) REFERENCES plans(id) ON DELETE CASCADE,
        plugin_id UUID REFERENCES plugins(id) ON DELETE CASCADE,
        PRIMARY KEY (plan_id, plugin_id)
    );

    -- 5. SUBSCRIPTIONS
    CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        plan_id VARCHAR(50) REFERENCES plans(id),
        status VARCHAR(20) DEFAULT 'active',
        start_date DATE DEFAULT CURRENT_DATE,
        end_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 6. MONITORING CONFIGS
    CREATE TABLE IF NOT EXISTS monitoring_configs (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        keywords JSONB DEFAULT '[]',
        urls_to_track JSONB DEFAULT '[]',
        frequency VARCHAR(20) DEFAULT 'daily',
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_run_at TIMESTAMP WITH TIME ZONE
    );

    -- 7. MASTER ITEMS (Results)
    CREATE TABLE IF NOT EXISTS master_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        source_url TEXT,
        analyzed_content TEXT,
        ai_summary TEXT,
        detected_keywords JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- 8. PAYMENTS
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

    -- 9. REQUESTS LOG
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
  `;

  try {
    await query(sql);
    
    // Seed Admin Default
    const adminEmail = 'admin@sie.pro';
    const checkAdmin = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (checkAdmin.rows.length === 0) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('admin123', salt);
        await query(
            `INSERT INTO users (name, email, password_hash, role, status) 
             VALUES ('Super Admin', $1, $2, 'admin', 'active')`,
            [adminEmail, hash]
        );
        console.log(`✅ Admin Default criado: ${adminEmail} / admin123`);
    }

    // Seed Plugin Raio-X (Necessário para a demo funcionar)
    const pluginId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99';
    const checkPlugin = await query('SELECT id FROM plugins WHERE id = $1', [pluginId]);
    if (checkPlugin.rows.length === 0) {
        await query(`
            INSERT INTO plugins (id, name, description, icon, category, status, price)
            VALUES ($1, 'Raio-X Administrativo', 'Consulta automatizada de estruturas governamentais via IA.', '🏛️', 'utility', 'active', 50.00)
        `, [pluginId]);
        console.log('✅ Plugin Raio-X restaurado.');
    }

    console.log('✅ Banco de Dados Inicializado com Sucesso.');
  } catch (err) {
    console.error('❌ Erro na inicialização do DB:', err);
  }
};