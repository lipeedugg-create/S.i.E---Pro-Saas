import React, { useState, useEffect } from 'react';
import { User, Subscription, Payment, Plan } from '../types';
import { api } from '../services/api';

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  
  // Dados Auxiliares
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  // Form Data
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: 'admin' | 'client';
    phone: string;
    password: string;
    status: 'active' | 'inactive' | 'suspended';
  }>({
    name: '',
    email: '',
    role: 'client',
    phone: '',
    password: '',
    status: 'active'
  });

  // State para edição de data de assinatura
  const [editEndDate, setEditEndDate] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        password: '',
        status: user.status || 'active'
      });
      fetchExtraData(user.id);
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'client',
        phone: '',
        password: '',
        status: 'active'
      });
    }
  }, [user]);

  const fetchExtraData = async (userId: string) => {
    setLoadingExtras(true);
    try {
        const [subs, pays, plansList] = await Promise.all([
            api.getSubscriptions(),
            api.getPaymentsByUser(userId),
            api.getPlans()
        ]);
        const sub = subs.find(s => s.user_id === userId) || null;
        setSubscription(sub);
        setPayments(pays);
        setPlans(plansList);
        if(sub) setEditEndDate(sub.end_date);
    } catch(e) {
        console.error(e);
    } finally {
        setLoadingExtras(false);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await api.upsertUser({
            id: user?.id,
            ...formData
        });
        onSuccess();
    } catch (error) {
        alert('Erro ao salvar usuário.');
    } finally {
        setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'active' | 'inactive' | 'suspended') => {
      if(!user) return;
      if(!confirm(`Tem certeza que deseja alterar o status para ${newStatus}?`)) return;
      await api.updateUserStatus(user.id, newStatus);
      setFormData({...formData, status: newStatus});
      onSuccess();
  };

  const handleUpdateSubscriptionDate = async () => {
      if(!subscription) return;
      try {
          await api.updateSubscriptionDate(subscription.id, editEndDate);
          alert('Data de vencimento atualizada!');
          onSuccess();
      } catch(e) {
          alert('Erro ao atualizar data.');
      }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div>
              <h2 className="text-lg font-bold text-white">
                {user ? `Gerenciar: ${user.name}` : 'Novo Usuário'}
              </h2>
              {user && <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ml-0 ${formData.status === 'active' ? 'bg-emerald-900 text-emerald-400' : 'bg-red-900 text-red-400'}`}>{formData.status === 'active' ? 'Ativo' : 'Inativo'}</span>}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* Tabs */}
        {user && (
            <div className="flex border-b border-slate-800 bg-slate-900">
                <button onClick={() => setActiveTab('profile')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Perfil</button>
                <button onClick={() => setActiveTab('subscription')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'subscription' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Assinatura & Histórico</button>
                <button onClick={() => setActiveTab('security')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'security' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Segurança</button>
            </div>
        )}
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
            
            {/* TAB: PROFILE (Default for new users too) */}
            {(activeTab === 'profile' || !user) && (
                <form onSubmit={handleSubmitProfile} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Telefone / Contato</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="+55 11 99999-9999"
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Função</label>
                             <select
                               value={formData.role}
                               onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                               className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 outline-none"
                             >
                               <option value="client">Cliente Enterprise</option>
                               <option value="admin">Administrador</option>
                             </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                                Senha {user && <span className="opacity-50 font-normal">(Deixe em branco p/ manter)</span>}
                            </label>
                            <input
                                type="password"
                                required={!user}
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        {!user && (
                            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800">Cancelar</button>
                        )}
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg">
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            )}

            {/* TAB: SUBSCRIPTION */}
            {activeTab === 'subscription' && user && (
                <div className="space-y-6">
                    {loadingExtras ? <div className="text-center text-slate-500">Carregando dados financeiros...</div> : (
                        <>
                            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <span className="text-emerald-400">💳</span> Assinatura Atual
                                </h3>
                                {subscription ? (
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500 text-xs uppercase font-bold">Plano Contratado</p>
                                            <p className="text-white font-mono text-lg">{plans.find(p=>p.id === subscription.plan_id)?.name || subscription.plan_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs uppercase font-bold">Status</p>
                                            <p className={`font-bold ${subscription.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {subscription.status.toUpperCase()}
                                            </p>
                                        </div>
                                        <div className="col-span-2 pt-2 border-t border-slate-700 mt-2">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Vencimento (Ajuste Manual)</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="date" 
                                                    value={editEndDate ? editEndDate.split('T')[0] : ''}
                                                    onChange={(e) => setEditEndDate(e.target.value)}
                                                    className="bg-slate-950 border border-slate-700 text-white rounded px-3 py-1.5 text-sm"
                                                />
                                                <button onClick={handleUpdateSubscriptionDate} className="bg-slate-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors">Atualizar</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-slate-500 italic">Usuário não possui assinatura ativa.</p>
                                )}
                            </div>

                            <div>
                                <h3 className="text-white font-bold mb-3 text-sm">Histórico de Pagamentos</h3>
                                <div className="border border-slate-800 rounded-lg overflow-hidden">
                                    <table className="w-full text-left text-xs text-slate-400">
                                        <thead className="bg-slate-950 text-slate-500">
                                            <tr>
                                                <th className="px-4 py-2">Data</th>
                                                <th className="px-4 py-2">Valor</th>
                                                <th className="px-4 py-2">Ref</th>
                                                <th className="px-4 py-2">Nota</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800 bg-slate-900">
                                            {payments.length === 0 ? (
                                                <tr><td colSpan={4} className="p-4 text-center italic">Nenhum pagamento registrado.</td></tr>
                                            ) : (
                                                payments.map(p => (
                                                    <tr key={p.id}>
                                                        <td className="px-4 py-2">{new Date(p.payment_date).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2 text-emerald-400 font-bold">R$ {p.amount.toFixed(2)}</td>
                                                        <td className="px-4 py-2 font-mono text-[10px]">{p.reference_id}</td>
                                                        <td className="px-4 py-2 truncate max-w-[150px]">{p.notes}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && user && (
                <div className="space-y-6">
                    <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl">
                        <h3 className="text-red-400 font-bold mb-2">Zona de Perigo</h3>
                        <p className="text-slate-400 text-xs mb-4">Ações críticas de controle de acesso.</p>
                        
                        <div className="flex flex-col gap-3">
                            {formData.status === 'active' ? (
                                <button 
                                    onClick={() => handleUpdateStatus('inactive')}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>🚫</span> Bloquear Acesso do Usuário
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleUpdateStatus('active')}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>✅</span> Reativar Acesso
                                </button>
                            )}
                            
                            <button 
                                onClick={() => {
                                    const newPass = prompt("Digite a nova senha para resetar:");
                                    if(newPass) {
                                        setFormData({...formData, password: newPass});
                                        handleSubmitProfile({ preventDefault: ()=>{} } as any); // Reuso gambiarra para salvar profile com senha
                                        alert("Senha alterada com sucesso.");
                                    }
                                }}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-lg border border-slate-700 transition-colors"
                            >
                                🔒 Resetar Senha Manualmente
                            </button>
                        </div>
                    </div>
                    
                    <div className="text-xs text-slate-500">
                        <p>Último Login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca acessou'}</p>
                        <p>ID do Sistema: <span className="font-mono">{user.id}</span></p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};