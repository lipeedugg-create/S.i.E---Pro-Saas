import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plugin } from '../../types';

export const AdminPlugins: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadPlugins = async () => {
    try {
      const data = await api.getPlugins();
      setPlugins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  const handleInstall = async (id: string) => {
    await api.updatePluginStatus(id, 'installed');
    loadPlugins();
  };

  const handleUninstall = async (id: string) => {
    if (confirm('Tem certeza? Isso removerá o plugin do sistema.')) {
        await api.updatePluginStatus(id, 'available');
        loadPlugins();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: string) => {
      const newStatus = currentStatus === 'active' ? 'installed' : 'active';
      await api.updatePluginStatus(id, newStatus);
      loadPlugins();
  };

  const filteredPlugins = plugins.filter(p => filter === 'all' || p.category === filter);

  return (
    <div className="p-8 bg-slate-900 min-h-full text-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Loja de Plugins & Módulos</h2>
          <p className="text-slate-500">Expanda as capacidades do S.I.E. PRO.</p>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            {['all', 'analytics', 'security', 'integration', 'utility'].map(cat => (
                <button 
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                        filter === cat 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Carregando catálogo...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlugins.map(plugin => (
              <div key={plugin.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col hover:border-slate-600 transition-all shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-3xl border border-slate-700">
                          {plugin.icon}
                      </div>
                      <div className="flex flex-col items-end">
                          {plugin.status === 'available' && <span className="px-2 py-1 bg-slate-700 text-slate-300 text-[10px] font-bold uppercase rounded">Disponível</span>}
                          {plugin.status === 'installed' && <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-[10px] font-bold uppercase rounded border border-blue-900/50">Instalado</span>}
                          {plugin.status === 'active' && <span className="px-2 py-1 bg-green-900/30 text-green-400 text-[10px] font-bold uppercase rounded border border-green-900/50">Ativo</span>}
                      </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-1">{plugin.name}</h3>
                  <p className="text-slate-400 text-sm mb-4 min-h-[40px]">{plugin.description}</p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-700/50 flex items-center justify-between">
                      <div>
                          <span className="block text-xs text-slate-500">Custo Sugerido</span>
                          <span className="font-mono font-bold text-white">{plugin.price === 0 ? 'Grátis' : `R$ ${Number(plugin.price).toFixed(2)}`}</span>
                      </div>

                      <div className="flex gap-2">
                          {plugin.status === 'available' ? (
                               <button 
                                  onClick={() => handleInstall(plugin.id)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                               >
                                  Instalar
                               </button>
                          ) : (
                              <>
                                  <button 
                                      onClick={() => handleToggleActive(plugin.id, plugin.status)}
                                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                          plugin.status === 'active' 
                                          ? 'bg-green-600/10 text-green-500 border border-green-600/30' 
                                          : 'bg-slate-700 text-slate-400'
                                      }`}
                                  >
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                  </button>
                                  <button 
                                      onClick={() => handleUninstall(plugin.id)}
                                      className="w-10 h-10 bg-red-900/10 text-red-500 border border-red-900/30 rounded-lg flex items-center justify-center transition-colors"
                                  >
                                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" />
                                      </svg>
                                  </button>
                              </>
                          )}
                      </div>
                  </div>
              </div>
          ))}
        </div>
      )}
    </div>
  );
};