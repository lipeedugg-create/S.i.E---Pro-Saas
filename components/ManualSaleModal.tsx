import React, { useState, useEffect } from 'react';
import { Plan, User, Subscription } from '../types';
import { api } from '../services/api';

interface ManualSaleModalProps {
  plan: Plan;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualSaleModal: React.FC<ManualSaleModalProps> = ({ plan, onClose, onSuccess }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState(plan.price.toString());
  const [refId, setRefId] = useState('');
  const [notes, setNotes] = useState(`Venda manual do plano ${plan.name}`);
  
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Carrega usuários para o dropdown
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await api.getUsers();
        // Filtra apenas clientes (não admins)
        setUsers(data.filter(u => u.role !== 'admin'));
      } catch (err) {
        console.error("Erro ao carregar usuários", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
        alert("Selecione um cliente.");
        return;
    }

    setLoading(true);
    try {
        // 1. Atribui o plano ao usuário (Cria ou Atualiza Assinatura)
        await api.assignPlan(selectedUserId, plan.id);

        // 2. Busca a assinatura recém criada/atualizada para pegar o ID
        const allSubs = await api.getSubscriptions();
        const userSub = allSubs.find(s => s.user_id === selectedUserId);

        if (!userSub) {
            throw new Error("Falha ao recuperar assinatura do usuário.");
        }

        // 3. Registra o Pagamento Financeiro
        // admin_recorded_by é inferido pelo token no backend
        await api.recordPayment({
            subscription_id: userSub.id,
            amount: parseFloat(amount),
            payment_date: new Date().toISOString().split('T')[0],
            reference_id: refId || `MANUAL-${Date.now()}`,
            admin_recorded_by: '', // Ignorado pelo backend
            notes: notes
        });

        alert("Venda registrada e acesso liberado com sucesso!");
        onSuccess();
    } catch (err: any) {
        console.error(err);
        alert("Erro ao processar venda: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900/50 to-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>💰</span> Nova Venda Manual
            </h2>
            <p className="text-emerald-400 text-xs mt-0.5 font-bold uppercase">Plano: {plan.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Seleção de Cliente */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cliente Beneficiário</label>
            <select 
                required
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={loadingUsers}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-blue-500 outline-none text-sm"
            >
                <option value="">{loadingUsers ? "Carregando..." : "Selecione um cliente..."}</option>
                {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">O plano será ativado imediatamente para este usuário.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Valor (R$)</label>
                <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ref. Pagamento</label>
                <input
                    type="text"
                    required
                    placeholder="Ex: PIX-999"
                    value={refId}
                    onChange={(e) => setRefId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:border-emerald-500 outline-none"
                />
              </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notas Internas</label>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-300 rounded-lg p-3 focus:border-blue-500 outline-none h-20 resize-none text-sm"
                placeholder="Detalhes da transação..."
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors text-sm font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-900/20 disabled:opacity-70 flex justify-center items-center gap-2 text-sm font-bold"
            >
              {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processando...
                  </>
              ) : 'Confirmar Venda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};