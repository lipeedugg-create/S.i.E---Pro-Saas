import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plan } from '../types';

interface HomepageProps {
  onSelectPlan: (planId: string) => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onSelectPlan }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
        try {
            const data = await api.getPublicPlans();
            setPlans(data);
        } catch (e) {
            console.error("Erro ao carregar planos", e);
        } finally {
            setLoadingPlans(false);
        }
    };
    fetchPlans();
  }, []);

  return (
    <>
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
           <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
          <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-slate-800/80 border border-slate-700/50 backdrop-blur-md text-blue-400 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up shadow-xl hover:border-blue-500/50 transition-colors cursor-default">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            <span className="relative">IA Generativa v2.0 Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1] text-white drop-shadow-lg">
            Inteligência Estratégica <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Impulsionada por Dados
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Monitoramento em tempo real, análise de sentimento e detecção de crises governamentais utilizando a tecnologia Google Gemini Enterprise.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <button 
              onClick={() => onSelectPlan('starter')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1"
            >
              Criar Conta Grátis
            </button>
            <button 
                onClick={() => document.getElementById('solutions')?.scrollIntoView({behavior:'smooth'})} 
                className="px-8 py-4 bg-slate-900/50 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl font-bold transition-all backdrop-blur-sm"
            >
              Ver Recursos
            </button>
          </div>

          {/* DASHBOARD PREVIEW MOCKUP */}
          <div className="relative max-w-5xl mx-auto group perspective-1000">
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
             <div className="relative bg-[#0F172A] border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden transform group-hover:rotate-x-2 transition-transform duration-700 origin-center">
                {/* Mockup Header */}
                <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="bg-slate-800 rounded-md px-3 py-1 text-[10px] text-slate-500 font-mono flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            app.sie.pro/dashboard
                        </div>
                    </div>
                </div>
                {/* Mockup Body Image */}
                <div className="relative bg-slate-950 p-1">
                    {/* Placeholder Grid Simulation */}
                    <div className="grid grid-cols-12 gap-1 h-[450px] opacity-80">
                        {/* Sidebar */}
                        <div className="col-span-2 hidden md:flex flex-col gap-2 bg-slate-900/50 border-r border-slate-800 p-3">
                            <div className="h-8 w-8 bg-blue-600 rounded-lg mb-4"></div>
                            <div className="h-2 w-full bg-slate-800 rounded"></div>
                            <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                            <div className="h-2 w-5/6 bg-slate-800 rounded"></div>
                        </div>
                        {/* Content */}
                        <div className="col-span-12 md:col-span-10 p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-end">
                                <div className="space-y-2">
                                    <div className="h-4 w-48 bg-slate-800 rounded"></div>
                                    <div className="h-8 w-64 bg-slate-700 rounded"></div>
                                </div>
                                <div className="h-10 w-32 bg-blue-900/20 border border-blue-900/50 rounded"></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 h-32">
                                <div className="bg-slate-900 rounded-lg border border-slate-800 p-4"><div className="h-full w-full bg-gradient-to-br from-slate-800 to-transparent rounded"></div></div>
                                <div className="bg-slate-900 rounded-lg border border-slate-800 p-4"><div className="h-full w-full bg-gradient-to-br from-slate-800 to-transparent rounded"></div></div>
                                <div className="bg-slate-900 rounded-lg border border-slate-800 p-4"><div className="h-full w-full bg-gradient-to-br from-slate-800 to-transparent rounded"></div></div>
                            </div>
                            <div className="flex-1 bg-slate-900/30 rounded-lg border border-slate-800 border-dashed flex items-center justify-center">
                                <span className="text-slate-700 font-mono text-xs">AI ANALYSIS STREAM</span>
                            </div>
                        </div>
                    </div>
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none"></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- SOLUTIONS SECTION (Bento Grid) --- */}
      <section id="solutions" className="py-24 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
                <span className="text-blue-500 font-bold tracking-widest uppercase text-sm">Nossas Soluções</span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mt-2">Tecnologia que antecipa o futuro.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">
                {/* Feature 1 (Large) */}
                <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:border-blue-500/30 transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                        <svg className="w-32 h-32 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-blue-900/50">⚡</div>
                        <h3 className="text-2xl font-bold text-white mb-4">Monitoramento Real-Time</h3>
                        <p className="text-slate-400 leading-relaxed mb-6">
                            Nossa engine de coleta varre milhares de fontes de notícias, blogs e portais governamentais a cada minuto. Não perca nenhuma menção à sua marca ou entidade.
                        </p>
                        <ul className="space-y-2">
                            {['Latência ultra-baixa', 'Cobertura nacional', 'Filtros avançados'].map(item => (
                                <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="text-blue-500">✓</span> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Feature 2 */}
                <div className="md:col-span-1 lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:bg-slate-800 transition-colors group">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-xl mb-4 text-white">🧠</div>
                    <h3 className="text-xl font-bold text-white mb-2">Análise de Sentimento AI</h3>
                    <p className="text-sm text-slate-400">Classificação automática de tom (Positivo, Negativo, Neutro) com 98% de precisão usando LLMs.</p>
                </div>

                {/* Feature 3 */}
                <div className="md:col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:bg-slate-800 transition-colors">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-xl mb-4 text-white">🧩</div>
                    <h3 className="text-xl font-bold text-white mb-2">Plugins</h3>
                    <p className="text-sm text-slate-400">Expanda o sistema com módulos como o "Raio-X Administrativo".</p>
                </div>

                {/* Feature 4 */}
                <div className="md:col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 hover:bg-slate-800 transition-colors">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-xl mb-4 text-white">🚨</div>
                    <h3 className="text-xl font-bold text-white mb-2">Alertas de Crise</h3>
                    <p className="text-sm text-slate-400">Notificações imediatas quando anomalias são detectadas.</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- TECH SECTION (Detailed) --- */}
      <section id="tech" className="py-24 bg-slate-950 border-t border-slate-900">
         <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
                <div className="lg:w-1/2">
                    <span className="text-purple-500 font-bold tracking-widest uppercase text-sm">Engine Proprietária</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-6">Processamento de Linguagem Natural em Escala</h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        Ao contrário de ferramentas tradicionais baseadas apenas em palavras-chave, o S.I.E. PRO entende o contexto. Utilizamos o modelo <strong>Gemini 2.5 Flash</strong> para ler, interpretar e estruturar dados não estruturados da web.
                    </p>
                    
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xl font-bold text-slate-300">1</div>
                            <div>
                                <h4 className="font-bold text-white">Coleta Inteligente</h4>
                                <p className="text-sm text-slate-500">Crawlers distribuídos que simulam navegação humana para evitar bloqueios.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xl font-bold text-slate-300">2</div>
                            <div>
                                <h4 className="font-bold text-white">Estruturação JSON</h4>
                                <p className="text-sm text-slate-500">Transformação de notícias em dados estruturados (Entidades, Valores, Cargos) prontos para SQL.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xl font-bold text-slate-300">3</div>
                            <div>
                                <h4 className="font-bold text-white">Auditoria de Custo</h4>
                                <p className="text-sm text-slate-500">Transparência total. Você sabe exatamente quanto custou cada token processado.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:w-1/2 w-full">
                    <div className="bg-[#0f172a] rounded-xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-sm relative group">
                        <div className="absolute top-0 right-0 p-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                        </div>
                        <div className="p-6 pt-12 space-y-2 text-slate-300">
                            <div className="flex">
                                <span className="text-blue-400 mr-2">➜</span>
                                <span className="text-yellow-300">curl</span>
                                <span className="ml-2">-X POST api.sie.pro/v1/analyze</span>
                            </div>
                            <div className="text-slate-500 animate-pulse">Processing payload...</div>
                            <div className="pt-4 text-emerald-400">
                                {`{`}
                                <div className="pl-4">
                                    <span className="text-purple-400">"status"</span>: <span className="text-orange-300">"success"</span>,<br/>
                                    <span className="text-purple-400">"sentiment"</span>: <span className="text-orange-300">"negative"</span>,<br/>
                                    <span className="text-purple-400">"entities"</span>: [<span className="text-orange-300">"Prefeitura"</span>, <span className="text-orange-300">"Licitação"</span>],<br/>
                                    <span className="text-purple-400">"risk_score"</span>: <span className="text-blue-300">0.89</span>
                                </div>
                                {`}`}
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    </div>
                </div>
            </div>
         </div>
      </section>

      {/* --- PLANS SECTION (Pricing) --- */}
      <section id="plans" className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm">Planos Flexíveis</span>
                <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">Escolha a escala ideal.</h2>
                <p className="text-slate-400">Sem contratos de longo prazo. Cancele quando quiser.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {loadingPlans ? (
                    <div className="col-span-3 text-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-500">Carregando ofertas...</p>
                    </div>
                ) : (
                    plans.map(plan => (
                        <div 
                            key={plan.id} 
                            className={`relative p-8 rounded-2xl border flex flex-col transition-all duration-300 ${
                                plan.id === 'pro' 
                                ? 'bg-slate-900 border-blue-500 shadow-2xl shadow-blue-900/20 scale-105 z-10' 
                                : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                            }`}
                        >
                            {plan.id === 'pro' && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                    Mais Popular
                                </div>
                            )}

                            <h3 className={`text-xl font-bold mb-2 ${plan.id === 'pro' ? 'text-white' : 'text-slate-200'}`}>{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-white">R$ {Number(plan.price).toFixed(0)}</span>
                                <span className="text-slate-500 text-sm">/mês</span>
                            </div>
                            
                            <p className="text-sm text-slate-400 mb-8 min-h-[60px] leading-relaxed">
                                {plan.description}
                            </p>
                            
                            <div className="flex-1 space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs text-blue-400">✓</span>
                                    <span>Até {plan.token_limit?.toLocaleString()} tokens IA</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-300">
                                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs text-blue-400">✓</span>
                                    <span>Suporte via Email</span>
                                </div>
                                {plan.id !== 'starter' && (
                                    <div className="flex items-center gap-3 text-sm text-slate-300">
                                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-xs text-blue-400">✓</span>
                                        <span>Plugins Avançados</span>
                                    </div>
                                )}
                            </div>
                            
                            <button 
                                onClick={() => onSelectPlan(plan.id)}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${
                                    plan.id === 'pro' 
                                    ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30' 
                                    : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                                }`}
                            >
                                {plan.id === 'starter' ? 'Começar Trial' : 'Assinar Agora'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
      </section>
    </>
  );
};