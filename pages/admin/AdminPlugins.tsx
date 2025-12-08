import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Plugin } from '../../types';
import { PluginConfigModal } from '../../components/PluginConfigModal';
import { Documentation } from '../Documentation';

export const AdminPlugins: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDocs, setShowDocs] = useState(false);
  
  // State para modal de configuração
  const [configPlugin, setConfigPlugin] = useState<Plugin | null>(null);

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

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
    if (confirm('Tem certeza? Isso excluirá permanentemente o plugin do sistema e seus arquivos.')) {
        try {
            await api.deletePlugin(id);
            loadPlugins();
        } catch (err: any) {
            alert('Erro ao remover plugin: ' + err.message);
        }
    }
  };

  const handleToggleActive = async (id: string, currentStatus: string) => {
      // Se estava ativo, volta para instalado. Se estava instalado, vira ativo.
      const newStatus = currentStatus === 'active' ? 'installed' : 'active';
      await api.updatePluginStatus(id, newStatus);
      loadPlugins();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith('.zip')) {
          alert('Por favor envie apenas arquivos .zip');
          return;
      }

      setUploading(true);
      setUploadMsg('');
      
      try {
          const res = await api.uploadPlugin(file);
          setUploadMsg(res.message);
          setTimeout(() => setUploadMsg(''), 5000);
          loadPlugins(); // Recarrega a lista
      } catch (err: any) {
          alert("Erro no upload: " + err.message);
      } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = ''; // Limpa input
      }
  };

  const handleDownloadTemplate = async () => {
      try {
          await api.downloadPluginTemplate();
      } catch (err: any) {
          alert('Erro ao baixar template: ' + err.message);
      }
  };

  const filteredPlugins = plugins.filter(p => filter === 'all' || p.category === filter);

  return (
    <div className="p-6 lg:p-8 text-slate-200">
      {/* Banner de Ajuda */}
      <div className="bg-blue-900/20 border border-blue-900/50 p-4 rounded-xl mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                  <h3 className="text-sm font-bold text-blue-300">Desenvolvedor AI Studio</h3>
                  <p className="text-xs text-blue-200/70">Use nossa IA para gerar o código dos plugins automaticamente.</p>
              </div>
          </div>
          <button 
            onClick={() => setShowDocs(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors"
          >
              Abrir Prompt Generator
          </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Loja de Plugins & Módulos</h2>
          <p className="text-slate-400">Gerencie, instale e faça upload de novas funcionalidades para o ecossistema S.I.E. PRO.</p>
        </div>
        
        <div className="flex gap-4 items-center">
            <button 
                onClick={handleDownloadTemplate}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-bold border border-slate-600 transition-all flex items-center gap-2 hover:scale-105 active:scale-95 text-sm"
            >
                <span>📥</span> Baixar Template
            </button>

            {/* Upload Button */}
            <div className="relative">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".zip"
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95 text-sm"
                >
                    {uploading ? (
                         <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>
                            <span className="text-xl">☁️</span> 
                            <span>Upload Plugin (.ZIP)</span>
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
            <span className="text-sm font-bold text-slate-500 uppercase mr-2 shrink-0">Filtrar por:</span>
            {['all', 'analytics', 'security', 'integration', 'utility'].map(cat => (
                <button 
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all capitalize border shrink-0 ${
                        filter === cat 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg' 
                        : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    {cat}
                </button>
            ))}
      </div>

      {uploadMsg && (
          <div className="mb-6 p-4 bg-emerald-900/20 border border-emerald-900/50 rounded-lg text-emerald-400 text-center animate-fade-in font-bold">
              ✅ {uploadMsg}
          </div>
      )}

      {loading ? (
        <div className="text-center py-20 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 animate-pulse">Carregando catálogo de extensões...</p>
        </div>
      ) : filteredPlugins.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-16 text-center border-dashed flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-6xl mb-6 opacity-50">📦</div>
            <h3 className="text-2xl font-bold text-white mb-2">Nenhum plugin encontrado</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                Sua biblioteca está vazia. Faça o upload de um arquivo .ZIP contendo o manifesto, SQL e arquivos do plugin para instalar.
            </p>
            <div className="flex gap-4">
                <button 
                    onClick={() => setShowDocs(true)}
                    className="text-slate-300 hover:text-white font-bold underline"
                >
                    Criar com IA
                </button>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-400 hover:text-white font-bold underline"
                >
                    Fazer Upload Agora
                </button>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlugins.map(plugin => {
              const isInstalled = plugin.status === 'installed' || plugin.status === 'active';
              
              return (
              <div key={plugin.id} className={`rounded-xl border flex flex-col transition-all shadow-lg group relative overflow-hidden ${isInstalled ? 'bg-slate-800 border-slate-700' : 'bg-slate-900/50 border-slate-800 opacity-80 hover:opacity-100'}`}>
                  {/* Status Banner */}
                  {plugin.status === 'active' && <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">ATIVO</div>}
                  {plugin.status === 'installed' && <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">INSTALADO</div>}

                  <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                          <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center text-3xl border border-slate-700 shadow-inner group-hover:scale-110 transition-transform duration-300 select-none">
                              {plugin.icon || '🧩'}
                          </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1 truncate" title={plugin.name}>{plugin.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 rounded border border-slate-800">v{plugin.version}</span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">{plugin.category}</span>
                      </div>
                      
                      <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed flex-1" title={plugin.description}>{plugin.description}</p>
                      
                      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                          <span className="font-mono font-bold text-white text-sm">{plugin.price === 0 ? 'GRÁTIS' : `R$ ${Number(plugin.price).toFixed(2)}`}</span>
                      </div>
                  </div>

                  {/* Actions Area */}
                  <div className="bg-slate-950/50 p-4 border-t border-slate-800 grid grid-cols-2 gap-2">
                      {plugin.status === 'available' ? (
                           <button 
                              onClick={() => handleInstall(plugin.id)}
                              className="col-span-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors uppercase tracking-wide flex justify-center items-center gap-2"
                           >
                              <span>⬇</span> Instalar no Sistema
                           </button>
                      ) : (
                          <>
                              <button
                                  onClick={() => setConfigPlugin(plugin)}
                                  className="col-span-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-2"
                                  title="Configurar IA"
                              >
                                  <span>⚙️</span> Config
                              </button>

                              <button 
                                  onClick={() => handleToggleActive(plugin.id, plugin.status)}
                                  className={`col-span-1 py-2 rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-2 border ${
                                      plugin.status === 'active' 
                                      ? 'bg-emerald-900/20 text-emerald-400 border-emerald-900/50 hover:bg-amber-900/20 hover:text-amber-400 hover:border-amber-900' 
                                      : 'bg-slate-700 text-white hover:bg-emerald-600 border-transparent'
                                  }`}
                              >
                                  {plugin.status === 'active' ? 'Desativar' : 'Ativar'}
                              </button>

                              <button 
                                  onClick={() => handleUninstall(plugin.id)}
                                  className="col-span-2 py-2 text-red-500 hover:text-white hover:bg-red-600/80 rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-1 opacity-60 hover:opacity-100"
                              >
                                  <span>🗑️</span> Remover do Sistema
                              </button>
                          </>
                      )}
                  </div>
              </div>
          )})}
        </div>
      )}

      {configPlugin && (
          <PluginConfigModal 
             plugin={configPlugin} 
             onClose={() => setConfigPlugin(null)} 
             onSuccess={() => { setConfigPlugin(null); loadPlugins(); }} 
          />
      )}

      {showDocs && <Documentation onClose={() => setShowDocs(false)} />}
    </div>
  );
};