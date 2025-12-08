import { useState, useEffect } from 'react';
import { api } from './services/api';
import { Login } from './pages/Login';
import { Homepage } from './pages/Homepage';
import { Documentation } from './pages/Documentation'; 
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { Contact } from './pages/Contact';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLogs } from './pages/admin/AdminLogs';
import { AdminAddons } from './pages/admin/AdminAddons';
import { AdminPlugins } from './pages/admin/AdminPlugins'; 
import { AdminUsers } from './pages/admin/AdminUsers';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientConfig } from './pages/client/ClientConfig';
import { PublicAdminSearch } from './pages/client/PublicAdminSearch';
import { ClientProfile } from './pages/client/ClientProfile';
import { User } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<string>('homepage'); 
  const [showDocs, setShowDocs] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // New State: Pass selected plan from Homepage to Register Flow
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Restore Session on Load (Optimistic + Validation)
  useEffect(() => {
    const checkSession = async () => {
        const token = localStorage.getItem('token');
        const cachedUserStr = localStorage.getItem('user_cache');

        // 1. Hidratação Otimista (Optimistic Hydration)
        if (token && cachedUserStr) {
            try {
                const cachedUser = JSON.parse(cachedUserStr);
                setCurrentUser(cachedUser);
                if (activePage === 'homepage' || activePage === 'login') {
                     setActivePage(cachedUser.role === 'admin' ? 'admin-dashboard' : 'client-dashboard');
                }
            } catch (e) {
                console.error("Cache inválido", e);
            }
        }

        if (!token) {
            setIsAuthLoading(false);
            return;
        }

        // 2. Validação Assíncrona no Servidor
        try {
            const freshUser = await api.validateSession();
            setCurrentUser(freshUser);
            localStorage.setItem('user_cache', JSON.stringify(freshUser));
            
            if (!currentUser && (activePage === 'login' || activePage === 'homepage')) {
                 setActivePage(freshUser.role === 'admin' ? 'admin-dashboard' : 'client-dashboard');
            }
        } catch (error: any) {
            console.error("Sessão:", error.message);
            if (error.message.includes('AUTH_ERROR') || error.message.includes('Sessão expirada')) {
                console.warn("Token inválido ou expirado. Realizando logout.");
                localStorage.removeItem('token');
                localStorage.removeItem('user_cache');
                setCurrentUser(null);
                setActivePage('homepage');
            } else {
                console.warn("Backend indisponível momentaneamente. Mantendo sessão em cache.");
            }
        } finally {
            setIsAuthLoading(false);
        }
    };

    checkSession();
  }, []); 

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActivePage(user.role === 'admin' ? 'admin-dashboard' : 'client-dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_cache');
    setCurrentUser(null);
    setActivePage('homepage'); 
  };

  const handleNavigate = (page: string) => {
    if (page === 'documentation') {
      setShowDocs(true);
    } else {
      setActivePage(page);
    }
  };

  // Handler for Homepage "Select Plan"
  const handleSelectPlan = (planId: string) => {
      setSelectedPlan(planId);
      setActivePage('login');
  };

  if (isAuthLoading && !currentUser) {
      return (
          <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-slate-400 text-sm font-bold tracking-widest uppercase animate-pulse">Conectando S.I.E. PRO...</span>
              </div>
          </div>
      );
  }

  // Se o docs estiver aberto, renderiza ele sobre tudo (Modal Fullscreen)
  if (showDocs) {
    return <Documentation onClose={() => setShowDocs(false)} />;
  }

  // Rotas Públicas
  if (!currentUser) {
    if (activePage === 'login') return <Login onLogin={handleLogin} initialPlan={selectedPlan} />;
    if (activePage === 'privacy') return <PrivacyPolicy onBack={() => setActivePage('homepage')} />;
    if (activePage === 'terms') return <Terms onBack={() => setActivePage('homepage')} />;
    if (activePage === 'contact') return <Contact onBack={() => setActivePage('homepage')} />;
    
    return (
        <Homepage 
            onLogin={() => { setSelectedPlan(null); setActivePage('login'); }} 
            onSelectPlan={handleSelectPlan} 
            onOpenDocs={() => setShowDocs(true)} 
            onPrivacy={() => setActivePage('privacy')} 
            onTerms={() => setActivePage('terms')}
            onContact={() => setActivePage('contact')}
        />
    );
  }

  const renderContent = () => {
    switch (activePage) {
      // Admin Routes
      case 'admin-dashboard':
        return <AdminDashboard currentAdminId={currentUser.id} />;
      case 'admin-logs':
        return <AdminLogs />;
      case 'admin-addons':
        return <AdminAddons />;
      case 'admin-plugins': 
        return <AdminPlugins />;
      case 'admin-users':
        return <AdminUsers onLogin={handleLogin} />;
      
      // Client Routes
      case 'client-dashboard':
        return <ClientDashboard user={currentUser} />;
      case 'client-config':
        return <ClientConfig user={currentUser} />;
      case 'client-public-search':
        return <PublicAdminSearch />;
      case 'client-settings':
        return <ClientProfile user={currentUser} onUpdate={(updated) => {
            setCurrentUser(updated);
            localStorage.setItem('user_cache', JSON.stringify(updated));
        }} />;
      
      default:
        return <div className="p-8 text-white flex items-center justify-center h-full opacity-50">Página em construção</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-slate-200 overflow-hidden selection:bg-blue-500/30">
      
      <Sidebar 
        user={currentUser} 
        activePage={activePage} 
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-900">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-slate-950 border-b border-slate-900 z-20 shrink-0 shadow-md">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg">S</div>
             <span className="font-bold text-white tracking-tight">S.I.E. PRO</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="text-slate-400 hover:text-white p-2 transition-colors rounded hover:bg-slate-800"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}