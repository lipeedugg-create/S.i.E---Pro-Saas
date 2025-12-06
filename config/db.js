import pg from 'pg';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente imediatamente
dotenv.config();

// --- SINGLE SOURCE OF TRUTH (Fonte Única da Verdade) ---
// Exportamos a chave daqui para garantir que Login e Middleware usem O MESMO valor sempre.
export const JWT_SECRET = process.env.JWT_SECRET || 'sie-secret-key-change-in-prod';

console.log(`🔌 Inicializando Banco de Dados... Host: ${process.env.DB_HOST || 'localhost'}`);

const { Pool } = pg;

// Monta a string de conexão baseada no ambiente
const buildConnectionString = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const user = process.env.DB_USER || 'postgres';
  const pass = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'sie_pro';

  return `postgres://${user}:${pass}@${host}:${port}/${dbName}`;
};

const connectionString = buildConnectionString();

const isCloudConnection = !!process.env.DATABASE_URL && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString: connectionString,
  ssl: isCloudConnection ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000, // Mantém a conexão ativa por 30s
  keepAlive: true, // Garante que o TCP keepalive esteja ativo
});

pool.on('connect', () => {
  // Log silencioso de sucesso
});

pool.on('error', (err) => {
  console.error('❌ Erro Crítico no Pool do PostgreSQL:', err.message);
  // Não encerra o processo, permite retry
});

export const query = async (text, params) => {
    try {
        return await pool.query(text, params);
    } catch (error) {
        console.error(`❌ Erro na Query SQL [${text.substring(0, 50)}...]: ${error.message}`);
        throw error;
    }
};