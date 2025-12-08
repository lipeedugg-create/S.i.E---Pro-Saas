import React, { useState } from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
  onLogin: () => void;
  activePage: string;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, onNavigate, onLogin, activePage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScrollTo = (id: string) => {
    if (activePage !== 'homepage') {
      onNavigate('homepage');
      // Pequeno delay para permitir a montagem da Home antes de scrollar
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col selection:bg-blue-500/30">
      
      {/* Navbar Fixa */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => activePage === 'homepage' ? window.scrollTo({ top: 0, behavior: 'smooth' }) : onNavigate('homepage')}
          >
             <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">S</div>
             <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white leading-none">S.I.E. PRO</span>
                <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Enterprise v2.0</span>
             </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => handleScrollTo('solutions')} className="hover:text-white transition-colors hover:scale-105 transform">Soluções</button>
            <button onClick={() => handleScrollTo('plans')} className="hover:text-white transition-colors hover:scale-105 transform">Planos</button>
            <button onClick={() => handleScrollTo('tech')} className="hover:text-white transition-colors hover:scale-105 transform">Tecnologia</button>
            <button onClick={() => onNavigate('contact')} className={`transition-colors hover:scale-105 transform ${activePage === 'contact' ? 'text-white font-bold' : 'hover:text-white'}`}>Contato</button>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
                onClick={onLogin}
                className="text-slate-300 font-bold hover:text-white transition-colors px-4 py-2 text-sm"
            >
                Entrar
            </button>
            <button 
                onClick={() => {
                    onNavigate('homepage');
                    setTimeout(() => {
                        const el = document.getElementById('plans');
                        if(el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-900/20 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 text-sm"
            >
                Começar Agora
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-slate-300 p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
             </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 bg-slate-900 border-b border-slate-800 ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 space-y-4 text-center">
                <button onClick={() => handleScrollTo('solutions')} className="block w-full text-slate-300 hover:text-white py-2">Soluções</button>
                <button onClick={() => handleScrollTo('plans')} className="block w-full text-slate-300 hover:text-white py-2">Planos</button>
                <button onClick={() => handleScrollTo('tech')} className="block w-full text-slate-300 hover:text-white py-2">Tecnologia</button>
                <button onClick={() => { onNavigate('contact'); setIsMobileMenuOpen(false); }} className="block w-full text-slate-300 hover:text-white py-2">Contato</button>
                <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                    <button onClick={onLogin} className="block w-full text-white font-bold py-2">Login</button>
                    <button onClick={() => { handleScrollTo('plans'); }} className="block w-full bg-blue-600 text-white font-bold py-3 rounded-lg">Criar Conta</button>
                </div>
            </div>
        </div>
      </nav>

      {/* Main Content Injector */}
      <main className="flex-1">
        {children}
      </main>

      {/* Unified Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 pt-16 pb-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">S</div>
                        <span className="font-bold text-xl text-white">S.I.E. PRO</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Plataforma líder em inteligência de dados e monitoramento estratégico para governos e grandes corporações.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-colors">in</a>
                        <a href="#" className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-colors">𝕏</a>
                        <a href="#" className="w-8 h-8 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 transition-colors">ig</a>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-wider">Produto</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><button onClick={() => handleScrollTo('solutions')} className="hover:text-blue-400 transition-colors">Funcionalidades</button></li>
                        <li><button onClick={() => handleScrollTo('plans')} className="hover:text-blue-400 transition-colors">Planos & Preços</button></li>
                        <li><button onClick={() => handleScrollTo('tech')} className="hover:text-blue-400 transition-colors">API & Integrações</button></li>
                        <li><span className="text-slate-600">Roadmap (Em breve)</span></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-wider">Suporte</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><button onClick={() => onNavigate('documentation')} className="hover:text-blue-400 transition-colors">Documentação Técnica</button></li>
                        <li><button onClick={() => onNavigate('contact')} className="hover:text-blue-400 transition-colors">Fale Conosco</button></li>
                        <li><button onClick={() => onNavigate('contact')} className="hover:text-blue-400 transition-colors">Status do Sistema</button></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-4 uppercase text-xs tracking-wider">Legal</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><button onClick={() => onNavigate('privacy')} className="hover:text-blue-400 transition-colors">Política de Privacidade</button></li>
                        <li><button onClick={() => onNavigate('terms')} className="hover:text-blue-400 transition-colors">Termos de Uso</button></li>
                        <li><span className="text-slate-600 cursor-not-allowed">Compliance (LGPD)</span></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-mono">
                <span>© 2024 S.I.E. PRO Inc. Todos os direitos reservados.</span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Systems Online</span>
                    <span>São Paulo, BR</span>
                    <span>v2.0.0</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};