import React, { useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@sie.pro');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulating Backend Auth Logic
    const user = db.getUserByEmail(email);
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciais inválidas.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Graphic Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute top-8 left-8 flex items-center gap-2">
         {/* Logo Placeholder */}
         <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
         <span className="text-white font-bold text-xl tracking-wide">S.I.E. PRO</span>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Acesso Restrito</h1>
          <p className="text-slate-400 text-sm mt-2">Identifique-se para acessar o painel.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="••••••"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/20 mt-2"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Contas Demo:</p>
          <div className="flex justify-center gap-3 mt-2">
            <button onClick={() => setEmail('admin@sie.pro')} className="text-blue-400 hover:underline">Admin</button>
            <button onClick={() => setEmail('client@corp.com')} className="text-blue-400 hover:underline">Enterprise</button>
            <button onClick={() => setEmail('tech@start.com')} className="text-blue-400 hover:underline">Basic</button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-4 text-slate-600 text-xs">
        © 2024 S.I.E. PRO Inc. | v2.0 Enterprise
      </div>
    </div>
  );
};