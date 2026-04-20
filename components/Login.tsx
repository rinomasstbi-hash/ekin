import React, { useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export const Login: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isIframe, setIsIframe] = useState<boolean>(false);

  useEffect(() => {
    // Detect if the app is running inside an iframe (like the AI Studio preview)
    setIsIframe(window !== window.parent);
  }, []);

  const handleLogin = async () => {
    setErrorMsg(null);
    setErrorCode(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login error:", error);
      setErrorCode(error.code || null);
      setErrorMsg(error.message || "Gagal login. Silakan coba lagi.");
    }
  };

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-8 text-center">
        <div className="mb-8">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Kementerian_Agama_new_logo.png" 
            alt="Logo Kementerian Agama" 
            className="w-24 h-auto mx-auto mb-6 object-contain"
          />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Smart RHK Generator</h1>
          <p className="text-slate-500">Masuk untuk membuat dan mengelola laporan Rencana Hasil Kerja Anda.</p>
        </div>
        
        {isIframe && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl text-left">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <div>
                <p className="font-bold mb-1">Perhatian: Mode Preview</p>
                <p className="mb-3">Login Google seringkali diblokir oleh browser saat berada di dalam layar preview ini.</p>
                <button 
                  onClick={handleOpenNewTab}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>Buka di Tab Baru</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-left break-words">
            <strong>Error:</strong> {errorMsg}
            
            {errorCode === 'auth/unauthorized-domain' || errorMsg.includes('unauthorized-domain') ? (
              <div className="mt-3 pt-3 border-t border-red-200">
                <p className="font-bold mb-2">Cara Memperbaiki Error Ini:</p>
                <ol className="list-decimal pl-4 space-y-2 text-red-700">
                  <li>Buka <a href="https://console.firebase.google.com/project/gen-lang-client-0527864750/authentication/settings" target="_blank" rel="noreferrer" className="underline font-bold text-blue-600">Pengaturan Firebase Console</a></li>
                  <li>Scroll ke bagian <strong>Authorized domains</strong></li>
                  <li>Klik tombol <strong>Add domain</strong></li>
                  <li>Copy dan paste URL Netlify Anda: <code className="bg-red-100 px-1 py-0.5 rounded select-all block mt-1 mb-1 font-mono text-xs">smart-rhk.netlify.app</code></li>
                  <li>Jika Anda juga mengakses dari AI Studio, tambahkan: <code className="bg-red-100 px-1 py-0.5 rounded select-all block mt-1 font-mono text-xs">ais-dev-ijy2qs7infm2mku3l2ld4f-133408405278.asia-southeast1.run.app</code></li>
                  <li>Refresh halaman web Anda dan coba login kembali.</li>
                </ol>
              </div>
            ) : (
              <p className="mt-2 text-xs text-red-500">
                Jika menggunakan browser Safari atau mode Incognito, pastikan Anda mengizinkan pop-up dan cross-site tracking. Atau coba buka aplikasi di tab baru.
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Masuk dengan Google
        </button>
      </div>
    </div>
  );
};
