import React, { useState, useRef } from 'react';
import { ProfileForm } from './components/ProfileForm';
import { ReportView } from './components/ReportView';
import { TeacherProfile, AnalysisResult, ReportData, CategoryId } from './types';
import { RHK_CATEGORIES } from './constants';
import { analyzeImageWithGemini } from './services/geminiService';

const App: React.FC = () => {
  // 1. Get Environment Key
  const ENV_API_KEY = (() => {
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

  // 2. State for Custom User Key
  const [customApiKey, setCustomApiKey] = useState<string>('');

  // 3. Determine Effective Key (User Input > Env Var)
  const EFFECTIVE_API_KEY = customApiKey || ENV_API_KEY;

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
  
  // States for Student Assessment
  const [studentNames, setStudentNames] = useState<string>('');
  const [kelas, setKelas] = useState<string>('');

  const [userNote, setUserNote] = useState<string>('');
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
    if (!EFFECTIVE_API_KEY) {
      setError("Konfigurasi Error: API Key tidak ditemukan. Masukkan API Key Anda.");
      return;
    }
    if (!profile || !selectedCategoryId) return;

    // Validation
    if (selectedCategoryId === 'STUDENT_ASSESSMENT') {
      if (!studentNames.trim()) {
        setError("Mohon isi daftar nama siswa.");
        return;
      }
    } else {
      if (!selectedImage) return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result: AnalysisResult = await analyzeImageWithGemini(
        EFFECTIVE_API_KEY, 
        selectedImage, // Can be null for assessment
        selectedCategoryId,
        userNote,
        studentNames,
        kelas
      );
      const categoryConfig = RHK_CATEGORIES.find(c => c.id === selectedCategoryId);
      
      const q = quarters.find(item => item.id === selectedQuarter);
      
      // Map quarter to the list of months in that quarter
      const quarterMonthsMap: Record<number, string[]> = {
        1: ['Januari', 'Februari', 'Maret'],
        2: ['April', 'Mei', 'Juni'],
        3: ['Juli', 'Agustus', 'September'],
        4: ['Oktober', 'November', 'Desember']
      };

      // Get possible months for the selected quarter and pick one randomly
      const possibleMonths = quarterMonthsMap[selectedQuarter];
      const randomMonth = possibleMonths[Math.floor(Math.random() * possibleMonths.length)];

      // Generate random border index (0 to 4)
      const randomBorderIndex = Math.floor(Math.random() * 5);

      const newReport: ReportData = {
        image: selectedImage,
        profile: profile,
        periode: `${q?.label} (${q?.range})`, 
        analysis: result,
        tanggalLaporan: `${randomMonth} 2025`,
        categoryLabel: categoryConfig ? categoryConfig.coverTitle : 'Laporan Kinerja',
        categoryId: selectedCategoryId,
        coverBorderIndex: randomBorderIndex
      };
      
      setReportData(newReport);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses data.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    setReportData(null);
    setSelectedImage(null);
    setUserNote(''); 
    setStudentNames('');
    setKelas('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBackToMenu = () => {
    setSelectedCategoryId(null);
    setSelectedImage(null);
    setUserNote('');
    setStudentNames('');
    setKelas('');
    setError(null);
  };

  // Logic: Show setup screen ONLY if neither Env Key nor Custom Key is present AND user hasn't tried to input one yet.
  if (!EFFECTIVE_API_KEY && !error && !ENV_API_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500 max-w-md w-full">
           <h2 className="text-xl font-bold mb-2">API Key Diperlukan</h2>
           <p className="text-slate-600 mb-4 text-sm">Aplikasi ini memerlukan Google Gemini API Key. Anda dapat menggunakan API Key gratis Anda sendiri.</p>
           <input 
              type="password" 
              placeholder="Tempel API Key disini..."
              className="w-full px-4 py-2 border border-slate-300 rounded mb-4"
              onChange={(e) => setCustomApiKey(e.target.value)}
           />
           <p className="text-xs text-slate-500 mb-4">
             Dapatkan key di <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-600 underline">Google AI Studio</a>.
           </p>
           <button 
            disabled={!customApiKey}
            onClick={() => {}} 
            className="w-full bg-teal-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-teal-700 transition"
           >
             Mulai Aplikasi
           </button>
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

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {RHK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`
                    relative overflow-hidden p-6 rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.02] border transition-all text-left group
                    ${cat.theme.bgGradient} border-slate-100 hover:border-transparent
                  `}
                >
                  {/* Background Shape Pattern */}
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 opacity-10 pointer-events-none transform rotate-12 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">
                     <svg viewBox="0 0 24 24" fill="currentColor" className={cat.theme.primary}>
                        <path d={cat.theme.patternPath} />
                     </svg>
                  </div>

                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors z-10 relative
                    ${cat.theme.secondary} ${cat.theme.primary} group-hover:bg-white
                  `}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={cat.icon} />
                    </svg>
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className={`text-lg font-bold mb-1 ${cat.theme.primary}`}>{cat.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed opacity-90 line-clamp-2">{cat.description}</p>
                  </div>
                </button>
              ))}
           </div>
        </div>
      </div>
    );
  }

  const currentCategory = RHK_CATEGORIES.find(c => c.id === selectedCategoryId);
  // Default fallback if not found
  const headerColor = currentCategory?.theme.headerColor || 'bg-teal-700';
  const isAssessment = selectedCategoryId === 'STUDENT_ASSESSMENT';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-6 sm:pt-10 pb-6 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden relative">
        
        <header className={`${headerColor} p-6 text-white transition-colors duration-300 relative overflow-hidden`}>
          {/* Decorative Pattern in Header */}
          <div className="absolute -right-6 -top-6 w-32 h-32 opacity-20 pointer-events-none">
             <svg viewBox="0 0 24 24" fill="currentColor">
                <path d={currentCategory?.theme.patternPath || ''} />
             </svg>
          </div>

          <button 
            onClick={handleBackToMenu}
            className="flex items-center gap-1 text-white/80 text-sm mb-4 hover:text-white transition relative z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Kembali ke Menu
          </button>
          <div className="flex items-start gap-4 relative z-10">
             <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
               <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={currentCategory?.icon || ''} />
               </svg>
             </div>
             <div>
               <h1 className="text-xl font-bold">{currentCategory?.title}</h1>
               <p className="text-white/80 text-xs mt-1">{profile.nama}</p>
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
                    ? `border-${currentCategory?.theme.primary.split('-')[1] || 'teal'}-600 bg-white text-${currentCategory?.theme.primary.split('-')[1] || 'teal'}-800 shadow-sm`
                    : 'border-slate-100 hover:border-slate-300 text-slate-600'
                  }`}
                  style={selectedQuarter === q.id ? { borderColor: 'currentColor' } : {}}
                >
                  <div className="text-sm font-bold">{q.label}</div>
                  <div className="text-[10px] opacity-70">{q.range}</div>
                </button>
              ))}
            </div>
          </div>

          {isAssessment ? (
            // --- UI FOR STUDENT ASSESSMENT (TEXT INPUT) ---
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 block">Daftar Nama Siswa</label>
                <textarea
                  value={studentNames}
                  onChange={(e) => setStudentNames(e.target.value)}
                  placeholder="Paste nama siswa dari Excel disini...&#10;Contoh:&#10;Ahmad Dahlan&#10;Siti Walidah&#10;Ki Hajar Dewantara"
                  className="w-full h-40 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-0 outline-none transition-all text-slate-700 bg-slate-50 placeholder-slate-400 text-sm"
                  disabled={isAnalyzing}
                />
              </div>
              <div>
                 <label className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 block">Kelas / Rombel</label>
                 <input
                  type="text"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="Contoh: VII A / X IPA 2"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-0 outline-none transition-all text-slate-700 bg-slate-50 placeholder-slate-400"
                  disabled={isAnalyzing}
                />
              </div>
            </div>
          ) : (
            // --- UI FOR IMAGE UPLOAD (STANDARD) ---
            <div 
              onClick={() => !isAnalyzing && fileInputRef.current?.click()}
              className={`
                relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden aspect-video flex flex-col items-center justify-center text-center p-6
                ${selectedImage ? 'border-transparent bg-slate-50' : 'border-slate-300 hover:border-current hover:bg-slate-50'}
                ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
                ${currentCategory?.theme.accent || 'text-teal-600'}
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
                  <div className={`p-4 rounded-full mb-3 group-hover:scale-110 transition-transform ${currentCategory?.theme.secondary || 'bg-teal-50'}`}>
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
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              {isAssessment ? 'Materi / Bab Pembelajaran (Opsional)' : 'Keterangan / Judul Spesifik (Opsional)'}
            </label>
            <input
              type="text"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder={isAssessment ? "Contoh: Toleransi Antar Umat Beragama" : "Contoh: Upacara Bendera, Rapat Dinas..."}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-current focus:ring-0 outline-none transition-all text-slate-700 bg-slate-50 placeholder-slate-400"
              style={{ color: 'inherit' }}
              disabled={isAnalyzing}
            />
            <p className="text-xs text-slate-400">
              {isAssessment ? 'AI akan memilih prinsip moderasi yang relevan dengan materi ini.' : 'Bantu AI mengenali kegiatan dengan memberikan judul atau deskripsi singkat.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-sm flex flex-col gap-3 animate-fade-in">
              <div className="flex items-start gap-3 text-red-600">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{error}</span>
              </div>
              
              <div className="bg-white/60 p-3 rounded-lg border border-red-200 mt-1">
                <label className="block text-xs font-bold text-red-800 mb-1 uppercase tracking-wider">
                  Gunakan API Key Pribadi (Sementara)
                </label>
                <div className="flex gap-2">
                  <input 
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="Paste Gemini API Key disini..."
                    className="flex-1 text-sm px-3 py-2 border border-red-200 rounded focus:border-red-500 outline-none"
                  />
                </div>
                <p className="text-[10px] text-red-500 mt-2">
                   Jika limit aplikasi habis, Anda dapat menggunakan Free API Key milik sendiri. <a href="https://aistudio.google.com/app/apikey" target="_blank" className="underline font-bold hover:text-red-700">Buat Key Disini</a>.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={(!selectedImage && !isAssessment) || (isAssessment && !studentNames) || isAnalyzing}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]
              ${(!selectedImage && !isAssessment) || (isAssessment && !studentNames) || isAnalyzing 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : `${headerColor} text-white hover:brightness-110 shadow-teal-900/10`
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
                {customApiKey ? 'Coba Lagi dengan Key Baru' : 'Proses Data AI'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;