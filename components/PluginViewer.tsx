import React, { useEffect, useRef, useState } from 'react';
import { Plugin } from '../types';

interface PluginViewerProps {
  plugin: Plugin;
  userToken: string;
}

export const PluginViewer: React.FC<PluginViewerProps> = ({ plugin, userToken }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Quando o plugin mudar, reseta o loading
    setLoading(true);
  }, [plugin.id]);

  const handleLoad = () => {
    setLoading(false);
    // Envia o token para o plugin assim que ele carregar
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'AUTH_TOKEN',
        token: userToken,
        user: localStorage.getItem('user_cache')
      }, '*');
    }
  };

  if (!plugin.entry_point) {
    return (
      <div className="p-8 text-center text-slate-400">
        <h3 className="text-xl font-bold text-white mb-2">Erro no Plugin</h3>
        <p>Este plugin não possui um ponto de entrada (index.html) configurado.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 relative">
      {/* Header do Plugin (Estilo Nativo) */}
      <div className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shrink-0">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                {plugin.icon}
            </div>
            <div>
                <h2 className="text-white font-bold text-sm leading-tight">{plugin.name}</h2>
                <p className="text-[10px] text-slate-500 font-mono">v{plugin.version}</p>
            </div>
         </div>
         {loading && (
             <span className="text-xs text-blue-400 flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
                Carregando Módulo...
             </span>
         )}
      </div>

      {/* Área do Plugin */}
      <div className="flex-1 relative bg-white"> 
         <iframe
            ref={iframeRef}
            src={plugin.entry_point}
            className="absolute inset-0 w-full h-full border-none"
            title={plugin.name}
            onLoad={handleLoad}
            // Sandbox para segurança, permitindo scripts e formulários
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
         />
      </div>
    </div>
  );
};