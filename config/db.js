import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// 1. Constrói a String de Conexão
const buildConnectionString = () => {
  // Se houver uma URL completa (comum em Heroku/Railway/Neon), use-a.
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  // Caso contrário, monte a partir das variáveis individuais (comum em VPS Docker/Linux)
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const user = process.env.DB_USER || 'postgres';
  const pass = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'sie_pro';

  return `postgres://${user}:${pass}@${host}:${port}/${dbName}`;
};

const connectionString = buildConnectionString();
const isProduction = process.env.NODE_ENV === 'production';

// 2. Lógica Inteligente de SSL
// Se o host for localhost ou 127.0.0.1, assumimos que o banco está na mesma máquina (VPS),
// onde o SSL geralmente vem desativado por padrão no PostgreSQL.
const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString: connectionString,
  // Ativa SSL apenas se for produção E o banco NÃO for local.
  // 'rejectUnauthorized: false' é necessário para muitos provedores de nuvem que usam certificados auto-assinados.
  ssl: (isProduction && !isLocalhost) ? { rejectUnauthorized: false } : false,
  
  // Timeouts para evitar conexões penduradas na VPS
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000, 
});

// Listener de erro para evitar crash da aplicação se o banco cair
pool.on('error', (err, client) => {
  console.error('Erro inesperado no cliente PostgreSQL', err);
});

export const query = (text, params) => pool.query(text, params);