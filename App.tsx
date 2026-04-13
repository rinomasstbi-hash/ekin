import React, { useState, useRef, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { Login } from './components/Login';
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

  // Auth & Profile State
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | null>(null);
  const [selectedRhkItem, setSelectedRhkItem] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  // States for Student Assessment (Hybrid Mode)
  const [studentNames, setStudentNames] = useState<string>('');
  const [kelas, setKelas] = useState<string>('');

  const [userNote, setUserNote] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const quarters = [
    { id: 1, label: 'Triwulan I', range: 'Januari - Maret' },
    { id: 2, label: 'Triwulan II', range: 'April - Juni' },
    { id: 3, label: 'Triwulan III', range: 'Juli - September' },
    { id: 4, label: 'Triwulan IV', range: 'Oktober - Desember' }
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsProfileLoading(true);
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as TeacherProfile);
          } else {
            setProfile(null);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        } finally {
          setIsProfileLoading(false);
          setIsAuthReady(true);
        }
      } else {
        setProfile(null);
        setIsAuthReady(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async (newProfile: TeacherProfile) => {
    if (!user) return;
    try {
      const profileData = {
        ...newProfile,
        email: user.email,
        role: 'user'
      };
      await setDoc(doc(db, 'users', user.uid), profileData);
      setProfile(newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      alert("Gagal menyimpan profil.");
    }
  };

  const handleChangeProfile = () => {
    setProfile(null);
    setReportData(null);
    setSelectedCategoryId(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setProfile(null);
      setReportData(null);
      setSelectedCategoryId(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (selectedImages.length + files.length > 5) {
      alert("Maksimal 5 foto yang dapat diupload.");
      return;
    }

    const newImages: string[] = [];
    let hasError = false;

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { 
        hasError = true;
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length - (hasError ? 1 : 0)) {
          setSelectedImages(prev => [...prev, ...newImages]);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    });

    if (hasError) {
      alert("Beberapa file terlalu besar dan diabaikan (Maks 5MB per file).");
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (!EFFECTIVE_API_KEY) {
      setError("Konfigurasi Error: API Key tidak ditemukan. Masukkan API Key Anda.");
      return;
    }
    if (!profile || !selectedCategoryId) return;

    // 1. Validation for Image (Always Required)
    if (selectedImages.length === 0) {
      setError("Mohon upload foto kegiatan terlebih dahulu.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result: AnalysisResult = await analyzeImageWithGemini(
        EFFECTIVE_API_KEY, 
        selectedImages[0],
        selectedCategoryId,
        userNote,
        studentNames,
        kelas,
        selectedRhkItem
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
        images: selectedImages,
        profile: profile,
        periode: `${q?.label} (${q?.range})`, 
        analysis: result,
        tanggalLaporan: `${randomMonth} ${profile.tahunPelaporan || '2026'}`,
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
    setSelectedImages([]);
    setUserNote(''); 
    setStudentNames('');
    setKelas('');
    setSelectedRhkItem('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleBackToMenu = () => {
    setSelectedCategoryId(null);
    setSelectedImages([]);
    setUserNote('');
    setStudentNames('');
    setKelas('');
    setSelectedRhkItem('');
    setError(null);
  };

  if (!isAuthReady || isProfileLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

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
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 relative">
        <button 
          onClick={handleSignOut}
          className="absolute top-6 right-6 flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
        <ProfileForm initialProfile={null} onSave={handleSaveProfile} />
      </div>
    );
  }

  if (!selectedCategoryId) {
    return (
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-900/5 to-transparent pointer-events-none"></div>
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-teal-100 text-teal-700 text-xs font-bold tracking-wider uppercase mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                Sistem Pelaporan RHK
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                Pilih Jenis Laporan
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                Pilih kategori Rencana Hasil Kerja di bawah ini. AI akan membantu Anda menyusun laporan lengkap beserta analisis dan format yang sesuai standar.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center gap-4 bg-white p-2 pr-6 rounded-full shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-teal-300 transition-all group" 
                onClick={handleChangeProfile} 
                title="Edit Profil"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-teal-50 flex items-center justify-center text-slate-600 group-hover:text-teal-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 leading-tight group-hover:text-teal-700 transition-colors">{profile.nama}</span>
                  <span className="text-xs text-slate-500 leading-tight">{profile.unitKerja}</span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                title="Keluar (Sign Out)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              </button>
            </div>
          </header>

          {/* Search Bar */}
          <div className="mb-8 max-w-md relative z-10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-all shadow-sm"
                placeholder="Cari jenis laporan RHK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
            {RHK_CATEGORIES.filter(cat => 
              cat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              cat.description.toLowerCase().includes(searchQuery.toLowerCase())
            ).length > 0 ? (
              RHK_CATEGORIES.filter(cat => 
                cat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                cat.description.toLowerCase().includes(searchQuery.toLowerCase())
              ).map((cat) => (
                <button
                  key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className="group relative bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-900/10 transition-all duration-500 text-left flex flex-col h-full overflow-hidden transform hover:-translate-y-1"
              >
                {/* Subtle background gradient blob on hover */}
                <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-700 ${cat.theme.secondary}`}></div>
                
                <div className="relative z-10 flex-grow">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${cat.theme.secondary} ${cat.theme.primary}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={cat.icon} />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-teal-700 transition-colors">{cat.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm mb-6 line-clamp-3">{cat.description}</p>
                </div>
                
                <div className="relative z-10 mt-auto pt-5 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-slate-400 group-hover:text-teal-600 transition-colors duration-300">
                  <span>Buat Laporan</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </div>
                </div>
              </button>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-[2rem] border border-slate-200 border-dashed">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p>Tidak ada jenis laporan yang cocok dengan pencarian "{searchQuery}".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentCategory = RHK_CATEGORIES.find(c => c.id === selectedCategoryId);
  // Default fallback if not found
  const headerColor = currentCategory?.theme.headerColor || 'bg-teal-700';
  
  // Logic to determine what inputs to show. 
  // Now includes TEACHING, RELIGIOUS_MODERATION, COMPETITION, TALENT, HEALTH, and CUSTOM.
  const isHybridMod = selectedCategoryId === 'RELIGIOUS_MODERATION' || selectedCategoryId === 'TEACHING' || selectedCategoryId === 'COMPETITION' || selectedCategoryId === 'TALENT' || selectedCategoryId === 'HEALTH' || selectedCategoryId === 'CUSTOM';

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

          {/* --- IMAGE UPLOAD SECTION (Required for All) --- */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Upload Foto / Sertifikat (Maks 5)
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              ))}
              
              {selectedImages.length < 5 && (
                <div 
                  onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                  className={`
                    relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 aspect-square flex flex-col items-center justify-center text-center p-2
                    border-slate-300 hover:border-current hover:bg-slate-50
                    ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
                    ${currentCategory?.theme.accent || 'text-teal-600'}
                  `}
                >
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  <span className="text-[10px] font-medium text-slate-500">Tambah Foto</span>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept="image/*" 
              multiple
              className="hidden" 
              disabled={isAnalyzing}
            />
          </div>

          {/* --- STUDENT INPUT SECTION (Religious Moderation & Character Education & Competition & Custom) --- */}
          {isHybridMod && (
            <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
               <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>Opsional: Isi data {selectedCategoryId === 'COMPETITION' || selectedCategoryId === 'CUSTOM' ? 'peserta' : 'siswa'} untuk generate tabel {selectedCategoryId === 'COMPETITION' ? 'prestasi/partisipasi' : selectedCategoryId === 'CUSTOM' ? 'keterlibatan/penilaian' : 'penilaian'}.</span>
               </div>
              <div>
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 block">
                  Daftar Nama {selectedCategoryId === 'COMPETITION' || selectedCategoryId === 'CUSTOM' ? 'Peserta' : 'Siswa'} (Opsional)
                </label>
                <textarea
                  value={studentNames}
                  onChange={(e) => setStudentNames(e.target.value)}
                  placeholder="Paste nama dari Excel disini...&#10;Contoh:&#10;Ahmad Dahlan&#10;Siti Walidah"
                  className="w-full h-32 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-0 outline-none transition-all text-slate-700 bg-white placeholder-slate-400 text-sm"
                  disabled={isAnalyzing}
                />
              </div>
              <div>
                 <label className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 block">Kelas / Rombel (Opsional)</label>
                 <input
                  type="text"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="Contoh: VII A"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-0 outline-none transition-all text-slate-700 bg-white placeholder-slate-400"
                  disabled={isAnalyzing}
                />
              </div>
            </div>
          )}

          {/* --- USER NOTE SECTION --- */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
              Keterangan / Judul Spesifik (Opsional)
            </label>
            <input
              type="text"
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Contoh: Kegiatan Diskusi Kelompok"
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-current focus:ring-0 outline-none transition-all text-slate-700 bg-slate-50 placeholder-slate-400"
              style={{ color: 'inherit' }}
              disabled={isAnalyzing}
            />
            <p className="text-xs text-slate-400">
              Bantu AI mengenali kegiatan dengan memberikan judul atau deskripsi singkat.
            </p>
          </div>

          {/* --- RHK SELECTION SECTION --- */}
          {currentCategory && currentCategory.rhkList.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                Pilih Target RHK (Opsional)
              </label>
              <select
                value={selectedRhkItem}
                onChange={(e) => setSelectedRhkItem(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-current focus:ring-0 outline-none transition-all text-slate-700 bg-slate-50"
                style={{ color: 'inherit' }}
                disabled={isAnalyzing}
              >
                <option value="">-- Biarkan AI Memilih Otomatis --</option>
                {currentCategory.rhkList.map((rhk, idx) => (
                  <option key={idx} value={rhk}>{rhk}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400">
                Pilih spesifik RHK yang ingin dituju agar laporan lebih akurat.
              </p>
            </div>
          )}

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
            disabled={isAnalyzing}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]
              ${isAnalyzing 
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