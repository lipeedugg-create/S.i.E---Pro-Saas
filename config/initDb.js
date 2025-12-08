import { query } from './db.js';
import bcrypt from 'bcryptjs';

export const initDatabase = async () => {
  console.log('🔄 Verificando integridade do Schema SQL...');

  // 1. Extensões
  try {
      await query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
  } catch (e) {
      console.warn('⚠️ Aviso: Extensão pgcrypto ignorada (pode já estar ativa ou sem permissão).', e.message);
  }

  // 2. DDL - Definição de Tabelas
  // NOTA: Plugins usam VARCHAR(100) para IDs legíveis (slugs) vindos do manifest.json
  const tableQueries = `
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

    CREATE TABLE IF NOT EXISTS plans (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        description TEXT,
        token_limit BIGINT DEFAULT 10000
    );

    CREATE TABLE IF NOT EXISTS plugins (
        id VARCHAR(100) PRIMARY KEY, -- Alterado de UUID para VARCHAR para aceitar slugs (ex: 'meu-plugin')
        name VARCHAR(100) NOT NULL,
        description TEXT,
        version VARCHAR(20) DEFAULT '1.0.0',
        icon VARCHAR(50),
        status VARCHAR(50) DEFAULT 'available',
        category VARCHAR(50) DEFAULT 'utility',
        price DECIMAL(10, 2) DEFAULT 0.00,
        config JSONB DEFAULT '{}',
        entry_point VARCHAR(255),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS plan_plugins (
        plan_id VARCHAR(50) REFERENCES plans(id) ON DELETE CASCADE,
        plugin_id VARCHAR(100) REFERENCES plugins(id) ON DELETE CASCADE,
        PRIMARY KEY (plan_id, plugin_id)
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        plan_id VARCHAR(50) REFERENCES plans(id),
        status VARCHAR(20) DEFAULT 'active',
        start_date DATE DEFAULT CURRENT_DATE,
        end_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS monitoring_configs (
        user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        keywords JSONB DEFAULT '[]',
        urls_to_track JSONB DEFAULT '[]',
        frequency VARCHAR(20) DEFAULT 'daily',
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_run_at TIMESTAMP WITH TIME ZONE
    );

    CREATE TABLE IF NOT EXISTS master_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        source_url TEXT,
        analyzed_content TEXT,
        ai_summary TEXT,
        detected_keywords JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(100),
        message TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(tableQueries);

    // --- AUTO MIGRATION: Adicionar colunas novas em bancos existentes ---
    await query(`
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plugins' AND column_name='entry_point') THEN 
                ALTER TABLE plugins ADD COLUMN entry_point VARCHAR(255); 
            END IF;
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='plans' AND column_name='token_limit') THEN 
                ALTER TABLE plans ADD COLUMN token_limit BIGINT DEFAULT 10000; 
            END IF;
        END $$;
    `);

    // 3. Seed de Dados Essenciais (Planos)
    console.log('🌱 Semeando Planos Padrão (Starter, Pro, Gov)...');
    await query(`
        INSERT INTO plans (id, name, price, description, token_limit) VALUES
        ('starter', 'Starter', 99.00, 'Monitoramento básico para pequenas empresas.', 10000),
        ('pro', 'Enterprise Pro', 299.00, 'IA Avançada, Tempo Real e Alertas de Crise.', 1000000),
        ('gov', 'Governo & Public', 1500.00, 'Infraestrutura dedicada para órgãos públicos.', 5000000)
        ON CONFLICT (id) DO UPDATE SET 
            price = EXCLUDED.price,
            token_limit = EXCLUDED.token_limit;
    `);

    // 4. Seed Plugin Nativo (Raio-X Administrativo)
    // Isso garante que a ferramenta nativa apareça na gestão de plugins
    await query(`
        INSERT INTO plugins (id, name, description, version, icon, category, status, price, entry_point) VALUES
        ('public-admin-search', 'Raio-X Administrativo', 'Ferramenta nativa de inteligência para mapeamento de cargos públicos.', '1.0.0', '🏛️', 'analytics', 'active', 0.00, NULL)
        ON CONFLICT (id) DO NOTHING;
    `);
    // Vincula Raio-X aos planos Pro e Gov
    await query(`
        INSERT INTO plan_plugins (plan_id, plugin_id) VALUES 
        ('pro', 'public-admin-search'),
        ('gov', 'public-admin-search')
        ON CONFLICT DO NOTHING;
    `);

    // 5. Seed Admin Default
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
        console.log(`✅ Admin Default criado com sucesso: ${adminEmail}`);
    } else {
        console.log('ℹ️ Admin já existente.');
    }

    console.log('✅ Banco de Dados sincronizado e pronto para uso real.');
  } catch (err) {
    console.error('❌ FALHA FATAL NA INICIALIZAÇÃO DO DB:', err.message);
    process.exit(1); 
  }
};