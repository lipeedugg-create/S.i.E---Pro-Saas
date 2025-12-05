import React from 'react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-12">
        <button 
          onClick={onBack}
          className="mb-8 text-blue-500 hover:text-blue-400 font-bold text-sm flex items-center gap-2"
        >
          ← Voltar para a Homepage
        </button>

        <h1 className="text-3xl font-bold text-white mb-8">Política de Privacidade</h1>
        
        <div className="space-y-6 text-sm leading-relaxed text-slate-400">
          <p>
            Última atualização: 15 de Outubro de 2024.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">1. Coleta de Dados</h2>
          <p>
            O S.I.E. PRO coleta apenas os dados estritamente necessários para a operação do monitoramento estratégico, incluindo, mas não se limitando a: URLs públicas, palavras-chave definidas pelo usuário e metadados de acesso (Logs).
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">2. Uso de Inteligência Artificial</h2>
          <p>
            Utilizamos a API Google Gemini para processamento de linguagem natural. Os dados enviados para análise (textos de notícias) não são utilizados para treinamento do modelo da Google, conforme os termos Enterprise da Google Cloud Platform.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">3. Segurança</h2>
          <p>
            Todas as comunicações são criptografadas via TLS 1.3. As senhas são armazenadas utilizando hash bcrypt. Logs de auditoria são imutáveis e retidos por 5 anos para compliance financeiro.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">4. Contato</h2>
          <p>
            Para questões relacionadas à proteção de dados (DPO), entre em contato via <span className="text-blue-400">privacy@sie.pro</span>.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-600">
          © 2024 S.I.E. PRO Inc. Todos os direitos reservados.
        </div>
      </div>
    </div>
  );
};