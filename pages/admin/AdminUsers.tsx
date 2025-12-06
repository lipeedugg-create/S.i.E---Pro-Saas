import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, Subscription, Plan } from '../../types';
import { UserModal } from '../../components/UserModal';

interface AdminUsersProps {
  onLogin?: (user: User) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onLogin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros e UI
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [planFilter, setPlanFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, sData, pData] = await Promise.all([
        api.getUsers(),
        api.getSubscriptions(),
        api.getPlans()
      ]);
      setUsers(uData);
      setSubs(sData);
      setPlans(pData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleImpersonate = async (user: User) => {
    if (!onLogin) return;
    if (!confirm(`⚠ ATENÇÃO: Acessar conta de "${user.name}"?`)) return;

    try {
      const { user: impersonatedUser, token } = await api.impersonate(user.id);
      localStorage.setItem('token', token);
      onLogin(impersonatedUser);
    } catch (err) {
      alert('Falha ao realizar login.');
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  // Lógica de Filtragem
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const sub = subs.find(s => s.user_id === user.id);
    const matchesStatus = statusFilter === 'all' ? true : (user.status || 'active') === statusFilter;
    
    // Filtro de Plano (Verifica se subscription.plan_id bate com o filtro)
    const matchesPlan = planFilter === 'all' ? true : sub?.plan_id === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Métricas Rápidas
  const totalUsers = users.length;
  const activeUsers = users.filter(u => (u.status || 'active') === 'active').length;
  const inactiveUsers = totalUsers - activeUsers;
  // Assumindo created_at existe
  const newUsersThisMonth = users.filter(u => {
      if(!u.created_at) return false;
      const date = new Date(u.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="p-8 bg-slate-900 min-h-full text-slate-200">
      
      {/* Header & Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Visão Geral de Clientes (CRM)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
                <p className="text-slate-500 text-xs font-bold uppercase">Total Clientes</p>
                <p className="text-2xl font-bold text-white mt-1">{totalUsers}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
                <p className="text-emerald-500 text-xs font-bold uppercase">Contas Ativas</p>
                <p className="text-2xl font-bold text-white mt-1">{activeUsers}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
                <p className="text-red-500 text-xs font-bold uppercase">Inativos / Bloq.</p>
                <p className="text-2xl font-bold text-white mt-1">{inactiveUsers}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow">
                <p className="text-blue-500 text-xs font-bold uppercase">Novos (Mês)</p>
                <p className="text-2xl font-bold text-white mt-1">+{newUsersThisMonth}</p>
            </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-800">
          <div className="flex flex-1 gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </span>
                <input
                    type="text"
                    placeholder="Buscar nome, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg pl-9 pr-4 py-2 focus:border-blue-500 outline-none text-sm"
                />
            </div>
            
            <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
            </select>

            <select 
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
                <option value="all">Todos os Planos</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <button 
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-lg font-bold text-sm flex items-center gap-2 transition-all"
          >
            <span>+</span> Novo Cliente
          </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            Carregando base de clientes...
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Status Conta</th>
                <th className="px-6 py-4">Plano Atual</th>
                <th className="px-6 py-4">Último Acesso</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredUsers.length === 0 ? (
                 <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">Nenhum cliente encontrado com os filtros atuais.</td></tr>
              ) : (
                filteredUsers.map(user => {
                  const sub = subs.find(s => s.user_id === user.id);
                  const plan = plans.find(p => p.id === sub?.plan_id);
                  const isActive = (user.status || 'active') === 'active';
                  
                  return (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-sm border-2 border-slate-600 shadow-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm">{user.name}</div>
                                <div className="text-slate-500 text-xs">{user.email}</div>
                                {user.phone && <div className="text-slate-600 text-[10px] mt-0.5">📞 {user.phone}</div>}
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                          isActive 
                          ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/30' 
                          : 'bg-red-900/20 text-red-400 border-red-900/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {sub ? (
                            <div>
                                <span className="text-white font-medium text-xs bg-slate-900 px-2 py-1 rounded border border-slate-700">
                                    {plan ? plan.name : sub.plan_id}
                                </span>
                                <div className="text-[10px] text-slate-500 mt-1">
                                    Vence: {new Date(sub.end_date).toLocaleDateString()}
                                </div>
                            </div>
                        ) : (
                            <span className="text-slate-600 text-xs italic">Sem assinatura</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                          {user.last_login ? (
                              <div className="text-xs text-slate-400">
                                  {new Date(user.last_login).toLocaleDateString()} <br/>
                                  <span className="text-[10px] text-slate-600">{new Date(user.last_login).toLocaleTimeString()}</span>
                              </div>
                          ) : (
                              <span className="text-slate-600 text-xs">-</span>
                          )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                             {user.role !== 'admin' && (
                                 <button
                                    onClick={() => handleImpersonate(user)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Login como Usuário"
                                 >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                 </button>
                             )}
                             <button 
                               onClick={() => handleEdit(user)}
                               className="bg-slate-700 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded transition-all border border-slate-600 hover:border-blue-500"
                             >
                               Gerenciar
                             </button>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <UserModal 
          user={editingUser} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}
    </div>
  );
};