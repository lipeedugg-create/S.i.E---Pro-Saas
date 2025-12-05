import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/db';

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'client' as 'admin' | 'client'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.upsertUser({
      id: user?.id,
      ...formData
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
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
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 focus:outline-none transition-colors"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Corporativo</label>
            <input
              type="email"
              required
              disabled={!!user} // Email fixo na edição
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={`w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 focus:outline-none transition-colors ${user ? 'opacity-50 cursor-not-allowed' : ''}`}
              placeholder="Ex: joao@empresa.com"
            />
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Função / Cargo</label>
             <select
               value={formData.role}
               onChange={(e) => setFormData({...formData, role: e.target.value as 'admin'|'client'})}
               className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 focus:outline-none"
             >
               <option value="client">Cliente Enterprise</option>
               <option value="admin">Administrador do Sistema</option>
             </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 font-medium"
            >
              Salvar Dados
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};