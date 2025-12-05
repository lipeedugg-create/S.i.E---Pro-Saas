import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { MasterItem, User } from '../../types';

interface ClientDashboardProps {
  user: User;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [items, setItems] = useState<MasterItem[]>([]);

  useEffect(() => {
    // Poll for new monitoring items
    const fetchItems = () => setItems(db.getItemsByUserId(user.id));
    fetchItems();
    const interval = setInterval(fetchItems, 3000);
    return () => clearInterval(interval);
  }, [user.id]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard de Monitoramento</h2>
          <p className="text-slate-400">Insights estratégicos e análise de reputação para {user.name}.</p>
        </div>
        <div className="text-right">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                Sistema Operante
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg border border-blue-500/30">
          <h3 className="text-blue-100 text-sm font-medium mb-1 uppercase tracking-wider">Total de Insights</h3>
          <p className="text-4xl font-bold">{items.length}</p>
          <div className="mt-4 text-xs text-blue-200 bg-blue-800/30 inline-block px-2 py-1 rounded">
             +12% vs semana anterior
          </div>
        </div>
         <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Última Análise</h3>
          <p className="text-2xl font-bold text-white">
            {items.length > 0 ? new Date(items[0].created_at).toLocaleTimeString() : '--:--'}
          </p>
          <p className="text-xs text-slate-500 mt-2">Sincronização automática ativa</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">Sentimento Predominante</h3>
          <p className="text-2xl font-bold text-emerald-400">Neutro / Positivo</p>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
             <div className="bg-emerald-500 w-3/4 h-full"></div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-blue-500">📡</span> Feed em Tempo Real
      </h3>
      
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-slate-900/50 rounded-xl p-12 text-center border border-dashed border-slate-700">
            <p className="text-slate-400 text-lg mb-2">Nenhum dado monitorado ainda.</p>
            <p className="text-slate-600 text-sm">Certifique-se de que sua configuração está ativa e aguarde o próximo ciclo.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-700 hover:border-slate-600 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-slate-700 text-slate-300 text-[10px] uppercase font-bold px-2 py-1 rounded border border-slate-600">
                  {item.detected_keywords[0] || 'Geral'}
                </span>
                <span className="text-xs text-slate-500 font-mono">{new Date(item.created_at).toLocaleString()}</span>
              </div>
              
              <h4 className="font-bold text-lg text-white mb-2 group-hover:text-blue-400 transition-colors">
                {item.ai_summary || 'Resumo Indisponível'}
              </h4>
              
              <p className="text-sm text-slate-400 mb-4 leading-relaxed border-l-2 border-slate-600 pl-4 italic">
                "{item.analyzed_content.substring(0, 200)}..."
              </p>
              
              <div className="flex flex-wrap gap-2 items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                <div className="flex gap-2">
                    {item.detected_keywords.map((kw, i) => (
                    <span key={i} className="text-xs bg-slate-900 text-slate-400 px-2 py-1 rounded border border-slate-700">
                        #{kw}
                    </span>
                    ))}
                </div>
                <a href={item.source_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1">
                  Ver Fonte Original <span>↗</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};