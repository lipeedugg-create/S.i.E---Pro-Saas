import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, Subscription, Payment, Plan } from '../../types';
import { PaymentModal } from '../../components/PaymentModal';

interface AdminDashboardProps {
  currentAdminId: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentAdminId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ users: 0, mrr: 0, paymentsToday: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [chartData, setChartData] = useState<{day: string, value: number}[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersData, subsData, paymentsData, plansData] = await Promise.all([
        api.getUsers(),
        api.getSubscriptions(),
        api.getPayments(),
        api.getPlans()
      ]);

      setUsers(usersData);
      setSubs(subsData);
      setPlans(plansData);
      calculateStats(usersData, subsData, paymentsData, plansData);
      calculateChartData(subsData, plansData);

    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados do servidor. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (u: User[], s: Subscription[], p: Payment[], pl: Plan[]) => {
    const activeSubs = s.filter(sub => sub.status === 'active');
    
    const mrr = activeSubs.reduce((acc, sub) => {
        const plan = pl.find(x => x.id === sub.plan_id);
        return acc + (plan ? Number(plan.price) : 0);
    }, 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayTotal = p
      .filter(pay => pay.payment_date.startsWith(today))
      .reduce((acc, pay) => acc + Number(pay.amount), 0);

    setStats({
      users: u.length,
      mrr: mrr,
      paymentsToday: todayTotal
    });
  };

  const calculateChartData = (s: Subscription[], pl: Plan[]) => {
    const days = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().split('T')[0]);
    }

    for (const day of days) {
        const dailyMRR = s.reduce((acc, sub) => {
            // Verifica se a assinatura estava ativa naquele dia (simplificado para lógica visual)
            if (sub.start_date <= day && (sub.end_date >= day || !sub.end_date)) {
                if (sub.status === 'active' || (sub.end_date && sub.end_date >= day)) {
                   const plan = pl.find(x => x.id === sub.plan_id);
                   return acc + (plan ? Number(plan.price) : 0);
                }
            }
            return acc;
        }, 0);
        data.push({ day, value: dailyMRR });
    }
    setChartData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSubForUser = (userId: string) => subs.find(s => s.user_id === userId);

  const filteredUsers = users.filter(u => 
    u.role !== 'admin' && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const maxChartValue = Math.max(...chartData.map(d => d.value)) || 100;

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center text-slate-400">
            <div className="flex flex-col items-center gap-4">
                <span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <p>Carregando dados do banco de dados...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-8 text-center">
            <div className="bg-red-900/20 border border-red-800 text-red-200 p-6 rounded-xl inline-block max-w-md">
                <h3 className="font-bold text-lg mb-2">Erro de Conexão</h3>
                <p>{error}</p>
                <button onClick={fetchData} className="mt-4 bg-red-800 hover:bg-red-700 px-4 py-2 rounded text-sm">Tentar Novamente</button>
            </div>
        </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 text-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Visão Geral (Produção)</h2>
        <p className="text-slate-500">Dados em tempo real do banco PostgreSQL.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
          <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-wider">Base de Usuários</p>
          <p className="text-3xl font-bold text-white">{stats.users.toLocaleString()}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
          <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-wider">Receita Mensal (MRR)</p>
          <p className="text-3xl font-bold text-blue-400">R$ {stats.mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
          <p className="text-slate-400 text-sm mb-1 uppercase font-bold tracking-wider">Entradas Hoje</p>
          <p className="text-3xl font-bold text-emerald-400">R$ {stats.paymentsToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg flex flex-col justify-between">
             <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-bold uppercase text-slate-400">Evolução MRR (7 dias)</span>
             </div>
             <div className="flex items-end gap-2 h-16 pt-2">
                {chartData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group relative cursor-help">
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-950 text-white text-[10px] px-2 py-1 rounded border border-slate-700 whitespace-nowrap z-10">
                            {d.day.split('-').reverse().slice(0, 2).join('/')}: R$ {d.value.toFixed(2)}
                        </div>
                        <div 
                           className="w-full bg-blue-600 rounded-t-sm opacity-60 hover:opacity-100 transition-all"
                           style={{ height: `${(d.value / (maxChartValue || 1)) * 100}%` }}
                        ></div>
                    </div>
                ))}
             </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span>👥</span> Clientes Recentes
        </h3>
        
        <input 
             type="text"
             placeholder="Filtrar clientes..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full md:w-64 bg-slate-950 border border-slate-700 text-sm rounded-lg px-3 py-2 text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
        />
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
               <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum cliente encontrado.</td></tr>
            ) : (
              filteredUsers.map(user => {
                const sub = getSubForUser(user.id);
                const isExpired = sub?.status === 'expired' || (sub?.end_date ? new Date(sub.end_date) < new Date() : false);
                const planName = sub ? (plans.find(p => p.id === sub.plan_id)?.name || sub.plan_id) : 'Sem Plano';
                
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
                        <span className="text-slate-600 italic">Sem Plano</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <div>
                           <div className={`flex items-center gap-1.5 font-bold text-xs uppercase ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                             {isExpired ? 'Expirado' : 'Ativo'}
                           </div>
                           <div className="text-slate-500 text-xs mt-0.5">Renova: {new Date(sub.end_date).toLocaleDateString()}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sub && (
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 text-xs font-bold py-1.5 px-3 rounded transition-all ml-auto flex items-center gap-1"
                        >
                          $ Renovar
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
            fetchData();
          }}
        />
      )}
    </div>
  );
};