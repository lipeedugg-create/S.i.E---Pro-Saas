import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plugin, Plan } from '../../types';
import { PlanModal } from '../../components/PlanModal';

export const AdminAddons: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States para CRUD de Planos
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const loadData = async () => {
    setLoading(true); // Re-enable loading on refresh for better UX feedback
    try {
      const [allPlugins, allPlans] = await Promise.all([
        api.getPlugins(),
        api.getPlans()
      ]);
      setPlugins(allPlugins.filter(p => p.status !== 'available'));
      setPlans(allPlans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers para Planos
  const handleCreatePlan = () => {
      setEditingPlan(null);
      setIsPlanModalOpen(true);
  };

  const handleEditPlan = (plan: Plan) => {
      setEditingPlan(plan);
      setIsPlanModalOpen(true);
  };

  const handleDeletePlan = async (id: string) => {
      if(!confirm('Tem certeza? Isso pode falhar se houver usuários assinando este plano.')) return;
      try {
          await api.deletePlan(id);
          loadData();
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handlePlanSuccess = () => {
      setIsPlanModalOpen(false);
      loadData();
  };

  // Handlers para Features
  const handleToggleFeature = async (id: string, currentStatus: string) => {
      const newStatus = currentStatus === 'active' ? 'installed' : 'active';
      await api.updatePluginStatus(id, newStatus);
      loadData();
  };

  const handleDeletePlugin = async (id: string) => {
    if (!confirm('ATENÇÃO: Isso excluirá permanentemente o plugin do sistema e removerá o acesso de todos os planos. Deseja continuar?')) return;
    try {
        await api.deletePlugin(id);
        loadData();
    } catch (err: any) {
        alert(err.message || 'Erro ao excluir plugin.');
    }
  };

  const handleTogglePlanAccess = async (pluginId: string, planId: string) => {
      await api.togglePluginForPlan(pluginId, planId);
      loadData();
  };

  return (
    <div className="p-8 bg-slate-900 min-h-full text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-bold text-white mb-2">Planos & Recursos</h2>
            <p className="text-slate-500">Gerencie níveis de assinatura e distribuição de funcionalidades.</p>
        </div>
        <button 
            onClick={handleCreatePlan}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
        >
            <span>+</span> Novo Plano
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Plans Management */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col h-full">
            <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2 border-b border-slate-700 pb-4">
              <span className="text-blue-500">📦</span> Catálogo de Planos
            </h3>
            {plans.length === 0 ? (
                <div className="text-center p-6 bg-slate-900/50 rounded-lg border border-dashed border-slate-700">
                    <p className="text-slate-500 text-sm">Nenhum plano cadastrado.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                {plans.map(plan => (
                    <li key={plan.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-500 transition-all group relative">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className="font-bold text-white text-lg">{plan.name}</span>
                                <span className="ml-2 text-[10px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono border border-slate-700">#{plan.id}</span>
                            </div>
                            <span className="text-emerald-400 font-mono font-bold">R$ {Number(plan.price).toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2">{(plan as any).description}</p>
                        
                        <div className="flex gap-2 justify-end border-t border-slate-700 pt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleEditPlan(plan)}
                                className="text-xs font-bold text-blue-400 hover:text-white px-2 py-1 rounded hover:bg-blue-600/20 transition-colors"
                            >
                                EDITAR
                            </button>
                            <button 
                                onClick={() => handleDeletePlan(plan.id)}
                                className="text-xs font-bold text-red-500 hover:text-white px-2 py-1 rounded hover:bg-red-600/20 transition-colors"
                            >
                                EXCLUIR
                            </button>
                        </div>
                    </li>
                ))}
                </ul>
            )}
          </div>

          {/* Features Toggles */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col h-full">
            <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2 border-b border-slate-700 pb-4">
              <span className="text-purple-500">⚡</span> Distribuição de Recursos
            </h3>
            
            {plugins.length === 0 ? (
                <div className="text-center p-8 bg-slate-900/50 rounded-lg border border-dashed border-slate-700 text-slate-500 text-sm">
                    <p>Nenhum plugin instalado.</p>
                    <p className="mt-2 text-xs">Vá até a <strong className="text-white">Loja de Plugins</strong> para instalar novos módulos.</p>
                </div>
            ) : (
              <div className="space-y-4">
                  {plugins.map(plugin => (
                      <div key={plugin.id} className="pb-4 border-b border-slate-700/50 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                  <span className="text-lg">{plugin.icon}</span>
                                  <div>
                                      <span className="block text-sm font-bold text-white">{plugin.name}</span>
                                      <span className="text-xs text-slate-500">v{plugin.version} • {plugin.category}</span>
                                  </div>
                              </div>
                              <div className="flex items-center gap-3">
                                  <div 
                                      onClick={() => handleToggleFeature(plugin.id, plugin.status)}
                                      className={`w-11 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${
                                          plugin.status === 'active' ? 'bg-green-600' : 'bg-slate-600'
                                      }`}
                                  >
                                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${
                                          plugin.status === 'active' ? 'right-0.5' : 'left-0.5'
                                      }`}></div>
                                  </div>
                                  <button 
                                    onClick={() => handleDeletePlugin(plugin.id)}
                                    title="Excluir Plugin do Sistema"
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-900/20 transition-all border border-transparent hover:border-red-900/30"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                              </div>
                          </div>

                          {plugin.status === 'active' && (
                              <div className="ml-10 bg-slate-900/40 p-3 rounded-lg border border-slate-700/30 flex flex-wrap gap-4">
                                  <span className="text-xs font-bold text-slate-500 w-full uppercase">Disponível em:</span>
                                  {plans.map(plan => (
                                      <label key={plan.id} className="flex items-center gap-2 cursor-pointer group select-none">
                                          <input 
                                              type="checkbox" 
                                              checked={plugin.allowed_plans?.includes(plan.id)}
                                              onChange={() => handleTogglePlanAccess(plugin.id, plan.id)}
                                              className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                          />
                                          <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{plan.name}</span>
                                      </label>
                                  ))}
                                  {plans.length === 0 && <span className="text-xs text-slate-600 italic">Crie planos primeiro</span>}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {isPlanModalOpen && (
          <PlanModal 
             plan={editingPlan}
             onClose={() => setIsPlanModalOpen(false)}
             onSuccess={handlePlanSuccess}
          />
      )}
    </div>
  );
};