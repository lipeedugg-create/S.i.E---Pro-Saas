import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// SINGLE SOURCE OF TRUTH para JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'sie-secret-key-change-in-prod-v2';

console.log(`🔌 Inicializando Banco de Dados... Host: ${process.env.DB_HOST || 'localhost'}`);

const { Pool } = pg;

// Detecta ambiente Cloud/Serverless para ajustar SSL
const connectionString = process.env.DATABASE_URL || `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'sie_pro'}`;
const isCloud = connectionString.includes('neon.tech') || connectionString.includes('aws') || connectionString.includes('render');

const pool = new Pool({
  connectionString,
  ssl: isCloud ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 20000, // Aumentado para 20s para aguentar "Cold Starts"
  idleTimeoutMillis: 30000,
  max: 20 // Limite de conexões no pool
});

pool.on('error', (err) => {
  console.error('❌ Erro Inesperado no Client do Pool:', err.message);
  // Não faz exit(-1), permite que a aplicação tente reconectar
});

export const query = async (text, params) => {
    try {
        return await pool.query(text, params);
    } catch (error) {
        console.error(`❌ SQL Error [${text.split(' ')[0]}]: ${error.message}`);
        throw error;
    }
};