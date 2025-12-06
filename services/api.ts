import { User, Subscription, Payment, RequestLog, MasterItem, MonitoringConfig, Plugin, Plan, CityAdminData, PluginConfig } from '../types';

/**
 * CLIENTE API DE PRODUÇÃO
 * 
 * Configuração Crítica para VPS:
 * Usamos apenas '/api' (caminho relativo). 
 * Isso permite que o navegador monte a URL correta automaticamente, 
 * seja localhost, IP da VPS ou domínio final.
 */
const API_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Tratamento centralizado de erros
const handleResponse = async (res: Response) => {
  if (!res.ok) {
    // Tenta ler o JSON de erro, se falhar, usa texto padrão com status
    const error = await res.json().catch(() => ({ message: `Erro HTTP ${res.status}` }));
    throw new Error(error.message || `Erro na requisição: ${res.status}`);
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

  impersonate: async (userId: string): Promise<{ user: User, token: string }> => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/impersonate`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // --- USERS & ADMIN ---
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/admin/users`, { headers: getHeaders() });
    return handleResponse(res);
  },

  upsertUser: async (user: Partial<User> & { password?: string }): Promise<User> => {
    const method = user.id ? 'PUT' : 'POST';
    const url = user.id ? `${API_URL}/admin/users/${user.id}` : `${API_URL}/admin/users`;
    const res = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(user)
    });
    return handleResponse(res);
  },

  updateUserStatus: async (id: string, status: string): Promise<User> => {
    const res = await fetch(`${API_URL}/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  assignPlan: async (userId: string, planId: string): Promise<void> => {
    await fetch(`${API_URL}/admin/users/${userId}/subscription`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ plan_id: planId })
    });
  },

  // --- SUBSCRIPTIONS & PLANS ---
  getPlans: async (): Promise<Plan[]> => {
    const res = await fetch(`${API_URL}/admin/plans`, { headers: getHeaders() });
    return handleResponse(res);
  },

  upsertPlan: async (plan: Plan & { isNew?: boolean }): Promise<Plan> => {
    const method = plan.isNew ? 'POST' : 'PUT';
    const url = plan.isNew ? `${API_URL}/admin/plans` : `${API_URL}/admin/plans/${plan.id}`;
    // Remove isNew antes de enviar
    const { isNew, ...body } = plan; 
    const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(body)
    });
    return handleResponse(res);
  },

  deletePlan: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/admin/plans/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    // Se a resposta for vazia mas ok, não tenta parsear JSON
    if (res.status === 204) return;
    return handleResponse(res);
  },

  getSubscriptions: async (): Promise<Subscription[]> => {
    const res = await fetch(`${API_URL}/admin/subscriptions`, { headers: getHeaders() });
    return handleResponse(res);
  },

  updateSubscriptionDate: async (subId: string, endDate: string): Promise<void> => {
      await fetch(`${API_URL}/admin/subscriptions/${subId}/date`, {
          method: 'PATCH',
          headers: getHeaders(),
          body: JSON.stringify({ end_date: endDate })
      });
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

  updatePluginConfig: async (id: string, config: PluginConfig): Promise<void> => {
    await fetch(`${API_URL}/admin/plugins/${id}/config`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ config })
    });
  },

  togglePluginForPlan: async (pluginId: string, planId: string): Promise<void> => {
    await fetch(`${API_URL}/admin/plugins/${pluginId}/toggle-plan`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ plan_id: planId })
    });
  },

  deletePlugin: async (id: string): Promise<void> => {
    await fetch(`${API_URL}/admin/plugins/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
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

  getPaymentsByUser: async (userId: string): Promise<Payment[]> => {
    const res = await fetch(`${API_URL}/admin/users/${userId}/payments`, { headers: getHeaders() });
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
  getItemsByUserId: async (_userId: string): Promise<MasterItem[]> => {
    const res = await fetch(`${API_URL}/client/items`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getConfig: async (_userId: string): Promise<MonitoringConfig | null> => {
    const res = await fetch(`${API_URL}/client/config`, { headers: getHeaders() });
    return handleResponse(res);
  },

  upsertConfig: async (config: MonitoringConfig): Promise<void> => {
    await fetch(`${API_URL}/client/config`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
  },

  // --- TOOLS (PLUGINS) ---
  searchPublicAdmin: async (city: string): Promise<CityAdminData> => {
    const res = await fetch(`${API_URL}/client/tools/public-admin-search`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ city })
    });
    return handleResponse(res);
  }
};