import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { MasterItem, User, Subscription, Plan } from '../../types';

interface ClientDashboardProps {
  user: User;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Independent fetches to prevent one failure from blocking the UI
      try {
        const [itemsResult, subResult, plansResult] = await Promise.allSettled([
            api.getItemsByUserId(user.id),
            api.getClientSubscription(),
            api.getPublicPlans()
        ]);

        // 1. Items
        if (itemsResult.status === 'fulfilled') {
            setItems(itemsResult.value);
        } else {
            console.warn("Could not fetch items:", itemsResult.reason);
            setItems([]);
        }

        // 2. Subscription
        if (subResult.status === 'fulfilled') {
            setSubscription(subResult.value);
        } else {
            // Subscription fetch often returns null 200 OK, but if it fails 500, we handle it here
            console.warn("Could not fetch subscription data:", subResult.reason);
            setSubscription(null);
        }

        // 3. Plans
        if (plansResult.status === 'fulfilled') {
            setPlans(plansResult.value);
        } else {
            console.warn("Could not fetch plans:", plansResult.reason);
            setPlans([]);
        }

      } catch (err) {
        console.error("Unexpected dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Polling for new items every 30s
    const interval = setInterval(() => {
        api.getItemsByUserId(user.id)
           .then(setItems)
           .catch(e => console.warn("Polling error:", e));
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user.id]);

  // Derived State
  const myPlan = subscription ? plans.find(p => p.id === subscription.plan_id) : null;
  const isExpired = subscription?.status === 'expired' || (subscription?.end_date ? new Date(subscription.end_date) < new Date() : false);
  const daysRemaining = subscription?.end_date ? Math.ceil((new Date(subscription.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center text-slate-400">
            <div className="flex flex-col items-center gap-4">
                <span className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                <p>Sincronizando feed de inteligência...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard de Monitoramento</h2>
          <p className="text-slate-500">Insights estratégicos e análise de reputação para {user.name}.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                !isExpired && subscription ? 'bg-emerald-900/20 border-emerald-900/50 text-emerald-400' : 'bg-red-900/20 border-red-900/50 text-red-400'
            }`}>
                <span className={`w-2 h-2 rounded-full ${!isExpired && subscription ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-xs font-bold uppercase tracking-wider">
                    {myPlan ? myPlan.name : (subscription ? 'Plano Desconhecido' : 'Sem Plano Ativo')} {subscription && isExpired ? '(Expirado)' : ''}
                </span>
            </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total de Insights</p>
                    <p className="text-3xl font-bold text-white">{items.length}</p>
                </div>
                <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v2H9V5z" />
                    </svg>
                </div>
            </div>
            <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-3/4"></div>
            </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Status da Assinatura</p>
                    <p className="text-3xl font-bold text-white">
                        {subscription ? (daysRemaining > 0 ? `${daysRemaining} dias` : 'Vencido') : 'Inativo'}
                    </p>
                </div>
                <div className="p-2 bg-purple-900/20 rounded-lg text-purple-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            </div>
            <p className="text-xs text-slate-500">Renovação: {subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'N/A'}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Última Análise</p>
                    <p className="text-2xl font-bold text-emerald-400">
                         {items.length > 0 ? new Date(items[0].created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                    </p>
                </div>
                <div className="p-2 bg-emerald-900/20 rounded-lg text-emerald-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
            </div>
            <p className="text-xs text-slate-500">Motor: Gemini 2.5 Flash</p>
        </div>
      </div>

      {/* Feed Section */}
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 px-1">
         <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
         Feed em Tempo Real
      </h3>
      
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-dashed border-slate-700">
            <div className="text-4xl mb-4">📡</div>
            <p className="text-slate-300 text-lg font-bold mb-2">Aguardando dados</p>
            <p className="text-slate-500 text-sm">O sistema de monitoramento ainda não detectou novos itens para seus critérios.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="bg-slate-800 rounded-xl p-6 shadow-md border border-slate-700 hover:border-slate-600 transition-all group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2">
                    {item.detected_keywords?.map((kw, i) => (
                        <span key={i} className="bg-slate-900 text-blue-400 text-[10px] uppercase font-bold px-2 py-1 rounded border border-slate-700">
                        {kw}
                        </span>
                    ))}
                </div>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              
              <h4 className="font-bold text-lg text-white mb-2 group-hover:text-blue-400 transition-colors">
                {item.ai_summary || 'Resumo não disponível'}
              </h4>
              
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <p className="text-sm text-slate-400 leading-relaxed italic">
                    "{item.analyzed_content ? item.analyzed_content.substring(0, 240) : ''}..."
                </p>
              </div>
              
              <div className="flex justify-end mt-4">
                  <a href={item.source_url} target="_blank" rel="noreferrer" className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 transition-colors">
                      VER FONTE ORIGINAL ➜
                  </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};