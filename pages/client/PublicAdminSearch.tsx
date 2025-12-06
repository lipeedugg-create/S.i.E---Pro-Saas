import React, { useState } from 'react';
import { api } from '../../services/api';
import { CityAdminData } from '../../types';

export const PublicAdminSearch: React.FC = () => {
  const [city, setCity] = useState('');
  const [data, setData] = useState<CityAdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const result = await api.searchPublicAdmin(city);
      setData(result);
    } catch (err: any) {
      setError('Não foi possível recuperar os dados desta cidade. Verifique o nome ou tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-900 text-slate-200 font-sans p-6 md:p-10">
      
      {/* Header Institucional */}
      <div className="max-w-5xl mx-auto mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 mb-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-widest">Módulo de Transparência Ativo</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Raio-X Administrativo</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Ferramenta de inteligência para mapeamento de capital humano na gestão pública municipal.
        </p>
      </div>

      {/* Search Area */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="relative flex bg-slate-950 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
            <input 
              type="text" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Digite o nome da cidade (ex: Curitiba, Campinas...)"
              className="flex-1 bg-transparent border-none px-6 py-5 text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-0"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-cyan-700 hover:bg-cyan-600 text-white px-8 font-bold tracking-wide transition-colors disabled:opacity-50 disabled:cursor-wait border-l border-slate-800"
            >
              {loading ? 'PROCESSANDO...' : 'CONSULTAR'}
            </button>
          </div>
        </form>
        {error && <p className="mt-4 text-red-400 text-center bg-red-900/20 py-2 rounded border border-red-900/50">{error}</p>}
      </div>

      {/* Loading Animation (Data Bars) */}
      {loading && (
        <div className="max-w-4xl mx-auto py-12 text-center">
          <div className="flex justify-center items-end gap-1 h-16 mb-6">
            <div className="w-2 bg-cyan-500/50 animate-[pulse_1s_ease-in-out_infinite] h-8"></div>
            <div className="w-2 bg-cyan-500/70 animate-[pulse_1.5s_ease-in-out_infinite_0.2s] h-12"></div>
            <div className="w-2 bg-cyan-500 animate-[pulse_1.2s_ease-in-out_infinite_0.4s] h-16"></div>
            <div className="w-2 bg-cyan-500/70 animate-[pulse_1.5s_ease-in-out_infinite_0.6s] h-10"></div>
            <div className="w-2 bg-cyan-500/50 animate-[pulse_1s_ease-in-out_infinite_0.8s] h-6"></div>
          </div>
          <p className="text-cyan-400 font-mono text-sm animate-pulse">ACESSANDO BASES DE DADOS GOVERNAMENTAIS...</p>
        </div>
      )}

      {/* Results Display */}
      {data && (
        <div className="max-w-6xl mx-auto animate-fade-in-up space-y-10">
          
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mayor Card */}
            <div className="bg-slate-800 rounded-xl p-8 border-l-4 border-cyan-500 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-serif font-bold text-white select-none">P</div>
              <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-2">Poder Executivo</p>
              <h2 className="text-3xl font-bold text-white mb-1">{data.mayor.name}</h2>
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-slate-900 px-3 py-1 rounded text-sm text-slate-300 font-mono border border-slate-700">{data.mayor.party}</span>
                <span className="text-slate-400 text-sm">Prefeito(a)</span>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <p className="text-xs text-slate-500 uppercase mb-2 font-bold">Histórico Profissional</p>
                <div className="flex flex-wrap gap-2">
                  {data.mayor.past_roles?.map((role, i) => (
                    <span key={i} className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                      {role}
                    </span>
                  ))}
                  {(!data.mayor.past_roles || data.mayor.past_roles.length === 0) && <span className="text-xs text-slate-600 italic">Sem dados anteriores</span>}
                </div>
              </div>
            </div>

            {/* Vice Mayor Card */}
            <div className="bg-slate-800 rounded-xl p-8 border-l-4 border-slate-600 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-serif font-bold text-white select-none">V</div>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Poder Executivo</p>
               <h2 className="text-2xl font-bold text-slate-200 mb-1">{data.vice_mayor.name}</h2>
               <div className="flex items-center gap-3 mb-6">
                 <span className="bg-slate-900 px-3 py-1 rounded text-sm text-slate-400 font-mono border border-slate-700">{data.vice_mayor.party}</span>
                 <span className="text-slate-500 text-sm">Vice-Prefeito(a)</span>
               </div>
            </div>
          </div>

          {/* Councilors (Legislative) */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="text-purple-400">🏛️</span> Câmara Municipal
              </h3>
              <span className="text-xs text-slate-500 uppercase font-bold">Poder Legislativo</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.councilors.map((councilor, idx) => (
                <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-200">{councilor.name}</h4>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">{councilor.party}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{councilor.role}</p>
                  {councilor.past_roles && councilor.past_roles.length > 0 && (
                     <div className="mt-2 pt-2 border-t border-slate-800">
                        <p className="text-[10px] text-slate-600 mb-1">Anteriormente:</p>
                        <p className="text-xs text-slate-400 truncate">{councilor.past_roles.join(', ')}</p>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Public Servants Table */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400">👥</span> Quadro de Servidores Chave
              </h3>
              <span className="text-xs text-slate-500 uppercase font-bold">Secretariado</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900 text-xs font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Nome</th>
                    <th className="px-6 py-3">Lotação (Departamento)</th>
                    <th className="px-6 py-3">Vínculo</th>
                    <th className="px-6 py-3 text-right">Salário Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {data.key_servants.map((servant, idx) => (
                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{servant.name}</td>
                      <td className="px-6 py-4">{servant.department}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${
                          servant.role_type.toLowerCase().includes('comissionado') 
                          ? 'bg-yellow-900/20 text-yellow-500 border-yellow-900/50' 
                          : 'bg-blue-900/20 text-blue-400 border-blue-900/50'
                        }`}>
                          {servant.role_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-400">{servant.estimated_salary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center text-xs text-slate-600 mt-8">
            <p>Dados gerados por inteligência artificial (SIE System v2.1) com base em fontes públicas.</p>
            <p>A precisão pode variar. Utilize para fins consultivos.</p>
          </div>

        </div>
      )}
    </div>
  );
};