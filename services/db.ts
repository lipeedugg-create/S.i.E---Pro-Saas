import { User, Subscription, Payment, RequestLog, MasterItem, MonitoringConfig, Plan, Plugin } from '../types';

// Dados Iniciais (Mock Data) - Traduzidos para PT-BR

const PLANS: Plan[] = [
  { id: 'p1', name: 'Enterprise Básico', price: 99.00 },
  { id: 'p2', name: 'Enterprise Pro', price: 299.00 },
];

// Catálogo de Plugins (Marketplace)
// allowed_plans define quem tem acesso por padrão
let PLUGINS: Plugin[] = [
  { 
    id: 'plg_1', 
    name: 'Gemini 2.5 Flash AI', 
    description: 'Motor de análise de sentimento e sumarização avançada.', 
    version: '2.5.0', 
    icon: '🧠', 
    status: 'active', 
    category: 'analytics',
    price: 0,
    allowed_plans: ['p2'] // Apenas Pro por padrão
  },
  { 
    id: 'plg_2', 
    name: 'Alertas Tempo Real', 
    description: 'Sistema de notificações via Email e SMS críticos.', 
    version: '1.2.0', 
    icon: '🚨', 
    status: 'active', 
    category: 'utility',
    price: 19.90,
    allowed_plans: ['p2']
  },
  { 
    id: 'plg_3', 
    name: 'API Gateway', 
    description: 'Permite acesso programático aos dados para clientes.', 
    version: '1.0.0-beta', 
    icon: '🔌', 
    status: 'installed', 
    category: 'integration',
    price: 49.90,
    allowed_plans: []
  },
  { 
    id: 'plg_4', 
    name: 'Dark Web Monitor', 
    description: 'Rastreamento de vazamento de credenciais em fóruns onion.', 
    version: '0.9.5', 
    icon: '🕵️', 
    status: 'available', 
    category: 'security',
    price: 99.00,
    allowed_plans: []
  },
  { 
    id: 'plg_5', 
    name: 'Exportador PDF/XLSX', 
    description: 'Relatórios executivos com branding personalizado.', 
    version: '2.1.0', 
    icon: '📑', 
    status: 'available', 
    category: 'utility',
    price: 9.90,
    allowed_plans: []
  },
  { 
    id: 'plg_6', 
    name: 'WhatsApp Bot', 
    description: 'Chatbot para consulta de insights via WhatsApp Business.', 
    version: '1.0.1', 
    icon: '💬', 
    status: 'available', 
    category: 'integration',
    price: 29.90,
    allowed_plans: []
  }
];

let USERS: User[] = [
  { id: 'u1', name: 'Administrador', email: 'admin@sie.pro', role: 'admin' },
  { id: 'u2', name: 'Corporação Alpha', email: 'client@corp.com', role: 'client' },
  { id: 'u3', name: 'Tech Startup Beta', email: 'tech@start.com', role: 'client' },
];

const SUBSCRIPTIONS: Subscription[] = [
  { id: 's1', user_id: 'u2', plan_id: 'p1', status: 'active', start_date: '2023-01-01', end_date: '2023-12-31' },
  { id: 's2', user_id: 'u3', plan_id: 'p2', status: 'expired', start_date: '2023-01-01', end_date: '2023-10-01' },
];

const MONITORING_CONFIGS: MonitoringConfig[] = [
  { 
    user_id: 'u2', 
    keywords: ['Concorrente X', 'Tendências de Mercado', 'Inovação'], 
    urls_to_track: ['http://noticias-mercado.com.br'], 
    frequency: 'daily', 
    is_active: true 
  },
  { 
    user_id: 'u3', 
    keywords: ['Inteligência Artificial', 'Rodada de Investimento', 'Regulação'], 
    urls_to_track: ['http://tech-news.com.br'], 
    frequency: 'hourly', 
    is_active: false 
  },
];

let PAYMENTS: Payment[] = [];
let LOGS: RequestLog[] = [];
let MASTER_ITEMS: MasterItem[] = [];

// Métodos do Serviço (Simulando queries de Banco de Dados)

export const db = {
  getUsers: () => [...USERS],
  getUserByEmail: (email: string) => USERS.find(u => u.email === email),
  getPlans: () => [...PLANS],
  
  // Novo Método: Criar ou Editar Usuário
  upsertUser: (user: Partial<User>) => {
    if (user.id) {
      // Edit
      const index = USERS.findIndex(u => u.id === user.id);
      if (index !== -1) {
        USERS[index] = { ...USERS[index], ...user } as User;
      }
    } else {
      // Create
      const newUser: User = {
        id: crypto.randomUUID(),
        name: user.name || 'Novo Usuário',
        email: user.email || '',
        role: user.role || 'client'
      };
      USERS.push(newUser);
      
      // Criar assinatura default para novos clientes
      if (newUser.role === 'client') {
         SUBSCRIPTIONS.push({
            id: crypto.randomUUID(),
            user_id: newUser.id,
            plan_id: 'p1',
            status: 'active',
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
         });
      }
    }
  },

  getSubscriptions: () => [...SUBSCRIPTIONS],
  getSubscriptionByUserId: (userId: string) => SUBSCRIPTIONS.find(s => s.user_id === userId),
  
  // Plugins Management
  getPlugins: () => [...PLUGINS],
  
  updatePluginStatus: (id: string, newStatus: 'available' | 'installed' | 'active') => {
    const idx = PLUGINS.findIndex(p => p.id === id);
    if (idx !== -1) {
      PLUGINS[idx].status = newStatus;
      // Se desinstalar, remove permissões
      if (newStatus === 'available') {
         PLUGINS[idx].allowed_plans = [];
      }
    }
  },

  // Toggle Plan Access
  togglePluginForPlan: (pluginId: string, planId: string) => {
    const idx = PLUGINS.findIndex(p => p.id === pluginId);
    if (idx !== -1) {
      const allowed = PLUGINS[idx].allowed_plans;
      if (allowed.includes(planId)) {
        PLUGINS[idx].allowed_plans = allowed.filter(id => id !== planId);
      } else {
        PLUGINS[idx].allowed_plans = [...allowed, planId];
      }
    }
  },

  // Verifica se um plugin está ativo e habilitado para um plano específico
  isPluginEnabledForPlan: (pluginId: string, planId: string | undefined): boolean => {
    if (!planId) return false;
    const plugin = PLUGINS.find(p => p.id === pluginId);
    if (!plugin) return false;
    // O plugin deve estar ATIVO globalmente E permitido para o plano
    return plugin.status === 'active' && plugin.allowed_plans.includes(planId);
  },

  // Simulação de Transação de Pagamento
  recordPayment: (payment: Omit<Payment, 'id'>) => {
    const newPayment: Payment = { ...payment, id: crypto.randomUUID() };
    PAYMENTS.push(newPayment);
    
    // Atualiza end_date da assinatura (Lógica de Renovação de 30 dias)
    const subIndex = SUBSCRIPTIONS.findIndex(s => s.id === payment.subscription_id);
    if (subIndex !== -1) {
      const currentEndDate = new Date(SUBSCRIPTIONS[subIndex].end_date);
      const today = new Date();
      // Se expirada, começa de hoje, senão adiciona ao final
      const baseDate = currentEndDate > today ? currentEndDate : today;
      baseDate.setDate(baseDate.getDate() + 30);
      
      SUBSCRIPTIONS[subIndex].end_date = baseDate.toISOString().split('T')[0];
      SUBSCRIPTIONS[subIndex].status = 'active'; // Reativa se estiver expirada
    }
    return newPayment;
  },

  getPayments: () => [...PAYMENTS],

  // Lógica de Logs
  logRequest: (log: Omit<RequestLog, 'id' | 'timestamp'>) => {
    const newLog: RequestLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    LOGS.unshift(newLog); // Adiciona no topo
    return newLog;
  },
  
  getLogs: () => [...LOGS],

  // Lógica de Master Items
  saveMasterItem: (item: Omit<MasterItem, 'id' | 'created_at'>) => {
    const newItem: MasterItem = {
      ...item,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };
    MASTER_ITEMS.unshift(newItem);
  },
  
  getItemsByUserId: (userId: string) => MASTER_ITEMS.filter(i => i.user_id === userId),

  // Lógica de Configuração
  getConfig: (userId: string) => MONITORING_CONFIGS.find(c => c.user_id === userId),
  upsertConfig: (config: MonitoringConfig) => {
    const idx = MONITORING_CONFIGS.findIndex(c => c.user_id === config.user_id);
    if (idx !== -1) {
      MONITORING_CONFIGS[idx] = config;
    } else {
      MONITORING_CONFIGS.push(config);
    }
  },
  
  getActiveMonitoringConfigs: () => {
    // Join: Usuários com Assinatura Ativa E Configuração Ativa
    return MONITORING_CONFIGS.filter(config => {
      const sub = SUBSCRIPTIONS.find(s => s.user_id === config.user_id);
      return config.is_active && sub && sub.status === 'active';
    });
  }
};