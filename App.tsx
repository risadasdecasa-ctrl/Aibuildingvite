
import React, { useState } from 'react';
import { ConversionStatus } from './types';
import { analyzeAndRestructure, createViteZip } from './services/builderService';

const App: React.FC = () => {
  const [projectInput, setProjectInput] = useState('');
  const [status, setStatus] = useState<ConversionStatus>(ConversionStatus.IDLE);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const handleRun = async () => {
    if (!projectInput) {
      setError('Por favor, insira o link do projeto ou o código do AI Studio.');
      return;
    }

    setError('');
    setDownloadUrl('');
    setStatus(ConversionStatus.PARSING);

    try {
      const files = await analyzeAndRestructure(projectInput);
      
      setStatus(ConversionStatus.RESTRUCTURING);
      await new Promise(r => setTimeout(r, 600));
      
      setStatus(ConversionStatus.CONFIGURING);
      await new Promise(r => setTimeout(r, 600));
      
      setStatus(ConversionStatus.PACKAGING);
      const zipBlob = await createViteZip(files);
      const url = URL.createObjectURL(zipBlob);
      
      setDownloadUrl(url);
      setStatus(ConversionStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setStatus(ConversionStatus.FAILED);
      setError(err.message || 'Erro ao converter para estrutura Vite/Vercel.');
    }
  };

  const reset = () => {
    setStatus(ConversionStatus.IDLE);
    setProjectInput('');
    setDownloadUrl('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-3xl mb-12 text-center">
        <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-indigo-600 uppercase bg-indigo-100 rounded-full">
          Vercel & Vite Ready
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
          AI Studio <span className="text-indigo-600">to Vercel</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-xl mx-auto">
          Converta seus experimentos do AI Studio em projetos Vite profissionais, prontos para deploy imediato na Vercel.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 p-8 border border-slate-100">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Link do Projeto ou Código Fonte
            </label>
            <textarea
              placeholder="Cole o link do AI Studio ou o conteúdo principal do seu script..."
              value={projectInput}
              onChange={(e) => setProjectInput(e.target.value)}
              disabled={status !== ConversionStatus.IDLE && status !== ConversionStatus.FAILED}
              className="w-full h-32 px-5 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none text-slate-800"
            />
          </div>

          {status === ConversionStatus.IDLE || status === ConversionStatus.FAILED ? (
            <button
              onClick={handleRun}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
            >
              Gerar Projeto Vite
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm font-bold text-slate-500 uppercase tracking-widest">
                <span>{status === ConversionStatus.COMPLETED ? 'Concluído' : status.replace('_', ' ')}</span>
                {status !== ConversionStatus.COMPLETED && <span className="animate-pulse">Processando...</span>}
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500"
                  style={{ 
                    width: status === ConversionStatus.PARSING ? '25%' : 
                           status === ConversionStatus.RESTRUCTURING ? '50%' :
                           status === ConversionStatus.CONFIGURING ? '75%' : 
                           status === ConversionStatus.PACKAGING ? '90%' : '100%' 
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-700 animate-in slide-in-from-top-1">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">
                <p className="font-bold">Erro na Conversão</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {downloadUrl && (
            <div className="p-8 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-indigo-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">ViteProject.zip Pronto</h3>
                <p className="text-slate-600 text-sm mt-1">Configurado com Build Command: <code className="bg-indigo-100 px-1 rounded text-indigo-700">npm run build</code></p>
              </div>
              <div className="flex flex-col gap-3">
                <a 
                  href={downloadUrl} 
                  download="ViteProject-Vercel.zip"
                  className="block w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg text-center"
                >
                  Baixar ZIP para Vercel
                </a>
                <div className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200">
                  <p className="font-bold text-slate-700 mb-1">Como fazer o deploy:</p>
                  <ol className="list-decimal list-inside text-left space-y-1">
                    <li>Extraia o ZIP ou suba diretamente para o GitHub</li>
                    <li>Importe o projeto na Vercel</li>
                    <li>O Framework será detectado como <strong>Vite</strong> automaticamente</li>
                  </ol>
                </div>
                <button 
                  onClick={reset}
                  className="text-slate-500 text-sm font-medium hover:text-slate-700 underline mt-2"
                >
                  Reiniciar Processo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl text-center text-slate-500 text-sm">
        <div>
          <div className="font-bold text-slate-800 mb-1">Configuração Automática</div>
          <p>Cria vite.config.js e package.json prontos para produção.</p>
        </div>
        <div>
          <div className="font-bold text-slate-800 mb-1">Padrão Vercel</div>
          <p>Diretório de saída 'dist' e scripts de build totalmente compatíveis.</p>
        </div>
        <div>
          <div className="font-bold text-slate-800 mb-1">Zero Código</div>
          <p>Organiza seus arquivos em pastas src/ e ajusta os imports sozinho.</p>
        </div>
      </div>
    </div>
  );
};

export default App;
