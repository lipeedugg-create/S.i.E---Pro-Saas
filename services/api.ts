import { User, Subscription, Payment, RequestLog, MasterItem, MonitoringConfig, Plugin, Plan } from '../types';

/**
 * PRODUCTION API CLIENT
 * Este arquivo substitui o 'services/db.ts' quando o backend Node.js estiver rodando.
 * 
 * Configuração:
 * 1. Crie um arquivo .env na raiz do frontend com: VITE_API_URL=http://localhost:3000/api
 * 2. Substitua os imports nos componentes: import { api } from '../../services/api';
 */

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `HTTP Error ${res.status}`);
  }
  return res.json();
};

export const api = {
  // --- AUTH ---
  login: async (email: string, password: string): Promise<{ user: User, token: string }> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  // --- USERS & ADMIN ---
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/admin/users`, { headers: getHeaders() });
    return handleResponse(res);
  },

  upsertUser: async (user: Partial<User>): Promise<User> => {
    const method = user.id ? 'PUT' : 'POST';
    const url = user.id ? `${API_URL}/admin/users/${user.id}` : `${API_URL}/admin/users`;
    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(user)
    });
    return handleResponse(res);
  },

  // --- SUBSCRIPTIONS & PLANS ---
  getPlans: async (): Promise<Plan[]> => {
    const res = await fetch(`${API_URL}/admin/plans`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getSubscriptions: async (): Promise<Subscription[]> => {
    const res = await fetch(`${API_URL}/admin/subscriptions`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // --- PLUGINS (MARKETPLACE) ---
  getPlugins: async (): Promise<Plugin[]> => {
    const res = await fetch(`${API_URL}/admin/plugins`, { headers: getHeaders() });
    return handleResponse(res);
  },

  updatePluginStatus: async (id: string, status: string): Promise<void> => {
    await fetch(`${API_URL}/admin/plugins/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
  },

  togglePluginForPlan: async (pluginId: string, planId: string): Promise<void> => {
    await fetch(`${API_URL}/admin/plugins/${pluginId}/toggle-plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ plan_id: planId })
    });
  },

  // --- FINANCEIRO ---
  recordPayment: async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    const res = await fetch(`${API_URL}/admin/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payment)
    });
    return handleResponse(res);
  },

  getPayments: async (): Promise<Payment[]> => {
    const res = await fetch(`${API_URL}/admin/payments`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // --- LOGS & MONITORING ---
  getLogs: async (): Promise<RequestLog[]> => {
    const res = await fetch(`${API_URL}/admin/logs`, { headers: getHeaders() });
    return handleResponse(res);
  },

  triggerCollection: async (cronKey: string): Promise<any> => {
    const res = await fetch(`${API_URL}/monitoring/trigger`, {
      method: 'POST',
      headers: {
        ...getHeaders(),
        'X-CRON-KEY': cronKey
      }
    });
    return handleResponse(res);
  },

  // --- CLIENT AREA ---
  getItemsByUserId: async (userId: string): Promise<MasterItem[]> => {
    // Em produção, o backend pega o ID do token JWT, mas passamos aqui por compatibilidade
    const res = await fetch(`${API_URL}/client/items`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getConfig: async (userId: string): Promise<MonitoringConfig | null> => {
    const res = await fetch(`${API_URL}/client/config`, { headers: getHeaders() });
    return handleResponse(res);
  },

  upsertConfig: async (config: MonitoringConfig): Promise<void> => {
    await fetch(`${API_URL}/client/config`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
  }
};