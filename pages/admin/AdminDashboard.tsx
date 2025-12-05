import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { User, Subscription } from '../../types';
import { PaymentModal } from '../../components/PaymentModal';

interface AdminDashboardProps {
  currentAdminId: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentAdminId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ users: 0, mrr: 0, paymentsToday: 0 });
  const [searchTerm, setSearchTerm] = useState(''); // Estado da Busca
  
  const refreshData = () => {
    const u = db.getUsers();
    const s = db.getSubscriptions();
    const p = db.getPayments(); 
    setUsers(u);
    setSubs(s);

    // Calculate Stats
    const activeSubs = s.filter(sub => sub.status === 'active');
    const mrr = activeSubs.reduce((acc, sub) => acc + (sub.plan_id === 'p2' ? 299 : 99), 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayTotal = p
      .filter(pay => pay.payment_date === today)
      .reduce((acc, pay) => acc + pay.amount, 0);

    setStats({
      users: u.length,
      mrr: mrr,
      paymentsToday: todayTotal
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const getSubForUser = (userId: string) => subs.find(s => s.user_id === userId);

  // Filtragem (Nome ou Email)
  const filteredUsers = users.filter(u => 
    u.role !== 'admin' && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 bg-slate-900 min-h-full text-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Visão Geral</h2>
        <p className="text-slate-500">Monitoramento financeiro e operacional.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-600 transition-colors">
          <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-wider">Base de Usuários</p>
          <p className="text-3xl font-bold text-white">{stats.users.toLocaleString()}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-600 transition-colors">
          <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-wider">Receita Mensal (MRR)</p>
          <p className="text-3xl font-bold text-blue-400">R$ {stats.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-600 transition-colors">
          <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-wider">Entradas Hoje</p>
          <p className="text-3xl font-bold text-green-500">R$ {stats.paymentsToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>👥</span> Clientes Recentes
        </h3>
        
        {/* Campo de Busca */}
        <div className="relative w-full md:w-64">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </div>
           <input 
             type="text"
             placeholder="Filtrar clientes..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-slate-950 border border-slate-700 text-sm rounded-lg pl-9 pr-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
           />
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-xs border-b border-slate-700">
            <tr>
              <th className="px-6 py-4">Nome / Email</th>
              <th className="px-6 py-4">Plano</th>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4 text-right">Financeiro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredUsers.length === 0 ? (
               <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum cliente encontrado com este filtro.</td></tr>
            ) : (
              filteredUsers.map(user => {
                const sub = getSubForUser(user.id);
                const isExpired = sub?.status === 'expired';
                const planName = sub?.plan_id === 'p2' ? 'Enterprise Pro' : 'Básico';
                
                return (
                  <tr key={user.id} className="hover:bg-slate-750 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-slate-500 text-xs">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <span className="bg-slate-900 border border-slate-600 text-slate-300 text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider">
                          {planName}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Inativo</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <div>
                           <div className={`flex items-center gap-1.5 font-bold text-xs uppercase ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
                             {sub.status === 'active' ? 'Ativo' : 'Expirado'}
                           </div>
                           <div className="text-slate-500 text-xs mt-0.5">Renova em: {sub.end_date}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sub && (
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/50 text-xs font-bold py-1.5 px-3 rounded transition-all ml-auto flex items-center gap-1"
                        >
                          $ Registrar Pagamento
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <PaymentModal
          user={selectedUser}
          subscription={getSubForUser(selectedUser.id)}
          adminId={currentAdminId}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => {
            setSelectedUser(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
};