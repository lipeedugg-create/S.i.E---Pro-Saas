import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// SINGLE SOURCE OF TRUTH para JWT
export const JWT_SECRET = process.env.JWT_SECRET || 'sie-secret-key-change-in-prod-v2';

console.log(`🔌 Conectando ao PostgreSQL... Host: ${process.env.DB_HOST || 'localhost'}`);

const { Pool } = pg;

// Configuração robusta para Produção e Local
const connectionString = process.env.DATABASE_URL || `postgres://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || ''}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'sie_pro'}`;

// Detecta SSL necessário (Ambientes Cloud como Neon, AWS, Heroku, Render geralmente exigem)
const isCloud = connectionString.includes('neon.tech') || 
                connectionString.includes('aws') || 
                connectionString.includes('render') || 
                connectionString.includes('herokuapp');

// Configuração Otimizada do Pool
const pool = new Pool({
  connectionString,
  // Configuração SSL para Cloud
  ssl: isCloud ? { rejectUnauthorized: false } : false,
  
  // Limites do Pool
  max: 20, // Máximo de clientes conectados simultaneamente (ajustar conforme RAM do servidor)
  min: 2,  // Mínimo de clientes sempre abertos (reduz latência de start frio)
  
  // Timeouts e Limpeza
  idleTimeoutMillis: 30000, // Clientes ociosos por 30s são fechados para liberar recursos
  connectionTimeoutMillis: 5000, // Timeout para obter conexão do pool (fail fast se DB cair)
  
  // Statement Timeout (Segurança contra queries travadas)
  // Define 15s como limite padrão para qualquer query (evita DOS por query lenta)
  // Pode ser sobrescrito por query individualmente se necessário
  statement_timeout: 15000, 
  
  allowExitOnIdle: false // Mantém o event loop ativo
});

// Teste de Conexão Imediato (Fail Fast) com Retry Simples
const testConnection = async (retries = 3) => {
    while (retries > 0) {
        try {
            const client = await pool.connect();
            const res = await client.query('SELECT NOW() as now');
            client.release();
            console.log(`✅ Conexão com Banco de Dados estabelecida: ${res.rows[0].now}`);
            return;
        } catch (err) {
            retries--;
            console.error(`⚠️ Falha ao conectar ao DB. Tentativas restantes: ${retries}. Erro: ${err.message}`);
            if (retries === 0) {
                console.error('❌ FALHA CRÍTICA: Não foi possível conectar ao PostgreSQL após múltiplas tentativas.');
                // Não matamos o processo aqui para permitir que o servidor tente recuperar em runtime, 
                // mas em orquestradores como K8s isso poderia ser um exit(1)
            } else {
                await new Promise(res => setTimeout(res, 2000)); // Espera 2s antes de tentar de novo
            }
        }
    }
};

testConnection();

pool.on('error', (err) => {
  console.error('❌ Erro Inesperado no Client do Pool (Idle):', err.message);
  // Em produção, isso pode disparar um alerta para o SRE
});

// Wrapper para Queries (Abstração com Logging e Tratamento de Erro)
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        
        // Log de queries lentas (> 500ms) para debugging
        const duration = Date.now() - start;
        if (duration > 500) {
            console.warn(`⚠️ Slow Query (${duration}ms): ${text.substring(0, 100)}...`);
        }
        
        return res;
    } catch (error) {
        // Log detalhado do erro SQL
        console.error(`❌ SQL Error: ${error.message} | Query: ${text.substring(0, 100)}...`);
        throw error;
    }
};