import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, MonitoringConfig } from '../../types';

interface ClientConfigProps {
  user: User;
}

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

  useEffect(() => {
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
    loadConfig();
  }, [user.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await api.upsertConfig(config);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    } catch (e) {
        alert('Erro ao salvar configuração.');
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      setConfig(prev => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
      setKeywordInput('');
    }
  };

  const addUrl = () => {
    if (urlInput.trim()) {
      setConfig(prev => ({ ...prev, urls_to_track: [...prev.urls_to_track, urlInput.trim()] }));
      setUrlInput('');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Carregando configurações...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Configuração do Agente</h2>
      <p className="text-slate-400 mb-8">Defina os parâmetros de busca e análise da Inteligência Artificial.</p>

      <form onSubmit={handleSave} className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 p-8 space-y-8">
        
        {/* Status Toggle */}
        <div className="flex items-center justify-between p-6 bg-slate-900/50 rounded-xl border border-slate-700">
          <div>
            <span className="block font-bold text-white text-lg">Status do Monitoramento</span>
            <span className="text-sm text-slate-400">Pausar ou retomar a coleta de dados automática.</span>
          </div>
          <button
            type="button"
            onClick={() => setConfig(c => ({ ...c, is_active: !c.is_active }))}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              config.is_active ? 'bg-green-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                config.is_active ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-bold text-slate-300 uppercase mb-3">Palavras-Chave & Tópicos</label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Ex: Inteligência Artificial, Nome da Empresa..."
            />
            <button type="button" onClick={addKeyword} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">Adicionar</button>
          </div>
          <div className="flex flex-wrap gap-2 p-4 bg-slate-900 rounded-xl min-h-[60px] border border-slate-700">
            {config.keywords.length === 0 && <span className="text-slate-600 text-sm italic">Nenhuma palavra-chave definida.</span>}
            {config.keywords.map((kw, i) => (
              <span key={i} className="bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 border border-slate-600">
                {kw}
                <button type="button" onClick={() => setConfig(c => ({...c, keywords: c.keywords.filter((_, idx) => idx !== i)}))} className="text-slate-500 hover:text-red-400 font-bold px-1">×</button>
              </span>
            ))}
          </div>
        </div>

        {/* URLs */}
        <div>
          <label className="block text-sm font-bold text-slate-300 uppercase mb-3">URLs Alvo</label>
          <div className="flex gap-2 mb-4">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="https://exemplo.com/feed"
            />
            <button type="button" onClick={addUrl} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">Adicionar</button>
          </div>
          <ul className="space-y-2 bg-slate-900 p-4 rounded-xl border border-slate-700 min-h-[60px]">
             {config.urls_to_track.length === 0 && <span className="text-slate-600 text-sm italic">Nenhuma URL configurada.</span>}
             {config.urls_to_track.map((url, i) => (
              <li key={i} className="flex justify-between items-center bg-slate-800 px-4 py-3 rounded-lg text-sm text-slate-300 border border-slate-700">
                <span className="truncate flex-1 font-mono text-xs text-blue-400">{url}</span>
                <button type="button" onClick={() => setConfig(c => ({...c, urls_to_track: c.urls_to_track.filter((_, idx) => idx !== i)}))} className="text-red-500 hover:text-red-400 ml-4 font-medium text-xs">REMOVER</button>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-6 border-t border-slate-700 flex items-center gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 font-bold"
          >
            Salvar Configurações
          </button>
          {saved && <span className="text-green-400 text-sm font-medium flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Alterações Salvas!</span>}
        </div>
      </form>
    </div>
  );
};