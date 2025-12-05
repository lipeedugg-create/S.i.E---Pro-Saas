import React, { useState } from 'react';

interface HomepageProps {
  onLogin: () => void;
  onOpenDocs: () => void;
  onPrivacy: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({ onLogin, onOpenDocs, onPrivacy }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-500/20">S</div>
             <span className="font-bold text-xl tracking-tight">S.I.E. PRO</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
            <button onClick={() => scrollToSection('solutions')} className="hover:text-white transition-colors">Soluções</button>
            <button onClick={() => scrollToSection('plans')} className="hover:text-white transition-colors">Planos</button>
            <button onClick={() => scrollToSection('tech')} className="hover:text-white transition-colors">Tecnologia</button>
          </div>

          <div className="hidden md:flex gap-4">
            <button 
                onClick={onLogin}
                className="text-white font-medium hover:text-blue-400 transition-colors px-4 py-2"
            >
                Login
            </button>
            <button 
                onClick={onLogin}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg font-medium border border-slate-700 transition-all shadow-lg hover:shadow-slate-700/50"
            >
                Começar Agora
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
             </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
            <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-4 text-center">
                <button onClick={() => scrollToSection('solutions')} className="block w-full text-slate-300 hover:text-white">Soluções</button>
                <button onClick={() => scrollToSection('plans')} className="block w-full text-slate-300 hover:text-white">Planos</button>
                <button onClick={() => scrollToSection('tech')} className="block w-full text-slate-300 hover:text-white">Tecnologia</button>
                <button onClick={onLogin} className="block w-full bg-blue-600 text-white py-2 rounded-lg">Acessar Sistema</button>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative pt-20 pb-32 overflow-hidden">
        {/* Effects */}
        <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
           <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
           <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center">
          <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-emerald-900/30 border border-emerald-800 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up shadow-lg shadow-emerald-900/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Production Ready v3.0
          </span>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">Monitoramento Estratégico</span>
            <br />
            <span className="text-4xl md:text-6xl text-slate-600">Impulsionado por Gemini AI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Detecte crises antes que elas aconteçam. Nossa plataforma processa milhares de fontes de dados em tempo real para proteger sua reputação corporativa.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onLogin}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/25 transition-all hover:scale-105"
            >
              Acessar Painel
            </button>
            <button onClick={() => scrollToSection('solutions')} className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 rounded-xl font-medium transition-all hover:border-slate-600">
              Conhecer Recursos
            </button>
          </div>

          {/* CSS Mockup of Dashboard instead of Image */}
          <div className="mt-20 relative max-w-5xl mx-auto">
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
             <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
                {/* Mockup Header */}
                <div className="h-10 bg-slate-950 border-b border-slate-800 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div className="flex-1 text-center text-xs text-slate-600 font-mono">dashboard.sie.pro</div>
                </div>
                {/* Mockup Body */}
                <div className="p-6 grid grid-cols-12 gap-6 h-[400px] overflow-hidden">
                    {/* Sidebar Mock */}
                    <div className="col-span-2 hidden md:flex flex-col gap-3 border-r border-slate-800 pr-4">
                        <div className="h-8 bg-slate-800 rounded w-full animate-pulse"></div>
                        <div className="h-8 bg-slate-800/50 rounded w-3/4"></div>
                        <div className="h-8 bg-slate-800/50 rounded w-5/6"></div>
                        <div className="h-8 bg-slate-800/50 rounded w-4/5"></div>
                    </div>
                    {/* Main Content Mock */}
                    <div className="col-span-12 md:col-span-10 flex flex-col gap-6">
                        <div className="flex justify-between">
                             <div className="h-8 w-48 bg-slate-800 rounded"></div>
                             <div className="h-8 w-24 bg-blue-900/20 rounded border border-blue-900/50"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-24 bg-slate-800 rounded-lg border border-slate-700"></div>
                            <div className="h-24 bg-slate-800 rounded-lg border border-slate-700"></div>
                            <div className="h-24 bg-slate-800 rounded-lg border border-slate-700"></div>
                        </div>
                        <div className="flex-1 bg-slate-950/50 rounded-lg border border-slate-800 p-4 space-y-3">
                            <div className="h-12 bg-slate-800/50 rounded w-full"></div>
                            <div className="h-12 bg-slate-800/50 rounded w-full"></div>
                            <div className="h-12 bg-slate-800/50 rounded w-full"></div>
                        </div>
                    </div>
                </div>
                {/* Gradient Overlay for Fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none"></div>
             </div>
          </div>
        </div>
      </main>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Soluções Enterprise</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">Ferramentas desenhadas para departamentos de Relações Públicas, Compliance e Gestão de Crise.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Monitoramento Real-Time", icon: "⚡", desc: "Varredura contínua de portais de notícias, blogs e redes sociais com latência mínima." },
                    { title: "Análise de Sentimento", icon: "🧠", desc: "O motor Google Gemini 2.5 classifica o tom e impacto de cada menção." },
                    { title: "Auditoria de Custos", icon: "📊", desc: "Transparência total. Rastreie cada token consumido pela IA e gerencie seu orçamento." },
                    { title: "Alertas Preditivos", icon: "🚨", desc: "Receba notificações antes que uma tendência negativa viralize." },
                    { title: "Marketplace de Plugins", icon: "🧩", desc: "Ative módulos extras como Dark Web Monitoring e Exportação PDF." },
                    { title: "API de Integração", icon: "🔌", desc: "Conecte os dados do S.I.E. PRO diretamente ao seu BI ou CRM interno." }
                ].map((item, i) => (
                    <div key={i} className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-900/50 hover:bg-slate-800/50 transition-all group">
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                        <h3 className="font-bold text-xl mb-3 text-slate-200">{item.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="py-24 bg-slate-950 border-t border-slate-900">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Stack Tecnológico</h2>
            <div className="flex flex-wrap justify-center gap-12 items-center opacity-70">
                <div className="text-slate-400 font-bold text-xl flex items-center gap-2"><span className="text-blue-500">◆</span> PostgreSQL</div>
                <div className="text-slate-400 font-bold text-xl flex items-center gap-2"><span className="text-green-500">◆</span> Node.js</div>
                <div className="text-slate-400 font-bold text-xl flex items-center gap-2"><span className="text-cyan-500">◆</span> React 19</div>
                <div className="text-slate-400 font-bold text-xl flex items-center gap-2"><span className="text-purple-500">◆</span> Gemini API</div>
                <div className="text-slate-400 font-bold text-xl flex items-center gap-2"><span className="text-white">◆</span> Docker</div>
            </div>
         </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planos Flexíveis</h2>
                <p className="text-slate-400">Escalabilidade garantida para empresas de todos os tamanhos.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Basic Plan */}
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col hover:border-slate-700 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                    <p className="text-slate-500 text-sm mb-6">Para startups e monitoramento leve.</p>
                    <div className="text-4xl font-bold text-white mb-6">R$ 99<span className="text-lg text-slate-500 font-normal">/mês</span></div>
                    <ul className="space-y-3 mb-8 flex-1 text-slate-400 text-sm">
                        <li className="flex gap-2">✓ 5 Palavras-chave</li>
                        <li className="flex gap-2">✓ Atualização Diária</li>
                        <li className="flex gap-2">✓ Dashboard Básico</li>
                        <li className="flex gap-2 text-slate-600">✕ Análise de IA Avançada</li>
                    </ul>
                    <button onClick={onLogin} className="w-full py-3 border border-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors">Selecionar</button>
                </div>

                {/* Pro Plan (Featured) */}
                <div className="bg-slate-800 p-8 rounded-2xl border border-blue-600 flex flex-col shadow-2xl relative transform md:-translate-y-4 hover:scale-[1.02] transition-transform duration-300">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
                    <h3 className="text-xl font-bold text-white mb-2">Enterprise Pro</h3>
                    <p className="text-blue-200 text-sm mb-6">Poder total de IA e tempo real.</p>
                    <div className="text-4xl font-bold text-white mb-6">R$ 299<span className="text-lg text-slate-400 font-normal">/mês</span></div>
                    <ul className="space-y-3 mb-8 flex-1 text-slate-300 text-sm">
                        <li className="flex gap-2 text-white">✓ Palavras-chave Ilimitadas</li>
                        <li className="flex gap-2 text-white">✓ Atualização em Tempo Real</li>
                        <li className="flex gap-2 text-white">✓ IA Gemini 2.5 Flash</li>
                        <li className="flex gap-2 text-white">✓ Alertas de Crise (Email/SMS)</li>
                        <li className="flex gap-2 text-white">✓ Suporte Dedicado</li>
                    </ul>
                    <button onClick={onLogin} className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg shadow-blue-900/50 transition-colors">Começar Trial</button>
                </div>

                {/* Custom Plan */}
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 flex flex-col hover:border-slate-700 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-2">Governo</h3>
                    <p className="text-slate-500 text-sm mb-6">Para órgãos públicos e grandes volumes.</p>
                    <div className="text-4xl font-bold text-white mb-6">Sob Consulta</div>
                    <ul className="space-y-3 mb-8 flex-1 text-slate-400 text-sm">
                        <li className="flex gap-2">✓ Infraestrutura Dedicada (VPS)</li>
                        <li className="flex gap-2">✓ SLA Garantido</li>
                        <li className="flex gap-2">✓ Auditoria Personalizada</li>
                        <li className="flex gap-2">✓ Treinamento de Equipe</li>
                    </ul>
                    <button className="w-full py-3 border border-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors">Falar com Consultor</button>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
              <div className="font-bold text-xl text-white mb-1">S.I.E. PRO</div>
              <p className="text-slate-500 text-sm">Sistema Integrado de Estratégia.</p>
              <div className="flex gap-4 mt-4 text-xs text-slate-600">
                 <button onClick={onPrivacy} className="hover:text-blue-400 transition-colors">Política de Privacidade</button>
                 <span>© 2024 Todos os direitos reservados.</span>
              </div>
          </div>
          
          {/* Terminal Link */}
          <button 
            onClick={onOpenDocs}
            className="flex items-center gap-2 text-xs font-mono text-green-500 hover:text-green-400 bg-slate-900 px-6 py-3 rounded-lg border border-slate-800 hover:border-green-900 transition-all shadow-lg"
          >
            <span className="animate-pulse">_&gt;</span> Acessar Documentação Técnica & Deploy
          </button>
        </div>
      </footer>
    </div>
  );
};