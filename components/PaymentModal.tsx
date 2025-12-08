import React, { useState } from 'react';
import { User, Subscription } from '../types';
import { api } from '../services/api'; 

interface PaymentModalProps {
  user: User;
  subscription: Subscription | undefined;
  onClose: () => void;
  onSuccess: () => void;
  // adminId removed as it is now handled by backend token
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ user, subscription, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [refId, setRefId] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription) return;
    setError('');
    setIsSubmitting(true);
    
    try {
      await api.recordPayment({
        subscription_id: subscription.id,
        amount: parseFloat(amount),
        payment_date: new Date().toISOString().split('T')[0],
        reference_id: refId,
        admin_recorded_by: '', // Backend will fill this from token
        notes: notes
      });
      onSuccess(); 
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao processar pagamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!subscription) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="bg-gradient-to-r from-emerald-900/50 to-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Registrar Pagamento</h2>
            <p className="text-emerald-400 text-xs mt-0.5 font-bold uppercase">{user.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Valor (BRL)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500">R$</span>
              <input
                type="number"
                required
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-8 pr-4 py-2.5 focus:border-emerald-500 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">ID da Transação / Referência</label>
            <input
              type="text"
              required
              value={refId}
              onChange={(e) => setRefId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none"
              placeholder="Ex: PIX-123456"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notas Internas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-300 rounded-lg p-3 focus:border-blue-500 outline-none h-24 resize-none text-sm"
              placeholder="Detalhes sobre a transação..."
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-70 flex justify-center items-center gap-2 text-sm font-bold"
            >
              {isSubmitting ? 'Processando...' : 'Confirmar Pagamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};