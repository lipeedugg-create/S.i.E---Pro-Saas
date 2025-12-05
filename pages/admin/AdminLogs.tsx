import React, { useEffect, useState } from 'react';
import { db } from '../../services/db';
import { RequestLog } from '../../types';
import { runMonitoringCycle } from '../../services/collectorService';

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = () => {
    const data = db.getLogs();
    setLogs(data);
    setTotalCost(data.reduce((acc, log) => acc + log.cost_usd, 0));
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerCycle = async () => {
    setIsRunning(true);
    try {
      await runMonitoringCycle('SECRET_CRON_KEY'); 
      fetchLogs();
    } catch (e) {
      alert('Error triggering cycle');
    } finally {
      setIsRunning(false);
    }
  };

  // Lógica de Filtro dos Logs
  const filteredLogs = logs.filter(log => 
    log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-900 min-h-full text-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Auditoria & Custos IA</h2>
          <p className="text-slate-500">Rastreamento detalhado de consumo de tokens por requisição.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 px-6 py-3 rounded-xl text-right">
          <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Custo Total (Período)</p>
          <p className="text-2xl font-mono font-bold text-white">${totalCost.toFixed(6)}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        {/* Trigger Button */}
        <button 
          onClick={handleTriggerCycle}
          disabled={isRunning}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg flex items-center gap-2 ${
            isRunning 
            ? 'bg-slate-800 text-slate-500 cursor-wait border border-slate-700' 
            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20'
          }`}
        >
          {isRunning ? (
             <span className="flex items-center gap-2">
               <span className="animate-spin h-4 w-4 border-2 border-slate-500 border-t-white rounded-full"></span>
               Processando Ciclo...
             </span>
          ) : '⚡ Disparar Coleta Manual'}
        </button>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
           </div>
           <input 
             type="text"
             placeholder="Filtrar por User ID, Status ou Endpoint..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full bg-slate-950 border border-slate-700 text-sm rounded-lg pl-9 pr-3 py-2.5 text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-slate-600"
           />
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-950 text-slate-500 font-semibold uppercase text-xs border-b border-slate-700">
            <tr>
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">User ID</th>
              <th className="px-6 py-3">Endpoint</th>
              <th className="px-6 py-3 text-center">Tokens (In / Out)</th>
              <th className="px-6 py-3 text-right">Custo (USD)</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredLogs.length === 0 ? (
               <tr>
                 <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Nenhum log encontrado. Dispare uma coleta manual.</td>
               </tr>
            ) : (
              filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-3 font-mono text-xs text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="px-6 py-3 font-mono text-xs text-blue-400">{log.user_id.substring(0, 8)}...</td>
                  <td className="px-6 py-3 font-medium text-slate-300">{log.endpoint}</td>
                  <td className="px-6 py-3 text-center text-xs">
                    <span className="text-slate-400">{log.request_tokens}</span> <span className="text-slate-600 px-1">/</span> <span className="text-blue-400">{log.response_tokens}</span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono font-medium text-emerald-400">
                    ${log.cost_usd.toFixed(8)}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                      log.status === 'SUCCESS' || log.status === 'SUCESSO'
                      ? 'bg-green-900/20 text-green-400 border-green-900/50' 
                      : 'bg-red-900/20 text-red-400 border-red-900/50'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};