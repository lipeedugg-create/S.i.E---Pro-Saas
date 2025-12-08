import React, { useState } from 'react';

interface ContactProps {
  onBack: () => void;
}

export const Contact: React.FC<ContactProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'sales',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-600 rounded-full blur-3xl"></div>
         <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute top-8 left-8">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white font-bold text-sm flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800 transition-all hover:bg-slate-800"
        >
          ← Voltar
        </button>
      </div>

      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-lg z-10 transition-all duration-300">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Fale Conosco</h1>
          <p className="text-slate-400 text-sm">
            Dúvidas sobre planos Enterprise, parcerias ou suporte técnico? Nossa equipe responde em até 2 horas.
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-10 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mensagem Enviada!</h3>
            <p className="text-slate-400 text-sm mb-6">Recebemos seu contato. Verifique seu email em breve.</p>
            <button 
              onClick={onBack}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Voltar para Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Seu Nome</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none transition-colors"
                  placeholder="corp@empresa.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Assunto</label>
              <select 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none transition-colors"
              >
                <option value="sales">Comercial / Vendas Enterprise</option>
                <option value="support">Suporte Técnico</option>
                <option value="partnership">Parcerias & Imprensa</option>
                <option value="other">Outros Assuntos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mensagem</label>
              <textarea 
                required
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 focus:border-blue-500 outline-none h-32 resize-none transition-colors"
                placeholder="Como podemos ajudar sua empresa?"
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'sending'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-600/20 mt-2 flex justify-center items-center gap-2"
            >
              {status === 'sending' ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Enviando...
                </>
              ) : 'Enviar Mensagem'}
            </button>
          </form>
        )}
      </div>
      
      <div className="absolute bottom-6 text-slate-600 text-xs">
        © 2024 S.I.E. PRO Inc. | São Paulo, Brasil
      </div>
    </div>
  );
};