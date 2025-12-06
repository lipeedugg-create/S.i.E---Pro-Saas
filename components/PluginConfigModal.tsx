import React, { useState } from 'react';
import { Plugin, PluginConfig } from '../types';
import { api } from '../services/api';

interface PluginConfigModalProps {
  plugin: Plugin;
  onClose: () => void;
  onSuccess: () => void;
}

export const PluginConfigModal: React.FC<PluginConfigModalProps> = ({ plugin, onClose, onSuccess }) => {
  const [config, setConfig] = useState<PluginConfig>({
    systemPrompt: plugin.config?.systemPrompt || '',
    negativePrompt: plugin.config?.negativePrompt || ''
  });
  const [loading, setLoading] = useState(false);

  // Defaults para preencher caso esteja vazio (User Friendly)
  const applyDefaults = () => {
    setConfig({
        systemPrompt: `Você é o SISTEMA SIE (Strategic Intelligence Enterprise).\nSua tarefa é gerar um relatório de transparência pública sobre a administração de uma cidade brasileira.`,
        negativePrompt: `- Não use markdown no JSON.\n- Não invente dados (alucinação) se não tiver certeza, use estimativas claras.`
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        await api.updatePluginConfig(plugin.id, config);
        onSuccess();
    } catch (error: any) {
        alert('Erro ao salvar configuração: ' + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-slate-900">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">⚙️</span> Configuração de IA: {plugin.name}
            </h2>
            <p className="text-xs text-slate-400">Personalize o comportamento do agente para este plugin.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 mb-4">
              <div className="flex justify-between items-start">
                <p className="text-xs text-slate-400 mb-2">
                    Estes prompts serão injetados diretamente na chamada para o <strong>Gemini 2.5 Flash</strong>. 
                    Mantenha a estrutura JSON necessária inalterada se possível.
                </p>
                <button type="button" onClick={applyDefaults} className="text-xs text-blue-400 hover:text-white underline">
                    Carregar Padrões
                </button>
              </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                System Prompt (Instrução Principal)
            </label>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-3 focus:border-purple-500 outline-none h-40 font-mono text-sm leading-relaxed"
              placeholder="Defina a persona e o objetivo principal do agente..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-red-400 uppercase mb-2">
                Negative Prompt (Restrições)
            </label>
            <textarea
              value={config.negativePrompt}
              onChange={(e) => setConfig({...config, negativePrompt: e.target.value})}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-3 focus:border-red-500 outline-none h-24 font-mono text-sm leading-relaxed"
              placeholder="O que o agente NÃO deve fazer (ex: não usar markdown, não inventar datas)..."
            />
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-800">
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
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg font-bold shadow-purple-900/20"
            >
              {loading ? 'Salvando...' : 'Salvar Configuração'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};