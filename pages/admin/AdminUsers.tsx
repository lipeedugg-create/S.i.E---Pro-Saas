import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, Subscription } from '../../types';
import { UserModal } from '../../components/UserModal';

interface AdminUsersProps {
  onLogin?: (user: User) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onLogin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, sData] = await Promise.all([
        api.getUsers(),
        api.getSubscriptions()
      ]);
      setUsers(uData);
      setSubs(sData);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
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
    if (!confirm(`Tem certeza que deseja acessar o painel como "${user.name}"?\nIsso encerrará sua sessão administrativa atual.`)) return;

    try {
      const { user: impersonatedUser, token } = await api.impersonate(user.id);
      localStorage.setItem('token', token);
      onLogin(impersonatedUser);
    } catch (err) {
      alert('Falha ao realizar login como usuário. Verifique se o backend está atualizado.');
      console.error(err);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    loadData(); // Recarrega lista
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-900 min-h-full text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão de Usuários</h2>
          <p className="text-slate-500">Administração de contas e acesso rápido.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-lg font-medium flex items-center gap-2"
        >
          <span>+</span> Novo Usuário
        </button>
      </div>

      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">
            <span className="inline-block w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-2"></span>
            Carregando registros...
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-xs border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Função</th>
                <th className="px-6 py-4">Assinatura</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredUsers.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum usuário encontrado.</td>
                 </tr>
              ) : (
                filteredUsers.map(user => {
                  const sub = subs.find(s => s.user_id === user.id);
                  const isExpired = sub?.status === 'expired' || (sub?.end_date ? new Date(sub.end_date) < new Date() : false);
                  
                  return (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-bold text-xs border border-slate-500/50">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="font-bold text-white">{user.name}</div>
                                <div className="text-slate-500 text-xs">{user.email}</div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                          user.role === 'admin' 
                          ? 'bg-purple-900/20 text-purple-400 border-purple-900/50' 
                          : 'bg-blue-900/20 text-blue-400 border-blue-900/50'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {sub ? (
                            <div className="flex flex-col">
                                <span className={`text-xs font-medium ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {sub.plan_id.replace(/^p/, 'Plano ')} • {isExpired ? 'Expirado' : 'Ativo'}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    Vence: {new Date(sub.end_date).toLocaleDateString()}
                                </span>
                            </div>
                        ) : (
                            <span className="text-slate-600 text-xs italic">Sem assinatura</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                             {user.role !== 'admin' && (
                                 <button
                                    onClick={() => handleImpersonate(user)}
                                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600 text-xs font-bold py-1.5 px-3 rounded transition-all flex items-center gap-1 group"
                                    title="Acessar painel como este usuário"
                                 >
                                    <span className="group-hover:text-white">Login ➜</span>
                                 </button>
                             )}
                             <button 
                               onClick={() => handleEdit(user)}
                               className="text-blue-400 hover:text-white font-medium hover:underline text-xs bg-blue-900/10 hover:bg-blue-600/20 px-3 py-1.5 rounded border border-transparent hover:border-blue-500/30 transition-all"
                             >
                               Editar
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