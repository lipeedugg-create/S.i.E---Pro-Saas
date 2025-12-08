import { User, Subscription, Payment, RequestLog, MasterItem, MonitoringConfig, Plugin, Plan, CityAdminData, PluginConfig, UsageMetrics } from '../types';

const API_URL = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (res: Response) => {
  if (res.status === 401 || res.status === 403) {
      throw new Error("AUTH_ERROR: Sessão expirada ou inválida.");
  }

  if (!res.ok) {
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

  register: async (data: any): Promise<{ user: User, token: string }> => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  validateSession: async (): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getPublicPlans: async (): Promise<Plan[]> => {
    const res = await fetch(`${API_URL}/auth/plans`);
    return handleResponse(res);
  },

  sendContactMessage: async (data: {name: string, email: string, subject: string, message: string}): Promise<any> => {
      const res = await fetch(`${API_URL}/auth/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
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

  getClientPlugins: async (): Promise<Plugin[]> => {
    const res = await fetch(`${API_URL}/client/plugins`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // NOVO: Upload de Plugin (Multipart Form)
  uploadPlugin: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('plugin_file', file);

    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/admin/plugins/upload`, {
        method: 'POST',
        headers: {
            'Authorization': token ? `Bearer ${token}` : ''
            // Content-Type é automático com FormData
        },
        body: formData
    });
    return handleResponse(res);
  },

  downloadPluginTemplate: async (): Promise<void> => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/plugins/template`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (!res.ok) throw new Error("Erro ao baixar template.");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "plugin-template.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
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

  checkUrl: async (url: string): Promise<{status: 'ok'|'error', code?: number}> => {
    const res = await fetch(`${API_URL}/client/config/check-url`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ url })
    });
    if (!res.ok) return { status: 'error' };
    return res.json();
  },

  upsertConfig: async (config: MonitoringConfig): Promise<void> => {
    await fetch(`${API_URL}/client/config`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(config)
    });
  },

  runMonitoringNow: async (): Promise<{ message: string, count: number }> => {
    const res = await fetch(`${API_URL}/client/monitoring/run`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getClientProfile: async (): Promise<User> => {
    const res = await fetch(`${API_URL}/client/profile`, { headers: getHeaders() });
    return handleResponse(res);
  },

  updateClientProfile: async (data: Partial<User> & { new_password?: string }): Promise<User> => {
    const res = await fetch(`${API_URL}/client/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getClientUsage: async (): Promise<UsageMetrics> => {
    const res = await fetch(`${API_URL}/client/usage`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getClientPayments: async (): Promise<Payment[]> => {
    const res = await fetch(`${API_URL}/client/financials`, { headers: getHeaders() });
    return handleResponse(res);
  },

  getClientSubscription: async (): Promise<Subscription | null> => {
    const res = await fetch(`${API_URL}/client/subscription`, { headers: getHeaders() });
    return handleResponse(res);
  },

  searchPublicAdmin: async (city: string): Promise<CityAdminData> => {
    const res = await fetch(`${API_URL}/client/tools/public-admin-search`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ city })
    });
    return handleResponse(res);
  }
};