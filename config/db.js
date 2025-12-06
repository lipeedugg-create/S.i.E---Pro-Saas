import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Constrói a URL de conexão se as variáveis individuais forem fornecidas
// Prioriza DATABASE_URL se existir
const buildConnectionString = () => {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432'; // Default Postgres port
  const user = process.env.DB_USER || 'postgres';
  const pass = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'sie_pro';

  return `postgres://${user}:${pass}@${host}:${port}/${dbName}`;
};

const connectionString = buildConnectionString();
const isProduction = process.env.NODE_ENV === 'production';

// Verifica se é localhost para evitar erros de SSL (comum em VPS onde o banco roda localmente)
const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString: connectionString,
  // Habilita SSL apenas se for produção E NÃO for localhost
  ssl: (isProduction && !isLocalhost) ? { rejectUnauthorized: false } : false
});

export const query = (text, params) => pool.query(text, params);