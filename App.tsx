import React, { useState } from 'react';
import { Login } from './pages/Login';
import { Homepage } from './pages/Homepage';
import { Documentation } from './pages/Documentation'; 
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Sidebar } from './components/Sidebar';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminLogs } from './pages/admin/AdminLogs';
import { AdminAddons } from './pages/admin/AdminAddons';
import { AdminPlugins } from './pages/admin/AdminPlugins'; // Nova Página
import { AdminUsers } from './pages/admin/AdminUsers';
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientConfig } from './pages/client/ClientConfig';
import { User } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<string>('homepage'); 
  const [showDocs, setShowDocs] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActivePage(user.role === 'admin' ? 'admin-dashboard' : 'client-dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('homepage'); 
  };

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
      case 'admin-dashboard':
        return <AdminDashboard currentAdminId={currentUser.id} />;
      case 'admin-logs':
        return <AdminLogs />;
      case 'admin-addons':
        return <AdminAddons />;
      case 'admin-plugins': // Nova Rota
        return <AdminPlugins />;
      case 'admin-users':
        return <AdminUsers onLogin={handleLogin} />;
      case 'client-dashboard':
        return <ClientDashboard user={currentUser} />;
      case 'client-config':
        return <ClientConfig user={currentUser} />;
      default:
        return <div className="p-8 text-white">Página não encontrada</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans text-slate-200">
      
      {/* Sidebar (Responsive) */}
      <Sidebar 
        user={currentUser} 
        activePage={activePage} 
        onNavigate={setActivePage}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Mobile Header (Only visible on small screens) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800 z-20">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xs">S</div>
             <span className="font-bold text-white">S.I.E. PRO</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-300 p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-0">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}