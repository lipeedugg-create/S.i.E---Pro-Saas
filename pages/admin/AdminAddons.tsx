import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Plugin, Plan } from '../../types';

export const AdminAddons: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    // Filtra apenas plugins que foram instalados (installed ou active)
    const allPlugins = db.getPlugins();
    setPlugins(allPlugins.filter(p => p.status !== 'available'));
    setPlans(db.getPlans());
  }, []);

  const handleToggleFeature = (id: string, currentStatus: string) => {
      const newStatus = currentStatus === 'active' ? 'installed' : 'active';
      db.updatePluginStatus(id, newStatus);
      refreshData();
  };

  const handleTogglePlanAccess = (pluginId: string, planId: string) => {
      db.togglePluginForPlan(pluginId, planId);
      refreshData();
  };

  const refreshData = () => {
    const allPlugins = db.getPlugins();
    setPlugins(allPlugins.filter(p => p.status !== 'available'));
  };

  return (
    <div className="p-8 bg-slate-900 min-h-full text-slate-200">
      <h2 className="text-2xl font-bold text-white mb-2">Planos & Funcionalidades</h2>
      <p className="text-slate-500 mb-8">Defina quais plugins estão ativos e disponíveis para cada plano de assinatura.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Plans Management */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
            <span className="text-blue-500">📦</span> Catálogo de Planos
          </h3>
          <ul className="space-y-4">
            {plans.map(plan => (
                 <li key={plan.id} className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer group">
                    <div>
                        <span className="font-bold text-white block group-hover:text-blue-400 transition-colors">{plan.name}</span>
                        <span className="text-xs text-slate-500">ID: {plan.id}</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-medium">R$ {plan.price.toFixed(2)}</span>
                </li>
            ))}
          </ul>
          <button className="mt-6 w-full py-3 border-2 border-dashed border-slate-700 rounded-lg text-slate-500 hover:border-blue-500 hover:text-blue-400 transition-all font-medium text-sm">
            + Criar Novo Plano
          </button>
        </div>

        {/* Features Toggles (Dynamic from Installed Plugins) */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
            <span className="text-purple-500">⚡</span> Distribuição de Recursos
          </h3>
          
          {plugins.length === 0 ? (
              <div className="text-center p-8 bg-slate-900/50 rounded-lg border border-dashed border-slate-700 text-slate-500 text-sm">
                  Nenhum plugin instalado. Visite a Loja de Plugins para adicionar módulos.
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
                            <div 
                                onClick={() => handleToggleFeature(plugin.id, plugin.status)}
                                className={`w-11 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${
                                    plugin.status === 'active' ? 'bg-green-600' : 'bg-slate-600'
                                }`}
                                title="Ativar/Desativar Plugin Globalmente"
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${
                                    plugin.status === 'active' ? 'right-0.5' : 'left-0.5'
                                }`}></div>
                            </div>
                        </div>

                        {/* Plan Checkboxes - Only Show if Active */}
                        {plugin.status === 'active' && (
                            <div className="ml-10 bg-slate-900/40 p-3 rounded-lg border border-slate-700/30 flex flex-wrap gap-4">
                                <span className="text-xs font-bold text-slate-500 w-full uppercase">Disponível em:</span>
                                {plans.map(plan => (
                                    <label key={plan.id} className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={plugin.allowed_plans.includes(plan.id)}
                                            onChange={() => handleTogglePlanAccess(plugin.id, plan.id)}
                                            className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                                        />
                                        <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{plan.name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
          )}
          
          <div className="mt-6 text-center">
             <span className="text-xs text-slate-600">Plugins desativados globalmente não aparecem para nenhum plano.</span>
          </div>
        </div>
      </div>
    </div>
  );
};