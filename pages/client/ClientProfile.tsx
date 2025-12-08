import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, UsageMetrics, Payment } from '../../types';

interface ClientProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

export const ClientProfile: React.FC<ClientProfileProps> = ({ user, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'financial'>('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Data States
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    avatar: user.avatar || '',
    new_password: '',
    confirm_password: ''
  });

  // Load Extra Data
  useEffect(() => {
    const loadExtras = async () => {
      try {
        const [usageData, payData] = await Promise.all([
          api.getClientUsage(),
          api.getClientPayments()
        ]);
        setMetrics(usageData);
        setPayments(payData);
      } catch (e) {
        console.error("Failed to load profile extras", e);
      }
    };
    loadExtras();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit
          alert("Imagem muito grande. Máximo 1MB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (activeTab === 'security') {
        if (formData.new_password !== formData.confirm_password) {
            setMessage({ text: 'As senhas não conferem.', type: 'error' });
            return;
        }
        if (formData.new_password.length < 6) {
            setMessage({ text: 'A senha deve ter no mínimo 6 caracteres.', type: 'error' });
            return;
        }
    }

    setLoading(true);
    try {
        const updatedUser = await api.updateClientProfile({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            avatar: formData.avatar,
            new_password: formData.new_password || undefined
        });
        
        onUpdate(updatedUser);
        setMessage({ text: 'Alterações salvas com sucesso!', type: 'success' });
        setFormData(prev => ({ ...prev, new_password: '', confirm_password: '' }));
    } catch (err: any) {
        setMessage({ text: err.message || 'Erro ao salvar.', type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto min-h-full text-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Configurações da Conta</h2>
        <p className="text-slate-400">Gerencie seus dados pessoais, segurança e plano.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar (Tabs) */}
        <div className="md:col-span-1 space-y-2">
            {[
                { id: 'profile', label: 'Meu Perfil', icon: '👤' },
                { id: 'security', label: 'Segurança', icon: '🔒' },
                { id: 'financial', label: 'Plano & Cotas', icon: '💳' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                        activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                    <span>{tab.icon}</span> {tab.label}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
            {message.text && (
                <div className={`mb-6 p-4 rounded-lg border text-sm font-bold ${message.type === 'error' ? 'bg-red-900/20 border-red-900/50 text-red-400' : 'bg-emerald-900/20 border-emerald-900/50 text-emerald-400'}`}>
                    {message.text}
                </div>
            )}

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
                <form onSubmit={handleSave} className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl animate-fade-in">
                    <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-slate-700">Informações Pessoais</h3>
                    
                    <div className="flex flex-col md:flex-row gap-8 mb-8">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-32 h-32 rounded-full border-4 border-slate-700 overflow-hidden bg-slate-900 relative group">
                                {formData.avatar ? (
                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-600">
                                        {formData.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-xs font-bold">ALTERAR</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            <p className="text-[10px] text-slate-500 text-center">JPG/PNG máx 1MB</p>
                        </div>

                        {/* Inputs */}
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Telefone</label>
                                    <input 
                                        type="text" 
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email (Login)</label>
                                <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50">
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
                <form onSubmit={handleSave} className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-xl animate-fade-in">
                    <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-slate-700">Redefinir Senha</h3>
                    
                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nova Senha</label>
                            <input 
                                type="password" 
                                value={formData.new_password}
                                onChange={(e) => setFormData({...formData, new_password: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                                placeholder="••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Confirmar Senha</label>
                            <input 
                                type="password" 
                                value={formData.confirm_password}
                                onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                                placeholder="••••••"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-700 flex justify-between items-center">
                        <p className="text-xs text-slate-500">Última alteração: Desconhecido</p>
                        <button type="submit" disabled={!formData.new_password || loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg transition-all">
                            Atualizar Senha
                        </button>
                    </div>
                </form>
            )}

            {/* TAB: FINANCIAL */}
            {activeTab === 'financial' && (
                <div className="space-y-6 animate-fade-in">
                    
                    {/* Usage Metrics Card */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl text-white font-bold select-none pointer-events-none">AI</div>
                        <h3 className="text-lg font-bold text-white mb-6">Consumo de Inteligência</h3>
                        
                        {metrics ? (
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400">Tokens Processados (IA)</span>
                                        <span className="text-white font-bold">
                                            {metrics.total_tokens.toLocaleString()} / {metrics.plan_limit.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-1000" 
                                            style={{ width: `${Math.min((metrics.total_tokens / metrics.plan_limit) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 text-right">Renova mensalmente</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Requisições Totais</p>
                                        <p className="text-xl font-bold text-white">{metrics.total_requests}</p>
                                    </div>
                                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Custo Estimado (Uso)</p>
                                        <p className="text-xl font-bold text-emerald-400">${metrics.estimated_cost.toFixed(4)}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">Carregando métricas...</div>
                        )}
                    </div>

                    {/* Payment History */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4">Histórico Financeiro</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-400">
                                <thead className="bg-slate-950 text-xs font-bold uppercase text-slate-500 border-b border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3">Data</th>
                                        <th className="px-4 py-3">Referência</th>
                                        <th className="px-4 py-3">Descrição</th>
                                        <th className="px-4 py-3 text-right">Valor</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {payments.length === 0 ? (
                                        <tr><td colSpan={5} className="p-6 text-center italic">Nenhum pagamento registrado.</td></tr>
                                    ) : (
                                        payments.map(pay => (
                                            <tr key={pay.id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="px-4 py-3">{new Date(pay.payment_date).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{pay.reference_id}</td>
                                                <td className="px-4 py-3 text-xs truncate max-w-[200px]">{pay.notes}</td>
                                                <td className="px-4 py-3 text-right font-bold text-white">R$ {Number(pay.amount).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="bg-emerald-900/20 text-emerald-400 border border-emerald-900/50 px-2 py-1 rounded text-[10px] uppercase font-bold">
                                                        Pago
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}
        </div>
      </div>
    </div>
  );
};