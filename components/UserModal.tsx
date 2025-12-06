import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'client' as 'admin' | 'client',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '' // Reset password field on edit load
      });
    } else {
        // Reset for create
        setFormData({
            name: '',
            email: '',
            role: 'client',
            password: ''
        });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await api.upsertUser({
            id: user?.id, // Se tiver ID é update, senão create
            ...formData
        });
        onSuccess();
    } catch (error) {
        alert('Erro ao salvar usuário.');
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
          <h2 className="text-lg font-bold text-white">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none transition-colors focus:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Corporativo</label>
            <input
              type="email"
              required
              disabled={!!user} 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={`w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none ${user ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Função / Cargo</label>
             <select
               value={formData.role}
               onChange={(e) => setFormData({...formData, role: e.target.value as 'admin'|'client'})}
               className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none"
             >
               <option value="client">Cliente Enterprise</option>
               <option value="admin">Administrador do Sistema</option>
             </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                Senha de Acesso {user && <span className="text-[10px] font-normal lowercase opacity-70">(Opcional para editar)</span>}
            </label>
            <input
              type="password"
              required={!user} // Obrigatório apenas ao criar
              placeholder={user ? "•••••••• (Manter atual)" : "Defina a senha"}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-medium shadow-blue-900/20"
            >
              {loading ? 'Salvando...' : 'Salvar Dados'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};