import React, { useState, useRef } from 'react';
import { ProfileForm } from './components/ProfileForm';
import { ReportView } from './components/ReportView';
import { TeacherProfile, AnalysisResult, ReportData, CategoryId } from './types';
import { RHK_CATEGORIES } from './constants';
import { analyzeImageWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const API_KEY = (() => {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
        // @ts-ignore
        if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
      }
      if (typeof process !== 'undefined' && process.env) {
        return process.env.REACT_APP_API_KEY || process.env.VITE_API_KEY || process.env.API_KEY;
      }
    } catch (e) {
      console.warn("Env error:", e);
    }
    return '';
  })();

  const [profile, setProfile] = useState<TeacherProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('rhk_profile');
      return savedProfile ? JSON.parse(savedProfile) : null;
    }
    return null;
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  
  const quarters = [
    { id: 1, label: 'Triwulan I', range: 'Januari - Maret' },
    { id: 2, label: 'Triwulan II', range: 'April - Juni' },
    { id: 3, label: 'Triwulan III', range: 'Juli - September' },
    { id: 4, label: 'Triwulan IV', range: 'Oktober - Desember' }
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = (newProfile: TeacherProfile) => {
    setProfile(newProfile);
    localStorage.setItem('rhk_profile', JSON.stringify(newProfile));
  };

  const handleChangeProfile = () => {
    if (confirm("Ubah data profil guru?")) {
      setProfile(null);
      setReportData(null);
      setSelectedCategoryId(null);
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
    if (!API_KEY) {
      setError("Konfigurasi Error: API Key tidak ditemukan.");
      return;
    }
    if (!selectedImage || !selectedCategoryId) return;
    if (!profile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result: AnalysisResult = await analyzeImageWithGemini(API_KEY, selectedImage, selectedCategoryId);
      const categoryConfig = RHK_CATEGORIES.find(c => c.id === selectedCategoryId);
      
      const q = quarters.find(item => item.id === selectedQuarter);
      // const year = new Date().getFullYear(); // Unused if we hardcode 2025
      
      // Map quarter to the last month of that quarter for the signature date
      const monthMap: Record<number, string> = {
        1: 'Maret',
        2: 'Juni',
        3: 'September',
        4: 'Desember'
      };

      // Generate random border index (0 to 4)
      const randomBorderIndex = Math.floor(Math.random() * 5);

      const newReport: ReportData = {
        image: selectedImage,
        profile: profile,
        periode: `${q?.label} (${q?.range})`, 
        analysis: result,
        tanggalLaporan: `${monthMap[selectedQuarter]} 2025`,
        categoryLabel: categoryConfig ? categoryConfig.coverTitle : 'Laporan Kinerja',
        categoryId: selectedCategoryId,
        coverBorderIndex: randomBorderIndex
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

  const handleBackToMenu = () => {
    setSelectedCategoryId(null);
    setSelectedImage(null);
    setError(null);
  };

  if (!API_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 max-w-md">
           <h2 className="text-xl font-bold mb-2">API Key Required</h2>
           <p className="text-slate-600 mb-4">Harap konfigurasi VITE_API_KEY di Netlify Environment Variables.</p>
           <button onClick={() => window.location.reload()} className="bg-teal-600 text-white px-4 py-2 rounded">Refresh</button>
        </div>
      </div>
    );
  }

  if (reportData) {
    return <ReportView data={reportData} onReset={resetAll} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <ProfileForm initialProfile={null} onSave={handleSaveProfile} />
      </div>
    );
  }

  if (!selectedCategoryId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-6 sm:pt-10 pb-6 px-4">
        <div className="w-full max-w-4xl">
           <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Pilih Jenis Laporan</h1>
                <p className="text-slate-500">Silakan pilih kategori Rencana Hasil Kerja (RHK) yang akan dibuat.</p>
              </div>
              <button onClick={handleChangeProfile} className="text-sm text-teal-600 hover:underline font-semibold">
                Profil: {profile.nama}
              </button>
           </header>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {RHK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.02] border border-transparent hover:border-teal-500 transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cat.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{cat.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{cat.description}</p>
                </button>
              ))}
           </div>
        </div>
      </div>
    );
  }

  const currentCategory = RHK_CATEGORIES.find(c => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-6 sm:pt-10 pb-6 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden relative">
        
        <header className="bg-teal-700 p-6 text-white">
          <button 
            onClick={handleBackToMenu}
            className="flex items-center gap-1 text-teal-100 text-sm mb-4 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Kembali ke Menu
          </button>
          <div className="flex items-start gap-4">
             <div className="p-3 bg-white/10 rounded-xl">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={currentCategory?.icon || ''} />
               </svg>
             </div>
             <div>
               <h1 className="text-xl font-bold">{currentCategory?.title}</h1>
               <p className="text-teal-100 text-xs mt-1 opacity-90">{profile.nama}</p>
             </div>
          </div>
        </header>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Pilih Periode Triwulan</label>
            <div className="grid grid-cols-2 gap-2">
              {quarters.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuarter(q.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedQuarter === q.id 
                    ? 'border-teal-600 bg-teal-50 text-teal-800' 
                    : 'border-slate-100 hover:border-teal-200 text-slate-600'
                  }`}
                >
                  <div className="text-sm font-bold">{q.label}</div>
                  <div className="text-[10px] opacity-70">{q.range}</div>
                </button>
              ))}
            </div>
          </div>

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
                <p className="text-sm text-slate-400">Ambil foto kegiatan sesuai kategori</p>
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

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>{error}</span>
            </div>
          )}

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
      </div>
    </div>
  );
};

export default App;