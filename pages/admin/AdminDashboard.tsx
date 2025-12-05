import React, { useState, useEffect } from 'react';
import { api } from '../../services/api'; // Mudança para API real
import { User, Subscription, Payment } from '../../types';
import { PaymentModal } from '../../components/PaymentModal';

interface AdminDashboardProps {
  currentAdminId: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentAdminId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [stats, setStats] = useState({ users: 0, mrr: 0, paymentsToday: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Executa chamadas em paralelo para performance
      const [usersData, subsData, paymentsData] = await Promise.all([
        api.getUsers(),
        api.getSubscriptions(),
        api.getPayments()
      ]);

      setUsers(usersData);
      setSubs(subsData);
      calculateStats(usersData, subsData, paymentsData);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar dados do servidor. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (u: User[], s: Subscription[], p: Payment[]) => {
    const activeSubs = s.filter(sub => sub.status === 'active');
    // Preço deve vir do plano, aqui simplificado para logica de frontend
    const mrr = activeSubs.reduce((acc, sub) => acc + (sub.plan_id.includes('pro') ? 299 : 99), 0);
    
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

  useEffect(() => {
    fetchData();
  }, []);

  const getSubForUser = (userId: string) => subs.find(s => s.user_id === userId);

  const filteredUsers = users.filter(u => 
    u.role !== 'admin' && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    <div className="p-8 bg-slate-900 min-h-full text-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Visão Geral (Produção)</h2>
        <p className="text-slate-500">Dados em tempo real do banco PostgreSQL.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          <p className="text-3xl font-bold text-green-500">R$ {stats.paymentsToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
                // Lógica simples para identificar se está expirado
                const isExpired = sub?.status === 'expired' || (sub?.end_date ? new Date(sub.end_date) < new Date() : false);
                
                return (
                  <tr key={user.id} className="hover:bg-slate-750 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{user.name}</div>
                      <div className="text-slate-500 text-xs">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <span className="bg-slate-900 border border-slate-600 text-slate-300 text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider">
                          {sub.plan_id.substring(0, 8)}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Sem Plano</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <div>
                           <div className={`flex items-center gap-1.5 font-bold text-xs uppercase ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                             <div className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}></div>
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
                          className="bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-600/50 text-xs font-bold py-1.5 px-3 rounded transition-all ml-auto flex items-center gap-1"
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
            fetchData(); // Recarrega dados reais após pagamento
          }}
        />
      )}
    </div>
  );
};