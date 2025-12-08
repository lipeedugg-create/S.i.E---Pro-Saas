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
  
  // Estados para verificação de URL
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [urlStatus, setUrlStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  
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

  const handleSave = async (e?: React.FormEvent, forceRun: boolean = false) => {
    if(e) e.preventDefault();
    try {
        await api.upsertConfig(config);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        // Se o usuário pediu ou se acabamos de ativar e nunca rodou, rodamos
        if (forceRun || (config.is_active && !config.last_run_at)) {
            handleRunNow();
        }
    } catch (e) {
        alert('Erro ao salvar configuração.');
    }
  };

  const handleRunNow = async () => {
      setIsRunning(true);
      setRunMessage('Iniciando varredura...');
      try {
          const res = await api.runMonitoringNow();
          setRunMessage(`Varredura concluída! ${res.count} novos itens detectados.`);
          // Recarrega config para atualizar 'last_run_at'
          await loadConfig();
          setTimeout(() => setRunMessage(''), 5000);
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

  const checkAndAddUrl = async () => {
      const url = urlInput.trim();
      if (!url) return;
      
      setIsCheckingUrl(true);
      setUrlStatus('idle');

      try {
          // Verifica saúde da URL
          const res = await api.checkUrl(url);
          if (res.status === 'ok') {
               setConfig(prev => ({ ...prev, urls_to_track: [...prev.urls_to_track, url] }));
               setUrlInput('');
               setUrlStatus('valid');
               setTimeout(() => setUrlStatus('idle'), 2000);
          } else {
               setUrlStatus('invalid');
               alert("URL inválida ou inacessível. O robô não conseguiu conectar.");
          }
      } catch (e) {
          setUrlStatus('invalid');
      } finally {
          setIsCheckingUrl(false);
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
      // Daily = +24h, Hourly = +1h
      if (config.frequency === 'daily') next.setHours(next.getHours() + 24);
      else next.setHours(next.getHours() + 1);
      return next;
  };

  const lastRun = getLastRunDate();
  const nextRun = getNextRunDate();
  const isPending = nextRun && nextRun < new Date();

  if (loading) return <div className="p-8 text-center text-slate-400">Carregando configurações...</div>;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto min-h-full text-slate-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Configuração do Agente</h2>
        <p className="text-slate-400">Defina os parâmetros de busca e análise da Inteligência Artificial.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUNA ESQUERDA: Painel de Controle */}
          <div className="space-y-6">
              
              {/* Card Status & Cronograma */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Status do Monitoramento</h3>
                  
                  <div className="flex items-center justify-between mb-6 p-3 bg-slate-900 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-3">
                          <span className={`relative flex h-3 w-3`}>
                            {config.is_active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${config.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          </span>
                          <span className={`font-bold text-sm ${config.is_active ? 'text-emerald-400' : 'text-slate-500'}`}>
                              {config.is_active ? 'ATIVO' : 'PAUSADO'}
                          </span>
                      </div>
                      <div 
                         onClick={() => setConfig(c => ({ ...c, is_active: !c.is_active }))}
                         className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                             config.is_active ? 'bg-emerald-600' : 'bg-slate-700'
                         }`}
                      >
                         <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                             config.is_active ? 'translate-x-5' : 'translate-x-0'
                         }`} />
                      </div>
                  </div>

                  <div className="space-y-4 border-t border-slate-700 pt-4">
                      <div>
                          <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Última Varredura</p>
                          <p className="text-white font-mono text-sm">
                              {lastRun ? lastRun.toLocaleString() : 'Nunca executado'}
                          </p>
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold">Próxima Execução (Estimada)</p>
                          <div className="flex items-center gap-2">
                              <p className={`font-mono text-sm ${isPending ? 'text-yellow-400 animate-pulse' : 'text-blue-400'}`}>
                                  {nextRun ? nextRun.toLocaleString() : (config.is_active ? 'Aguardando agendamento...' : '---')}
                              </p>
                              {isPending && config.is_active && (
                                  <span className="text-[10px] bg-yellow-900/30 text-yellow-500 px-1 rounded border border-yellow-800">PENDENTE</span>
                              )}
                          </div>
                      </div>
                  </div>

                  <button 
                    onClick={handleRunNow}
                    disabled={isRunning || !config.is_active}
                    className="w-full mt-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold py-3 rounded-lg border border-slate-600 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wide"
                  >
                    {isRunning ? (
                        <>
                           <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                           Processando Agora...
                        </>
                    ) : (
                        <>⚡ Forçar Varredura Manual</>
                    )}
                  </button>
                  {runMessage && <div className="mt-3 p-2 bg-emerald-900/20 text-emerald-400 text-xs text-center rounded border border-emerald-900/30">{runMessage}</div>}
              </div>

              {/* Frequência */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Frequência de Busca</h3>
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

          {/* COLUNA DIREITA: Inputs */}
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
                        <div className="flex-1 relative">
                            <input
                                type="url"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), checkAndAddUrl())}
                                className={`w-full bg-slate-950 border rounded-lg px-4 py-3 text-white focus:ring-1 outline-none transition-colors ${
                                    urlStatus === 'invalid' ? 'border-red-500 focus:border-red-500' : 
                                    urlStatus === 'valid' ? 'border-emerald-500 focus:border-emerald-500' : 'border-slate-700 focus:border-blue-500'
                                }`}
                                placeholder="https://g1.globo.com/politica"
                            />
                            {urlStatus === 'valid' && <span className="absolute right-3 top-3.5 text-emerald-500 text-xs font-bold">✓ VÁLIDO</span>}
                        </div>
                        <button 
                            type="button" 
                            onClick={checkAndAddUrl} 
                            disabled={isCheckingUrl}
                            className="bg-slate-700 text-white px-6 py-2 rounded-lg hover:bg-slate-600 font-medium transition-colors border border-slate-600 min-w-[100px]"
                        >
                            {isCheckingUrl ? <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span> : 'Verificar e Add'}
                        </button>
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

                <div className="pt-6 border-t border-slate-700 flex flex-col md:flex-row items-center justify-end gap-4">
                    {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-2 animate-fade-in"><span className="w-2 h-2 rounded-full bg-green-500"></span> Configuração Salva!</span>}
                    
                    <button
                        type="button"
                         onClick={() => handleSave(undefined, true)}
                        className="w-full md:w-auto px-6 py-3 border border-emerald-600/50 text-emerald-400 hover:bg-emerald-900/20 rounded-lg font-bold transition-all text-sm"
                    >
                        Salvar e Executar Agora ⚡
                    </button>
                    
                    <button
                        type="submit"
                        className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 font-bold flex items-center justify-center gap-2"
                    >
                        <span>💾</span> Salvar Configuração
                    </button>
                </div>
            </form>
          </div>
      </div>
    </div>
  );
};