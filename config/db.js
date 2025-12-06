import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

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
const isProduction = process.env.NODE_ENV === 'production';

// Detecta se o banco está na mesma máquina (localhost) para desativar SSL
const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString: connectionString,
  // SSL necessário para bancos em nuvem (Neon/Render/Supabase), mas deve ser false para localhost/VPS Docker
  ssl: (isProduction && !isLocalhost) ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000, // Timeout de 5s para falhar rápido se banco estiver offline
});

pool.on('error', (err) => {
  console.error('Erro crítico no Pool do PostgreSQL:', err);
});

export const query = (text, params) => pool.query(text, params);