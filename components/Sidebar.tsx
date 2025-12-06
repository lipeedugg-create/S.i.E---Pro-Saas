import React from 'react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activePage, onNavigate, onLogout, isOpen, onCloseMobile }) => {
  const adminLinks = [
    { id: 'admin-dashboard', label: 'Visão Geral', iconPath: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { id: 'admin-users', label: 'Gestão de Usuários', iconPath: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { id: 'admin-addons', label: 'Planos e Features', iconPath: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { id: 'admin-plugins', label: 'Loja de Plugins', iconPath: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" }, // Icone de Cubo/Caixa
    { id: 'admin-logs', label: 'Logs & Auditoria', iconPath: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  ];

  const clientLinks = [
    { id: 'client-dashboard', label: 'Visão Geral', iconPath: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { id: 'client-public-search', label: 'Raio-X Público', iconPath: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }, // Lupa
    { id: 'client-config', label: 'Configuração', iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  ];

  const links = user.role === 'admin' ? adminLinks : clientLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={onCloseMobile}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:h-screen
      `}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-900 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-600/20">
              <span className="font-mono">S</span>
            </div>
            <div>
              <h1 className="text-white font-bold tracking-wide text-sm">S.I.E. PRO</h1>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Enterprise</span>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button onClick={onCloseMobile} className="md:hidden text-slate-500 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Label */}
        <div className="px-6 py-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Navegação
          </p>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onNavigate(link.id);
                onCloseMobile();
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all duration-200 group ${
                activePage === link.id
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-white border border-transparent'
              }`}
            >
              <span className={`w-5 h-5 flex items-center justify-center transition-colors ${activePage === link.id ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.iconPath} />
                </svg>
              </span>
              <span className="font-medium text-sm">{link.label}</span>
            </button>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-900 bg-slate-950">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-slate-900 border border-slate-800">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold text-xs">
                {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize truncate">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full border border-slate-800 hover:bg-red-900/10 hover:border-red-900/30 hover:text-red-400 text-slate-500 py-2 rounded-lg transition-all text-xs font-medium flex items-center justify-center gap-2"
          >
            Sair do Sistema
          </button>
        </div>
      </div>
    </>
  );
};