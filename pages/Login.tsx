import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; 
import { User, Plan } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  initialPlan?: string | null; // Recebe o plano selecionado na homepage
}

type AuthMode = 'login' | 'register_info' | 'register_plan' | 'payment';

export const Login: React.FC<LoginProps> = ({ onLogin, initialPlan }) => {
  // Mode State
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regData, setRegData] = useState({
      name: '',
      email: '',
      phone: '',
      password: '',
      planId: 'starter' // Default
  });

  // Plans State
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Payment State (Mock)
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });

  // General State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-switch to register if a plan is passed via props
  useEffect(() => {
      if (initialPlan) {
          setRegData(prev => ({ ...prev, planId: initialPlan }));
          setMode('register_info');
      }
  }, [initialPlan]);

  // Fetch plans when entering plan selection mode
  useEffect(() => {
      if (mode === 'register_plan') {
          setLoadingPlans(true);
          api.getPublicPlans()
             .then(setAvailablePlans)
             .catch(err => setError('Erro ao carregar planos.'))
             .finally(() => setLoadingPlans(false));
      }
  }, [mode]);

  // LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, token } = await api.login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('user_cache', JSON.stringify(user));
      onLogin(user);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha na conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: INFO SUBMIT
  const handleInfoSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!regData.name || !regData.email || !regData.password) {
          setError("Preencha todos os campos obrigatórios.");
          return;
      }
      if (regData.password.length < 6) {
          setError("A senha deve ter no mínimo 6 caracteres.");
          return;
      }
      // Avança para escolha de plano
      setMode('register_plan');
  };

  // STEP 2: PLAN SELECTION HANDLER
  const handlePlanSelect = (planId: string) => {
      setRegData(prev => ({ ...prev, planId }));
      
      // Lógica de Trial: Se for o plano 'starter', pula pagamento
      if (planId === 'starter') {
          submitRegistration(planId);
      } else {
          setMode('payment');
      }
  };

  // REGISTER SUBMIT (Called by Step 2 or Payment Step)
  const submitRegistration = async (finalPlanId?: string) => {
      setLoading(true);
      setError('');
      
      const payload = { ...regData };
      if(finalPlanId) payload.planId = finalPlanId;

      try {
          const { user, token } = await api.register(payload);
          localStorage.setItem('token', token);
          localStorage.setItem('user_cache', JSON.stringify(user));
          
          setSuccessMsg("Conta criada com sucesso! Acessando...");
          setTimeout(() => {
              onLogin(user);
          }, 1500);

      } catch (err: any) {
          setError(err.message || "Erro ao criar conta.");
          // Se der erro, volta para info para corrigir
          if(err.message.includes('Email')) setMode('register_info');
      } finally {
          setLoading(false);
      }
  };

  // STEP 3: PAYMENT HANDLER
  const handlePaymentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      // Simula delay de processamento de cartão e cria conta
      setTimeout(() => {
          submitRegistration();
      }, 2000);
  };

  // Helper para buscar o preço do plano selecionado
  const selectedPlanPrice = availablePlans.find(p => p.id === regData.planId)?.price || 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute top-8 left-8 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
         <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
         <span className="text-white font-bold text-xl tracking-wide">S.I.E. PRO</span>
      </div>

      <div className={`bg-slate-800/80 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-2xl w-full z-10 transition-all duration-300 ${mode === 'register_plan' ? 'max-w-4xl' : 'max-w-md'}`}>
        
        {/* HEADER DO CARD */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
              {mode === 'login' && 'Acesso Corporativo'}
              {mode === 'register_info' && 'Criar Nova Conta'}
              {mode === 'register_plan' && 'Selecione seu Plano'}
              {mode === 'payment' && 'Configurar Pagamento'}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
              {mode === 'login' && 'Entre com suas credenciais de acesso.'}
              {mode === 'register_info' && 'Passo 1 de 3: Seus Dados'}
              {mode === 'register_plan' && 'Passo 2 de 3: Escolha a modalidade ideal.'}
              {mode === 'payment' && 'Passo 3 de 3: Pagamento seguro SSL.'}
          </p>
        </div>

        {/* FEEDBACK MESSAGES */}
        {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs text-center animate-shake">
              {error}
            </div>
        )}
        {successMsg && (
            <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-900/50 rounded-lg text-emerald-400 text-xs text-center animate-pulse">
              {successMsg}
            </div>
        )}

        {/* --- VIEW: LOGIN --- */}
        {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email</label>
                <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="seu@email.com"
                required
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Senha</label>
                <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••"
                required
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/20 mt-2 disabled:opacity-50 disabled:cursor-wait flex justify-center items-center gap-2"
            >
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Acessar Painel'}
            </button>
            
            <div className="mt-4 text-center">
                <span className="text-slate-500 text-xs">Não tem uma conta? </span>
                <button type="button" onClick={() => setMode('register_info')} className="text-blue-400 hover:text-white text-xs font-bold underline">Cadastre-se</button>
            </div>
            </form>
        )}

        {/* --- VIEW: REGISTER INFO (STEP 1) --- */}
        {mode === 'register_info' && (
            <form onSubmit={handleInfoSubmit} className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nome Completo</label>
                        <input 
                            type="text" 
                            required
                            value={regData.name}
                            onChange={(e) => setRegData({...regData, name: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                            placeholder="Seu nome"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Email Corporativo</label>
                        <input 
                            type="email" 
                            required
                            value={regData.email}
                            onChange={(e) => setRegData({...regData, email: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                            placeholder="nome@empresa.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Telefone</label>
                        <input 
                            type="text" 
                            value={regData.phone}
                            onChange={(e) => setRegData({...regData, phone: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                            placeholder="(11) 9..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Senha</label>
                        <input 
                            type="password" 
                            required
                            value={regData.password}
                            onChange={(e) => setRegData({...regData, password: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
                            placeholder="Mínimo 6 chars"
                        />
                    </div>
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/20 mt-4 flex items-center justify-center gap-2"
                >
                    Próximo: Escolher Plano ➜
                </button>

                <div className="mt-4 text-center">
                    <button type="button" onClick={() => setMode('login')} className="text-slate-500 hover:text-white text-xs font-bold">Já tenho conta (Login)</button>
                </div>
            </form>
        )}

        {/* --- VIEW: REGISTER PLAN (STEP 2) --- */}
        {mode === 'register_plan' && (
            <div className="animate-fade-in">
                {loadingPlans ? (
                    <div className="text-center py-10 text-slate-500">Carregando planos...</div>
                ) : availablePlans.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-400 text-sm mb-4">Nenhum plano disponível no momento.</p>
                        <button onClick={() => submitRegistration('starter')} className="bg-blue-600 text-white px-4 py-2 rounded">
                            Continuar com Plano Padrão
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {availablePlans.map(plan => (
                            <div 
                                key={plan.id}
                                onClick={() => handlePlanSelect(plan.id)}
                                className="bg-slate-900 border border-slate-700 rounded-xl p-5 hover:border-blue-500 cursor-pointer group transition-all relative flex flex-col h-full"
                            >
                                {plan.id === 'pro' && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">Recomendado</div>
                                )}
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-white">{plan.name}</h3>
                                </div>
                                <p className="text-2xl font-bold text-white mb-2">
                                    R$ {Number(plan.price).toFixed(0)}<span className="text-sm font-normal text-slate-500">/mês</span>
                                </p>
                                <p className="text-xs text-slate-400 mb-4 line-clamp-3 flex-1">{plan.description}</p>
                                <button className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${
                                    plan.id === 'pro' ? 'bg-blue-600 text-white hover:bg-blue-500' : 'border border-slate-600 text-slate-300 group-hover:bg-slate-800'
                                }`}>
                                    {plan.id === 'starter' ? 'COMEÇAR TRIAL' : 'ASSINAR AGORA'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button 
                    onClick={() => setMode('register_info')} 
                    className="w-full text-slate-500 hover:text-white text-xs py-2"
                >
                    ← Voltar para Dados
                </button>
            </div>
        )}

        {/* --- VIEW: PAYMENT (STEP 3) --- */}
        {mode === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4 animate-fade-in">
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 p-4 rounded-xl border border-slate-600 shadow-inner mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-slate-400">CARTÃO DE CRÉDITO</span>
                        <span className="text-lg">💳</span>
                    </div>
                    <div className="space-y-3">
                         <input 
                            type="text" 
                            placeholder="0000 0000 0000 0000" 
                            required
                            maxLength={19}
                            className="w-full bg-transparent border-b border-slate-500 text-white font-mono text-lg focus:outline-none focus:border-white placeholder-slate-600"
                            value={cardData.number}
                            onChange={(e) => setCardData({...cardData, number: e.target.value})}
                         />
                         <div className="flex gap-4">
                             <input 
                                type="text" 
                                placeholder="Nome Titular" 
                                required
                                className="flex-1 bg-transparent border-b border-slate-500 text-white text-sm focus:outline-none focus:border-white placeholder-slate-600 uppercase"
                                value={cardData.name}
                                onChange={(e) => setCardData({...cardData, name: e.target.value})}
                             />
                             <input 
                                type="text" 
                                placeholder="MM/AA" 
                                required
                                maxLength={5}
                                className="w-16 bg-transparent border-b border-slate-500 text-white text-sm focus:outline-none focus:border-white placeholder-slate-600 text-center"
                                value={cardData.expiry}
                                onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                             />
                             <input 
                                type="text" 
                                placeholder="CVC" 
                                required
                                maxLength={3}
                                className="w-12 bg-transparent border-b border-slate-500 text-white text-sm focus:outline-none focus:border-white placeholder-slate-600 text-center"
                                value={cardData.cvc}
                                onChange={(e) => setCardData({...cardData, cvc: e.target.value})}
                             />
                         </div>
                    </div>
                </div>

                <div className="flex justify-between items-center text-sm text-slate-300 px-2">
                    <span>Total a pagar:</span>
                    <span className="text-xl font-bold text-white">R$ {Number(selectedPlanPrice).toFixed(2)}</span>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-emerald-600/20 mt-4 flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Processando...
                        </>
                    ) : 'Confirmar e Iniciar'}
                </button>

                <div className="mt-4 text-center">
                    <button type="button" onClick={() => setMode('register_plan')} className="text-slate-500 hover:text-white text-xs font-bold">← Voltar para Planos</button>
                </div>
            </form>
        )}

      </div>
      
      <div className="absolute bottom-4 text-slate-600 text-xs">
        © 2024 S.I.E. PRO Inc. | Conexão Segura
      </div>
    </div>
  );
};