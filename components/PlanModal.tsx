import React, { useState, useEffect } from 'react';
import { Plan } from '../types';
import { api } from '../services/api';

interface PlanModalProps {
  plan?: Plan | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const PlanModal: React.FC<PlanModalProps> = ({ plan, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        id: plan.id,
        name: plan.name,
        price: plan.price.toString(),
        description: (plan as any).description || '' // Type casting caso description não esteja estritamente tipada
      });
    } else {
        setFormData({
            id: '',
            name: '',
            price: '',
            description: ''
        });
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await api.upsertPlan({
            id: formData.id,
            name: formData.name,
            price: parseFloat(formData.price),
            // @ts-ignore
            description: formData.description,
            isNew: !plan
        });
        onSuccess();
    } catch (error: any) {
        alert('Erro ao salvar plano: ' + error.message);
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-slate-900">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-blue-400">📦</span>
            {plan ? 'Editar Plano' : 'Novo Plano'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">ID do Sistema (Slug)</label>
            <input
              type="text"
              required
              disabled={!!plan}
              placeholder="ex: enterprise-plus"
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
              className={`w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none font-mono text-sm ${plan ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {!plan && <p className="text-[10px] text-slate-600 mt-1">Identificador único. Não pode ser alterado depois.</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nome do Plano</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Preço Mensal (R$)</label>
            <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
                <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-8 pr-4 py-2.5 focus:border-green-500 outline-none font-mono"
                />
            </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição</label>
             <textarea
               required
               value={formData.description}
               onChange={(e) => setFormData({...formData, description: e.target.value})}
               className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none h-20 resize-none text-sm"
               placeholder="Breve descrição dos benefícios..."
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
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};