import { useState, useEffect } from 'react';
import { api } from './services/api';
import { Login } from './pages/Login';
import { Homepage } from './pages/Homepage';
import { Documentation } from './pages/Documentation'; 
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLogs } from './pages/admin/AdminLogs';
import { AdminAddons } from './pages/admin/AdminAddons';
import { AdminPlugins } from './pages/admin/AdminPlugins'; 
import { AdminUsers } from './pages/admin/AdminUsers';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientConfig } from './pages/client/ClientConfig';
import { PublicAdminSearch } from './pages/client/PublicAdminSearch';
import { User } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<string>('homepage'); 
  const [showDocs, setShowDocs] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Restore Session on Load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
        api.validateSession()
            .then(user => {
                setCurrentUser(user);
                // Se estiver na home ou login, redireciona para dashboard
                if (activePage === 'login' || activePage === 'homepage') {
                     setActivePage(user.role === 'admin' ? 'admin-dashboard' : 'client-dashboard');
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
                setCurrentUser(null);
            })
            .finally(() => {
                setIsAuthLoading(false);
            });
    } else {
        setIsAuthLoading(false);
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActivePage(user.role === 'admin' ? 'admin-dashboard' : 'client-dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setActivePage('homepage'); 
  };

  if (isAuthLoading) {
      return (
          <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <span className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                  <span className="text-slate-500 text-sm font-bold tracking-widest uppercase">Iniciando S.I.E. PRO...</span>
              </div>
          </div>
      );
  }

  if (showDocs) {
    return <Documentation onClose={() => setShowDocs(false)} />;
  }

  // Rotas Públicas
  if (!currentUser) {
    if (activePage === 'login') return <Login onLogin={handleLogin} />;
    if (activePage === 'privacy') return <PrivacyPolicy onBack={() => setActivePage('homepage')} />;
    return <Homepage onLogin={() => setActivePage('login')} onOpenDocs={() => setShowDocs(true)} onPrivacy={() => setActivePage('privacy')} />;
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
      
      default:
        return <div className="p-8 text-white flex items-center justify-center h-full opacity-50">Página em construção</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans text-slate-200 overflow-hidden selection:bg-blue-500/30">
      
      {/* Sidebar (Responsive) */}
      <Sidebar 
        user={currentUser} 
        activePage={activePage} 
        onNavigate={setActivePage}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-950">
        
        {/* Mobile Header (Sticky) */}
        <header className="md:hidden flex items-center justify-between px-4 h-16 bg-slate-950/90 backdrop-blur-md border-b border-slate-900 z-20 shrink-0">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs shadow-lg">S</div>
             <span className="font-bold text-white tracking-tight">S.I.E. PRO</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="text-slate-400 hover:text-white p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}