import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { User, Subscription } from '../../types';
import { UserModal } from '../../components/UserModal';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const loadData = () => {
    setUsers(db.getUsers());
    setSubs(db.getSubscriptions());
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

  const handleSuccess = () => {
    setIsModalOpen(false);
    loadData();
  };

  // Lógica de Filtro
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-900 min-h-full text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestão de Usuários</h2>
          <p className="text-slate-500">Controle de acesso e assinaturas.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-lg shadow-blue-600/20 font-medium flex items-center gap-2 transition-all"
        >
          <span>+</span> Novo Usuário
        </button>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 mb-6 backdrop-blur-sm">
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
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg pl-10 pr-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-600"
          />
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-xs border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Função</th>
              <th className="px-6 py-4">Plano</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredUsers.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Nenhum usuário encontrado.</td>
               </tr>
            ) : (
              filteredUsers.map(user => {
                const sub = subs.find(s => s.user_id === user.id);
                return (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{user.name}</div>
                      <div className="text-slate-500 text-xs">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        user.role === 'admin' 
                        ? 'bg-purple-900/30 text-purple-400 border border-purple-800' 
                        : 'bg-slate-700 text-slate-300 border border-slate-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {sub ? (
                        <span className="text-slate-300 font-medium">{sub.plan_id === 'p2' ? 'Enterprise Pro' : 'Básico'}</span>
                      ) : (
                        <span className="text-slate-600 italic">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       {sub ? (
                         <div className={`flex items-center gap-1.5 font-bold ${sub.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                           <div className={`w-2 h-2 rounded-full ${sub.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                           {sub.status === 'active' ? 'Ativo' : 'Expirado'}
                         </div>
                       ) : <span className="text-slate-600">N/A</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleEdit(user)}
                         className="text-blue-400 hover:text-white font-medium hover:underline text-xs"
                       >
                         Editar
                       </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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