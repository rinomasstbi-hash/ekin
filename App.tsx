import React, { useState, useRef } from 'react';
import { ProfileForm } from './components/ProfileForm';
import { ReportView } from './components/ReportView';
import { TeacherProfile, AnalysisResult, ReportData } from './types';
import { analyzeImageWithGemini } from './services/geminiService';

const App: React.FC = () => {
  // --- ENVIRONMENT VARIABLE HANDLING ---
  // LOGIKA PENTING: Vite (npm build) secara default HANYA mengizinkan variable yang diawali "VITE_"
  // untuk keamanan client-side.
  const API_KEY = (() => {
    try {
      // 1. Cek import.meta.env (Cara Modern/Vite)
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
        // @ts-ignore
        if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
      }
      
      // 2. Cek process.env (Fallback untuk setup lama/CRA)
      // Kita harus berhati-hati mengakses process di browser modern
      if (typeof process !== 'undefined' && process.env) {
        return process.env.REACT_APP_API_KEY || process.env.VITE_API_KEY || process.env.API_KEY;
      }
    } catch (e) {
      console.warn("Gagal membaca environment variables:", e);
    }
    return '';
  })();

  // --- STATE MANAGEMENT ---
  const [profile, setProfile] = useState<TeacherProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('rhk_profile');
      return savedProfile ? JSON.parse(savedProfile) : null;
    }
    return null;
  });

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

  const handleChangeProfile = () => {
    if (confirm("Apakah Anda ingin mengubah data profil guru?")) {
      setProfile(null);
      setReportData(null);
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
    // Double check saat runtime
    if (!API_KEY) {
      setError("Konfigurasi Error: API Key tidak ditemukan. Cek pengaturan Netlify.");
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
      const result: AnalysisResult = await analyzeImageWithGemini(API_KEY, selectedImage);
      
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

  // 0. VIEW: MISSING CONFIGURATION (BLOCKER)
  // Ini akan muncul jika API Key benar-benar kosong (biasanya karena masalah prefix VITE_)
  if (!API_KEY) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border-l-8 border-yellow-500">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800">Setup Diperlukan</h1>
          </div>
          
          <p className="text-slate-600 mb-4 leading-relaxed">
            Aplikasi berhasil di-deploy, tetapi <strong>API Key</strong> tidak terbaca oleh browser.
          </p>
          
          <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-sm text-slate-700 mb-6">
            <p className="font-bold mb-2 text-slate-900">Penyebab Umum (Netlify + Vite):</p>
            <p className="mb-2">
              Sistem build (Vite) secara otomatis memblokir environment variables yang tidak diawali dengan <code className="text-pink-600 font-mono">VITE_</code>.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <h3 className="font-bold text-sm uppercase tracking-wide text-slate-500">Solusi:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-800">
              <li>Buka Dashboard Netlify &gt; <strong>Site settings</strong>.</li>
              <li>Masuk ke <strong>Environment variables</strong>.</li>
              <li>
                Edit variable <code className="bg-gray-200 px-1 rounded">API_KEY</code> Anda, dan ubah namanya (Key) menjadi:
                <div className="mt-1 bg-slate-800 text-white p-2 rounded font-mono text-center font-bold select-all">
                  VITE_API_KEY
                </div>
              </li>
              <li>Klik <strong>Save</strong>.</li>
              <li>Pergi ke tab <strong>Deploys</strong> &gt; <strong>Trigger deploy</strong> (Redeploy site).</li>
            </ol>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition shadow-lg shadow-teal-700/20"
          >
            Refresh Halaman (Setelah Redeploy)
          </button>
        </div>
      </div>
    );
  }

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
        
        <div className="mt-8 text-center opacity-60">
          <p className="text-xs text-slate-400">
            System Ready &bull; Gemini AI Connected
          </p>
        </div>
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
            onClick={handleChangeProfile}
            className="px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition backdrop-blur-sm text-xs font-semibold flex items-center gap-1"
            title="Ganti Profil Guru"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Ganti Profil
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

        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
            Privacy First &bull; Local Processing
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;