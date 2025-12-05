import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8 font-sans relative overflow-hidden">
       {/* Background Effects */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
         <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/40 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-[100px]"></div>
         <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
       </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <button 
          onClick={onBack}
          className="mb-8 text-slate-400 hover:text-white font-bold text-sm flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800 transition-all"
        >
          ← Voltar para a Homepage
        </button>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 md:p-12">
            <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidade</h1>
            <p className="text-slate-500 text-sm mb-8 border-b border-slate-800 pb-6">
                Última atualização: 15 de Outubro de 2024.
            </p>
            
            <div className="space-y-8 text-sm leading-relaxed text-slate-400">
            
            <section>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-blue-900/30 text-blue-400 flex items-center justify-center text-xs">1</span> 
                    Coleta de Dados
                </h2>
                <p>
                    O S.I.E. PRO adota uma abordagem minimalista para coleta de dados. Armazenamos apenas o estritamente necessário para a operação do monitoramento estratégico:
                </p>
                <ul className="list-disc pl-10 mt-2 space-y-1">
                    <li>URLs públicas inseridas pelo usuário para monitoramento.</li>
                    <li>Palavras-chave e tópicos de interesse.</li>
                    <li>Metadados de acesso (Logs de Requisição) para auditoria financeira.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-purple-900/30 text-purple-400 flex items-center justify-center text-xs">2</span>
                    Uso de Inteligência Artificial (Gemini)
                </h2>
                <p>
                    Utilizamos a API <strong>Google Gemini</strong> para processamento de linguagem natural. É importante ressaltar que:
                </p>
                <div className="mt-3 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <p className="text-xs text-slate-300">
                        "Os dados enviados para análise (textos de notícias e snippets) <strong>não são utilizados</strong> para treinamento dos modelos da Google, conforme os termos Enterprise da Google Cloud Platform vigentes para API paga."
                    </p>
                </div>
            </section>

            <section>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-emerald-900/30 text-emerald-400 flex items-center justify-center text-xs">3</span>
                    Segurança & Compliance
                </h2>
                <p>
                    Todas as comunicações entre o cliente e nossos servidores são criptografadas via <strong>TLS 1.3</strong>. As senhas são armazenadas utilizando hash seguro (Bcrypt). Logs de auditoria financeira são imutáveis e retidos por 5 anos para conformidade fiscal.
                </p>
            </section>

            <section>
                <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-xs">4</span>
                    Contato DPO
                </h2>
                <p>
                    Para questões relacionadas à Lei Geral de Proteção de Dados (LGPD), entre em contato com nosso Encarregado de Dados via <span className="text-blue-400 cursor-pointer hover:underline">privacy@sie.pro</span>.
                </p>
            </section>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-600">
            © 2024 S.I.E. PRO Inc. | Security Operation Center
            </div>
        </div>
      </div>
    </div>
  );
};