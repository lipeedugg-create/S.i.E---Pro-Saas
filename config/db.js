import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// SINGLE SOURCE OF TRUTH para JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'sie-secret-key-change-in-prod-v2';

console.log(`🔌 Conectando ao PostgreSQL... Host: ${process.env.DB_HOST || 'localhost'}`);

const { Pool } = pg;

// Configuração robusta para Produção e Local
const connectionString = process.env.DATABASE_URL || `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'sie_pro'}`;

// Detecta SSL necessário (Ambientes Cloud como Neon, AWS, Heroku geralmente exigem)
const isCloud = connectionString.includes('neon.tech') || connectionString.includes('aws') || connectionString.includes('render');

const pool = new Pool({
  connectionString,
  ssl: isCloud ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000, 
  idleTimeoutMillis: 30000,
  max: 20 
});

// Teste de Conexão Imediato (Fail Fast)
pool.connect()
    .then(client => {
        return client.query('SELECT NOW()')
            .then(res => {
                client.release();
                console.log(`✅ Conexão com Banco de Dados estabelecida: ${res.rows[0].now}`);
            })
            .catch(err => {
                client.release();
                console.error('❌ Erro ao executar query de teste no banco:', err.message);
            });
    })
    .catch(err => {
        console.error('❌ FALHA CRÍTICA: Não foi possível conectar ao PostgreSQL.', err.message);
        console.error('Verifique suas credenciais no arquivo .env');
    });

pool.on('error', (err) => {
  console.error('❌ Erro Inesperado no Client do Pool:', err.message);
});

// Wrapper para Queries (Abstração)
export const query = async (text, params) => {
    try {
        const start = Date.now();
        const res = await pool.query(text, params);
        // Opcional: Logar queries lentas (> 1s)
        // const duration = Date.now() - start;
        // if (duration > 1000) console.log('Slow Query:', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error(`❌ SQL Error: ${error.message} | Query: ${text.substring(0, 100)}...`);
        throw error;
    }
};