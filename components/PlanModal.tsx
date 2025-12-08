import React, { useState, useEffect } from 'react';
import { Plan, Plugin } from '../types';
import { api } from '../services/api';

interface PlanModalProps {
  plan?: Plan | null;
  plugins: Plugin[];
  onClose: () => void;
  onSuccess: () => void;
}

export const PlanModal: React.FC<PlanModalProps> = ({ plan, plugins, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    price: '',
    description: '',
    token_limit: '10000'
  });
  const [selectedPluginIds, setSelectedPluginIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        id: plan.id,
        name: plan.name,
        price: plan.price.toString(),
        description: (plan as any).description || '',
        token_limit: plan.token_limit ? plan.token_limit.toString() : '10000'
      });
      // Identifica plugins que já estão vinculados a este plano
      const active = plugins
        .filter(p => p.allowed_plans?.includes(plan.id))
        .map(p => p.id);
      setSelectedPluginIds(active);
    } else {
        setFormData({
            id: '',
            name: '',
            price: '',
            description: '',
            token_limit: '10000'
        });
        setSelectedPluginIds([]);
    }
  }, [plan, plugins]);

  const togglePlugin = (pluginId: string) => {
      setSelectedPluginIds(prev => 
          prev.includes(pluginId) 
          ? prev.filter(id => id !== pluginId) 
          : [...prev, pluginId]
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        // 1. Salva/Cria o Plano
        const savedPlan = await api.upsertPlan({
            id: formData.id,
            name: formData.name,
            price: parseFloat(formData.price),
            // @ts-ignore
            description: formData.description,
            token_limit: parseInt(formData.token_limit),
            isNew: !plan
        });

        // 2. Atualiza Vínculos de Plugins (Recursos)
        // Precisamos calcular a diferença para chamar o toggle apenas onde necessário
        const planId = savedPlan.id;
        
        // Plugins que estavam ativos originalmente
        const originalActiveIds = plan 
            ? plugins.filter(p => p.allowed_plans?.includes(plan.id)).map(p => p.id)
            : [];

        // Para cada plugin disponível
        for (const plugin of plugins) {
            const isSelected = selectedPluginIds.includes(plugin.id);
            const wasSelected = originalActiveIds.includes(plugin.id);

            // Se o estado mudou, chama o toggle
            if (isSelected !== wasSelected) {
                await api.togglePluginForPlan(plugin.id, planId);
            }
        }

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
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-900/20 to-slate-900 shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-blue-400">📦</span>
            {plan ? 'Editar Plano & Recursos' : 'Novo Plano'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          
          {/* Basic Info */}
          <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">Definição Comercial</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">ID do Sistema</label>
                    <input
                    type="text"
                    required
                    disabled={!!plan}
                    placeholder="ex: enterprise-plus"
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className={`w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none font-mono text-sm ${plan ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Preço Mensal</label>
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
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cota de Tokens IA</label>
                    <input
                        type="number"
                        required
                        value={formData.token_limit}
                        onChange={(e) => setFormData({...formData, token_limit: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-purple-500 outline-none font-mono"
                    />
                  </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Descrição (Marketing)</label>
                <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:border-blue-500 outline-none h-20 resize-none text-sm"
                placeholder="Benefícios inclusos..."
                />
              </div>
          </div>

          {/* Feature Selection */}
          <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">Recursos Inclusos (Plugins)</h3>
              
              {plugins.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Nenhum plugin ativo no sistema.</p>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {plugins.map(plugin => {
                          const isChecked = selectedPluginIds.includes(plugin.id);
                          return (
                              <div 
                                key={plugin.id}
                                onClick={() => togglePlugin(plugin.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                    isChecked 
                                    ? 'bg-blue-900/20 border-blue-500/50' 
                                    : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-600 bg-slate-900'}`}>
                                      {isChecked && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                          <span className="text-lg">{plugin.icon}</span>
                                          <span className={`text-sm font-bold ${isChecked ? 'text-white' : 'text-slate-400'}`}>{plugin.name}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 line-clamp-1">{plugin.description}</p>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              )}
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors font-bold text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-bold shadow-blue-900/20 text-sm flex justify-center items-center gap-2"
            >
              {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Salvando...
                  </>
              ) : 'Confirmar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};