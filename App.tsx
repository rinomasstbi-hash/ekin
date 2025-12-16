import React, { useState, useEffect, useRef } from 'react';
import { ProfileForm } from './components/ProfileForm';
import { ReportView } from './components/ReportView';
import { TeacherProfile, AnalysisResult, ReportData } from './types';
import { analyzeImageWithGemini } from './services/geminiService';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  
  // Logic to detect Environment API Key (Netlify/Vite/CRA)
  const getEnvApiKey = () => {
    try {
      // Check for Vite specific env vars
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
         // @ts-ignore
        if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
         // @ts-ignore
        if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
      }
      
      // Check for standard process.env (Create React App / Webpack / Netlify default)
      if (typeof process !== 'undefined' && process.env) {
        if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
        if (process.env.VITE_API_KEY) return process.env.VITE_API_KEY;
        if (process.env.API_KEY) return process.env.API_KEY;
      }
    } catch (e) {
      // Ignore errors if environment variables are not accessible
    }
    return '';
  };

  const envKey = getEnvApiKey();
  const isKeyManaged = !!envKey;

  const [apiKey, setApiKey] = useState<string>(() => {
    // 1. Priority: Environment Variable
    if (envKey) return envKey;

    // 2. Priority: Local Storage (User entered)
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rhk_gemini_key') || '';
    }
    return '';
  });

  const [profile, setProfile] = useState<TeacherProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('rhk_profile');
      return savedProfile ? JSON.parse(savedProfile) : null;
    }
    return null;
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [periode, setPeriode] = useState<string>(() => {
    const date = new Date();
    const semester = date.getMonth() < 6 ? 'Januari - Juni' : 'Juli - Desember';
    return `${semester} ${date.getFullYear()}`;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleSaveProfile = (newProfile: TeacherProfile) => {
    setProfile(newProfile);
    localStorage.setItem('rhk_profile', JSON.stringify(newProfile));
  };

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('rhk_gemini_key', key);
    setShowSettings(false);
  };

  const handleClearData = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua data (Profil & API Key) dari browser ini?")) {
      localStorage.removeItem('rhk_profile');
      localStorage.removeItem('rhk_gemini_key');
      setProfile(null);
      
      // Only clear API key if it's not from environment
      if (!isKeyManaged) {
        setApiKey('');
      }
      
      setReportData(null);
      setSelectedImage(null);
      setShowSettings(false);
      window.location.reload();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        alert("Ukuran file terlalu besar (Maks 5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    if (!selectedImage) {
      setError("Silakan upload foto terlebih dahulu.");
      return;
    }
    if (!profile) {
      setError("Profil belum lengkap.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result: AnalysisResult = await analyzeImageWithGemini(apiKey, selectedImage);
      
      const newReport: ReportData = {
        image: selectedImage,
        profile: profile,
        periode: periode,
        analysis: result,
        tanggalLaporan: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      };
      
      setReportData(newReport);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses gambar.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    setReportData(null);
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- RENDER ---

  // 1. VIEW: REPORT RESULT
  if (reportData) {
    return <ReportView data={reportData} onReset={resetAll} />;
  }

  // 2. VIEW: ONBOARDING / PROFILE SETUP
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
          <div className="text-center mb-8">
            <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Selamat Datang</h1>
            <p className="text-slate-500">Isi data diri Anda sekali saja untuk memulai membuat laporan otomatis.</p>
          </div>
          <ProfileForm initialProfile={null} onSave={handleSaveProfile} />
        </div>
        <p className="mt-8 text-xs text-slate-400 text-center max-w-sm leading-relaxed">
          Privasi Aman: Data Profil disimpan di browser Anda (LocalStorage). <br/>
          {isKeyManaged ? "API Key telah dikonfigurasi oleh sistem." : "API Key disimpan di LocalStorage."}
        </p>
      </div>
    );
  }

  // 3. VIEW: MAIN DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-6 sm:pt-10 pb-6 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden relative">
        
        {/* Header */}
        <header className="bg-teal-700 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Smart RHK</h1>
            <p className="text-teal-100 text-xs mt-1 opacity-90">Halo, {profile.nama}</p>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-sm"
            title="Pengaturan"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </button>
        </header>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6">
          
          {/* Periode Input */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">Periode Laporan</label>
            <input 
              type="text" 
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="w-full bg-transparent text-slate-800 font-semibold border-b border-slate-300 focus:border-teal-500 outline-none pb-1 transition-colors"
            />
          </div>

          {/* Upload Area */}
          <div 
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={`
              relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden aspect-video flex flex-col items-center justify-center text-center p-6
              ${selectedImage ? 'border-teal-400 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50'}
              ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Preview" className="absolute inset-0 w-full h-full object-contain z-0 bg-black/5" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 text-white font-medium">
                  Ganti Foto
                </div>
              </>
            ) : (
              <>
                <div className="bg-teal-100 text-teal-600 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <h3 className="font-bold text-slate-700 text-lg">Upload Foto</h3>
                <p className="text-sm text-slate-400">Ketuk untuk mengambil gambar</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
              disabled={isAnalyzing}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleProcess}
            disabled={!selectedImage || isAnalyzing}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg shadow-teal-900/10 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]
              ${!selectedImage || isAnalyzing 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-teal-600 text-white hover:bg-teal-700'
              }
            `}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="animate-pulse">Sedang Menganalisis...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                Analisis AI
              </>
            )}
          </button>
        </div>

        {/* Privacy Note Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Privacy First &bull; Local Processing
          </p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Pengaturan</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* API Key Section */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Google Gemini API Key</label>
                
                {isKeyManaged ? (
                  <div className="w-full px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="text-sm font-medium">Terkonfigurasi oleh Sistem</span>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input 
                        type="password" 
                        placeholder="Masukkan kunci AIza..." 
                        className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Belum punya? <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-teal-600 font-semibold hover:underline">Dapatkan API Key Gratis</a>
                    </p>
                    {!apiKey && (
                      <div className="mt-2 bg-yellow-50 text-yellow-700 text-xs p-2 rounded border border-yellow-200">
                        API Key diperlukan agar AI dapat menganalisis foto.
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4">
                {!isKeyManaged && (
                  <button 
                    onClick={() => handleSaveKey(apiKey)}
                    className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-900/10 mb-3"
                  >
                    Simpan Pengaturan
                  </button>
                )}
                
                <button 
                  onClick={() => { setProfile(null); setShowSettings(false); }}
                  className="w-full py-3 text-teal-700 font-semibold hover:bg-teal-50 rounded-xl transition border border-transparent hover:border-teal-100"
                >
                  Edit Profil Guru
                </button>
              </div>

              {/* Danger Zone */}
              <div className="border-t border-red-100 pt-4 mt-2">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Zona Bahaya</h4>
                <button 
                  onClick={handleClearData}
                  className="w-full py-2 text-red-600 text-sm font-semibold hover:bg-red-50 rounded-lg transition text-left px-4 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Hapus Semua Data & Reset
                </button>
              </div>
            </div>
            
            <div className="mt-6 text-[10px] text-slate-400 text-center leading-tight">
              Aplikasi ini bersifat open-source. API Key Anda disimpan terenkripsi di penyimpanan lokal browser (LocalStorage) dan tidak pernah dikirim ke server selain Google AI.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;