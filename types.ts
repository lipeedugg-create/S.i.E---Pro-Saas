// Matching the User table
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  name: string;
  status?: 'active' | 'inactive' | 'suspended';
  phone?: string;
  last_login?: string;
  avatar?: string; // Base64 string for profile picture
  created_at?: string;
}

// Matching the Subscriptions table
export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
}

// Matching the Plans table
export interface Plan {
  id: string;
  name: string;
  price: number;
  description?: string;
  token_limit?: number; // Limite de Tokens Gemini por mês
}

// Plugins / Addons System
export interface PluginConfig {
  systemPrompt?: string;
  negativePrompt?: string;
  temperature?: number;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string; // Emoji or URL
  status: 'available' | 'installed' | 'active'; // available=store, installed=library, active=running
  category: 'analytics' | 'security' | 'integration' | 'utility';
  price: number; // Custo mensal sugerido para repasse
  allowed_plans: string[]; // IDs dos planos que têm acesso a este plugin
  config?: PluginConfig; // NOVO: Armazena prompts customizados
}

// Tabela 8: Payments (Gestão Financeira Manual)
export interface Payment {
  id: string;
  subscription_id: string;
  amount: number;
  payment_date: string;
  reference_id: string;
  admin_recorded_by: string; // user_id
  notes: string;
}

// Tabela 9: Requests Log (Controle de Consumo/Custo)
export interface RequestLog {
  id: string;
  user_id: string;
  endpoint: string;
  request_tokens: number;
  response_tokens: number;
  cost_usd: number;
  timestamp: string;
  status: string;
}

export interface UsageMetrics {
  total_requests: number;
  total_tokens: number;
  estimated_cost: number;
  plan_limit: number;
}

// Master Items (Results of Monitoring)
export interface MasterItem {
  id: string;
  user_id: string;
  source_url: string;
  analyzed_content: string;
  ai_summary: string;
  detected_keywords: string[];
  created_at: string;
}

// User Monitoring Config
export interface MonitoringConfig {
  user_id: string;
  keywords: string[];
  urls_to_track: string[];
  frequency: 'daily' | 'hourly';
  is_active: boolean;
  last_run_at?: string; // NOVO: Data da última execução
}

// --- NEW: Public Administration Search Types ---
export interface Politician {
  name: string;
  role: string; // Prefeito, Vereador, etc.
  party: string;
  past_roles: string[]; // Histórico
}

export interface PublicServant {
  name: string;
  department: string; // Lotação
  role_type: string; // Vínculo (Comissionado, Efetivo)
  estimated_salary: string;
}

export interface CityAdminData {
  city: string;
  mayor: Politician;
  vice_mayor: Politician;
  councilors: Politician[];
  key_servants: PublicServant[];
  last_updated: string;
}