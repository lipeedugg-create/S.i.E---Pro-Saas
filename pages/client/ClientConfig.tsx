import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, MonitoringConfig } from '../../types';

interface ClientConfigProps {
  user: User;
}

const SMART_KEYWORDS = [
  "Corrupção", "Fraude", "Denúncia", "Processo Judicial", 
  "Reclamação", "Crise", "Greve", "Vazamento de Dados", 
  "Concorrência", "Multa", "Acidente", "Recall"
];

export const ClientConfig: React.FC<ClientConfigProps> = ({ user }) => {
  const [config, setConfig] = useState<MonitoringConfig>({
    user_id: user.id,
    keywords: [],
    urls_to_track: [],
    frequency: 'daily',
    is_active: true
  });
  
  const [keywordInput, setKeywordInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estados de Execução Manual
  const [isRunning, setIsRunning] = useState(false);
  const [runMessage, setRunMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, [user.id]);

  const loadConfig = async () => {
    try {
        const existing = await api.getConfig(user.id);
        if (existing) setConfig(existing);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent, shouldRun: boolean = false) => {
    if(e) e.preventDefault();
    try {
        await api.upsertConfig(config);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        if (shouldRun) {
            handleRunNow();
        }
    } catch (e) {
        alert('Erro ao salvar configuração.');
    }
  };

  const handleRunNow = async () => {
      setIsRunning(true);
      setRunMessage('');
      try {
          const res = await api.runMonitoringNow();
          setRunMessage(`Varredura concluída! ${res.count} itens analisados.`);
          // Recarrega config para atualizar 'last_run_at'
          await loadConfig();
      } catch (e: any) {
          setRunMessage(`Erro na execução: ${e.message}`);
      } finally {
          setIsRunning(false);
      }
  };

  const addKeyword = (word: string) => {
    if (word.trim() && !config.keywords.includes(word.trim())) {
      setConfig(prev => ({ ...prev, keywords: [...prev.keywords, word.trim()] }));
    }
    setKeywordInput('');
  };

  const addUrl = () => {
    if (urlInput.trim()) {
      setConfig(prev => ({ ...prev, urls_to_track: [...prev.urls_to_track, urlInput.trim()] }));
      setUrlInput('');
    }
  };

  // Cálculo de Próxima Execução
  const getLastRunDate = () => {
      if (!config.last_run_at) return null;
      return new Date(config.last_run_at);
  };

  const getNextRunDate = () => {
      const last = getLastRunDate();
      if (!last) return null;
      const next = new Date(last);
      // Simples lógica: Daily = +24h, Hourly = +1h
      if (config.frequency === 'daily') next.setHours(next.getHours() + 24);
      else next.setHours(next.getHours() + 1);
      return next;
  };

  const lastRun = getLastRunDate();
  const nextRun = getNextRunDate();

  if (loading) return <div className="p-8 text-center text-slate-400">Carregando configurações...</div>;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Configuração do Agente</h2>
        <p className="text-slate-400">Defina os parâmetros de busca e análise da Inteligência Artificial.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUNA ESQUERDA: Status & Controle */}
          <div className="space-y-6">
              {/* Card Status */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Estado do Agente</h3>
                  
                  <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                          <span className={`relative flex h-3 w-3`}>
                            {config.is_active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${config.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          </span>
                          <span className={`font-bold ${config.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {config.is_active ? 'MONITORAMENTO ATIVO' : 'PAUSADO'}
                          </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConfig(c => ({ ...c, is_active: !c.is_active }))}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        config.is_active ? 'bg-emerald-600' : 'bg-slate-700'
                        }`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        config.is_active ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                    </button>
                  </div>

                  <div className="space-y-4 border-t border-slate-700 pt-4">
                      <div>
                          <p className="text-xs text-slate-500 mb-1 uppercase font-bold">Última Varredura</p>
                          <p className="text-white font-mono text-sm">
                              {lastRun ? lastRun.toLocaleString() : 'Nunca executado'}
                          </p>
                      </div>
                      <div>
                          <p className="text-xs text-slate-500 mb-1 uppercase font-bold">Próxima Execução (Est.)</p>
                          <p className="text-blue-400 font-mono text-sm">
                              {nextRun ? nextRun.toLocaleString() : (config.is_active ? 'Aguardando agendamento...' : 'Monitoramento Pausado')}
                          </p>
                      </div>
                  </div>

                  <button 
                    onClick={handleRunNow}
                    disabled={isRunning || !config.is_active}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isRunning ? (
                        <>
                           <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                           Processando...
                        </>
                    ) : (
                        <>⚡ Executar Agora</>
                    )}
                  </button>
                  {runMessage && <p className="text-xs text-center mt-2 text-emerald-400 animate-pulse">{runMessage}</p>}
              </div>

              {/* Frequência */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Frequência</h3>
                  <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setConfig({...config, frequency: 'hourly'})}
                        className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                            config.frequency === 'hourly' 
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                            : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                      >
                          Hora em Hora
                      </button>
                      <button 
                         onClick={() => setConfig({...config, frequency: 'daily'})}
                         className={`p-3 rounded-lg border text-sm font-bold transition-all ${
                            config.frequency === 'daily' 
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400' 
                            : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                        }`}
                      >
                          Diariamente
                      </button>
                  </div>
              </div>
          </div>

          {/* COLUNA DIREITA: Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={(e) => handleSave(e, false)} className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-6 md:p-8 space-y-8">
                
                {/* Keywords */}
                <div>
                    <label className="block text-sm font-bold text-slate-300 uppercase mb-3 flex justify-between">
                        <span>Palavras-Chave de Risco</span>
                        <span className="text-slate-500 text-xs normal-case">{config.keywords.length} definidas</span>
                    </label>
                    <div className="flex gap-2 mb-4">
                        <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword(keywordInput))}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="Ex: Nome da Empresa, Produto X..."
                        />
                        <button type="button" onClick={() => addKeyword(keywordInput)} className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600 font-medium transition-colors border border-slate-600">Add</button>
                    </div>

                    {/* Smart Chips */}
                    <div className="mb-4">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Sugestões Rápidas:</p>
                        <div className="flex flex-wrap gap-2">
                            {SMART_KEYWORDS.map(kw => (
                                <button
                                    key={kw}
                                    type="button"
                                    onClick={() => addKeyword(kw)}
                                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                                        config.keywords.includes(kw)
                                        ? 'bg-blue-900/30 border-blue-800 text-blue-400 cursor-default opacity-50'
                                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                                    }`}
                                >
                                    + {kw}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 p-4 bg-slate-900 rounded-xl min-h-[80px] border border-slate-700 content-start">
                        {config.keywords.length === 0 && <span className="text-slate-600 text-sm italic w-full text-center py-4">Nenhuma palavra-chave definida. O monitoramento não funcionará.</span>}
                        {config.keywords.map((kw, i) => (
                        <span key={i} className="bg-blue-900/20 text-blue-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-blue-900/50 animate-fade-in">
                            {kw}
                            <button type="button" onClick={() => setConfig(c => ({...c, keywords: c.keywords.filter((_, idx) => idx !== i)}))} className="text-blue-400 hover:text-red-400 font-bold px-1 ml-1 transition-colors">×</button>
                        </span>
                        ))}
                    </div>
                </div>

                {/* URLs */}
                <div>
                    <label className="block text-sm font-bold text-slate-300 uppercase mb-3 flex justify-between">
                        <span>URLs Alvo (Fontes)</span>
                        <span className="text-slate-500 text-xs normal-case">{config.urls_to_track.length} fontes</span>
                    </label>
                    <div className="flex gap-2 mb-4">
                        <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="https://g1.globo.com/politica"
                        />
                        <button type="button" onClick={addUrl} className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600 font-medium transition-colors border border-slate-600">Add</button>
                    </div>
                    <ul className="space-y-2 bg-slate-900 p-4 rounded-xl border border-slate-700 min-h-[80px]">
                        {config.urls_to_track.length === 0 && <span className="text-slate-600 text-sm italic w-full text-center block py-4">Nenhuma URL configurada. Adicione portais de notícias, blogs ou feeds RSS.</span>}
                        {config.urls_to_track.map((url, i) => (
                        <li key={i} className="flex justify-between items-center bg-slate-800 px-4 py-3 rounded-lg text-sm text-slate-300 border border-slate-700 group hover:border-slate-600 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span className="truncate font-mono text-xs text-blue-400">{url}</span>
                            </div>
                            <div className="flex items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                                <a href={url} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-white" title="Testar Link">↗</a>
                                <button type="button" onClick={() => setConfig(c => ({...c, urls_to_track: c.urls_to_track.filter((_, idx) => idx !== i)}))} className="text-red-500 hover:text-red-400 font-medium text-xs uppercase tracking-wider">Remover</button>
                            </div>
                        </li>
                        ))}
                    </ul>
                </div>

                <div className="pt-6 border-t border-slate-700 flex items-center justify-end gap-4">
                    {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-2 animate-fade-in"><span className="w-2 h-2 rounded-full bg-green-500"></span> Configuração Salva!</span>}
                    <button
                        type="submit"
                        className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 font-bold flex items-center gap-2"
                    >
                        <span>💾</span> Salvar Alterações
                    </button>
                </div>
            </form>
          </div>
      </div>
    </div>
  );
};