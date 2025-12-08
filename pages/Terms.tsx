import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-6 md:p-12 font-sans relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/40 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
       </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 md:p-12">
            <h1 className="text-3xl font-bold text-white mb-2">Termos de Uso</h1>
            <p className="text-slate-500 text-sm mb-8 border-b border-slate-800 pb-6">
                Última atualização: 15 de Outubro de 2024. Ao acessar o S.I.E. PRO, você concorda com as condições abaixo.
            </p>
            
            <div className="space-y-8 text-sm leading-relaxed text-slate-400">
            
            <section>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-xs border border-slate-700">1</span> 
                    Objeto do Serviço
                </h2>
                <p>
                    O **S.I.E. PRO** (Sistema Integrado de Estratégia) é uma plataforma SaaS destinada ao monitoramento de dados públicos, notícias e redes sociais para fins de inteligência corporativa e governamental. O uso da plataforma é estritamente profissional.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-xs border border-slate-700">2</span>
                    Responsabilidades do Usuário
                </h2>
                <ul className="list-disc pl-10 mt-2 space-y-2">
                    <li>Você é responsável por manter a confidencialidade de suas credenciais de acesso (Login/Senha).</li>
                    <li>É proibido utilizar a plataforma para monitoramento de dados sensíveis de terceiros sem autorização legal (Stalking/Doxing).</li>
                    <li>O uso de automações externas (scrapers/bots) não oficiais sobre nossa interface é proibido e passível de banimento.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-xs border border-slate-700">3</span>
                    Planos e Pagamentos
                </h2>
                <p>
                    O acesso aos recursos avançados (IA Gemini 2.5, Alertas em Tempo Real) requer uma assinatura ativa (Starter, Pro ou Governo).
                </p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                        <h4 className="text-white font-bold text-xs mb-1">Cancelamento</h4>
                        <p className="text-xs">O cancelamento pode ser feito a qualquer momento, interrompendo a renovação automática no ciclo seguinte.</p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                        <h4 className="text-white font-bold text-xs mb-1">Reembolso</h4>
                        <p className="text-xs">Garantia de 7 dias para novos assinantes. Após este período, não há reembolso parcial.</p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-xs border border-slate-700">4</span>
                    Disponibilidade e SLA
                </h2>
                <p>
                    Para clientes **Enterprise/Governo**, garantimos um SLA de 99.9%. Para planos Starter, o serviço é fornecido "no estado em que se encontra" (AS IS), podendo haver interrupções para manutenção.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-xs border border-slate-700">5</span>
                    Uso de IA e Alucinações
                </h2>
                <p>
                    Os resumos e análises gerados pelo **Google Gemini** podem conter imprecisões ("alucinações"). O S.I.E. PRO atua como uma ferramenta de apoio à decisão e não deve ser utilizado como única fonte da verdade para ações críticas sem verificação humana.
                </p>
            </section>

            </div>

            <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center text-xs text-slate-600">
                <span>© 2024 S.I.E. PRO Inc.</span>
                <span className="font-mono">Jurídico v2.1</span>
            </div>
        </div>
      </div>
    </div>
  );
};