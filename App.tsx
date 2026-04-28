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
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId | null>(null);
  const [selectedRhkItem, setSelectedRhkItem] = useState<string>('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  // States for Student Assessment (Hybrid Mode)
  const [studentNames, setStudentNames] = useState<string>('');
  const [kelas, setKelas] = useState<string>('');
  const [prestasiSiswa, setPrestasiSiswa] = useState<string>('');

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
      setIsEditingProfile(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      alert("Gagal menyimpan profil.");
    }
  };

  const handleChangeProfile = () => {
    setIsEditingProfile(true);
    setReportData(null);
    setSelectedCategoryId(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setProfile(null);
      setIsEditingProfile(false);
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
        selectedRhkItem,
        prestasiSiswa
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

      // Update User Statistics
      const today = new Date().toISOString().split('T')[0];
      const currentStats = profile.stats || { totalReports: 0, todayReports: 0, lastReportDate: '' };
      
      const newStats = {
        totalReports: currentStats.totalReports + 1,
        todayReports: currentStats.lastReportDate === today ? currentStats.todayReports + 1 : 1,
        lastReportDate: today
      };

      const updatedProfile = { ...profile, stats: newStats };
      setProfile(updatedProfile);
      
      if (user) {
         setDoc(doc(db, 'users', user.uid), { stats: newStats }, { merge: true }).catch(err => {
            console.error("Gagal menyimpan statistik: ", err);
         });
      }

      const newReport: ReportData = {
        images: selectedImages,
        profile: updatedProfile,
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
    setPrestasiSiswa('');
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
    setPrestasiSiswa('');
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

  if (!profile || isEditingProfile) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 relative">
        <button 
          onClick={handleSignOut}
          className="absolute top-6 right-6 flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span className="text-sm font-medium">Sign Out</span>
        </button>
        {profile && isEditingProfile && (
           <button 
             onClick={() => setIsEditingProfile(false)}
             className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200"
           >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
             <span className="text-sm font-medium">Kembali</span>
           </button>
        )}
        <ProfileForm initialProfile={profile} onSave={handleSaveProfile} />
      </div>
    );
  }

  // NOTE: There is an explicit `handleChangeProfile` which sets `profile` to `null`.
  // We need a specific editing state for the profile, otherwise it assumes no profile exists at all.

  if (!selectedCategoryId) {
    // Helper function to shorten titles for the small grid layout
    const shortenTitle = (title: string) => {
      switch (title) {
          case 'Pelaksanaan Pembelajaran': return 'Pembelajaran';
          case 'Pengembangan Kompetensi': return 'Kompetensi';
          case 'Perangkat Pembelajaran': return 'Perangkat';
          case 'Sekolah Ramah Anak': return 'Ramah Anak';
          case 'Moderasi Beragama': return 'Moderasi';
          case 'Kompetisi / Lomba': return 'Kompetisi';
          case 'Pemetaan Bakat & Minat': return 'Bakat & Minat';
          case 'Manajemen Sekolah': return 'Manajemen';
          case 'Kesehatan Siswa': return 'Kesehatan';
          case 'Inovasi Digital': return 'Inovasi';
          case 'Laporan Kustom': return 'Kustom';
          default: return title;
      }
    };

    return (
      <div className="min-h-screen bg-slate-100 flex justify-center pb-16 sm:pb-0">
        <div className="w-full max-w-[480px] bg-white min-h-screen relative shadow-2xl flex flex-col">
          
          {/* Header Mobile Layout */}
          <div className="px-6 pt-10 pb-4 flex justify-between items-center bg-white z-10 w-full">
            <div className="flex items-center">
               <img 
                 src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Kementerian_Agama_new_logo.png" 
                 alt="Logo" 
                 className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
               />
            </div>
            <div className="flex items-center gap-3 text-right">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800 leading-tight">{profile.nama}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{profile.unitKerja}</span>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-200 flex-shrink-0">
                <img 
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nama)}&background=14b8a6&color=fff&bold=true`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Blue Info Card */}
          <div className="px-6 mb-6 mt-2">
            <div className="bg-[#1e40af] text-white rounded-xl py-4 flex justify-center items-center shadow-md">
               <div className="flex-1 text-center border-r border-blue-400/30">
                 <div className="text-2xl font-bold">{profile.tahunPelaporan || "2026"}</div>
                 <div className="text-[10px] sm:text-xs text-blue-200 mt-1">Tahun Laporan</div>
               </div>
               <div className="flex-1 text-center">
                 <div className="text-2xl font-bold flex items-center justify-center">
                   <span>{profile.stats?.lastReportDate === new Date().toISOString().split('T')[0] ? profile.stats?.todayReports || 0 : 0}</span> 
                   <span className="text-lg font-light text-blue-300 mx-1.5">/</span> 
                   <span>{profile.stats?.totalReports || 0}</span>
                 </div>
                 <div className="text-[10px] sm:text-xs text-blue-200 mt-1">Laporan Hari Ini / Total</div>
               </div>
            </div>
          </div>

          {/* Grid Menu */}
          <div className="flex-1 px-6 pb-24 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="grid grid-cols-3 gap-y-8 gap-x-2">
              {RHK_CATEGORIES.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="flex flex-col items-center group w-full"
                >
                  <div className={`w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] rounded-[1.25rem] flex items-center justify-center mb-2 shadow-sm transition-transform active:scale-90 ${cat.theme.secondary} ${cat.theme.primary}`}>
                    <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={cat.icon} />
                    </svg>
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-slate-700 text-center leading-tight line-clamp-2 px-1">
                    {shortenTitle(cat.title)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed sm:absolute bottom-0 left-0 sm:left-auto w-full sm:max-w-[480px] bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center rounded-t-2xl sm:rounded-none z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button className="flex flex-col items-center gap-1 text-[#1e40af] w-1/4">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              <span className="text-[10px] font-bold">Beranda</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors w-1/4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              <span className="text-[10px] font-medium">Riwayat</span>
            </button>
            <button onClick={handleChangeProfile} className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors w-1/4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <span className="text-[10px] font-medium">Profil</span>
            </button>
            <button onClick={handleSignOut} className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors w-1/4">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
               <span className="text-[10px] font-medium">Keluar</span>
            </button>
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

              {(selectedCategoryId === 'TALENT' || selectedCategoryId === 'COMPETITION') && (
                <div className="pt-2 border-t border-slate-200">
                   <label className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2 block">Siswa Berprestasi (Opsional)</label>
                   <input
                    type="text"
                    value={prestasiSiswa}
                    onChange={(e) => setPrestasiSiswa(e.target.value)}
                    placeholder="Contoh: Juara 1 (Ahmad), Berbakat (Siti)"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-0 outline-none transition-all text-slate-700 bg-white placeholder-slate-400"
                    disabled={isAnalyzing}
                  />
                  <p className="text-xs text-slate-500 mt-1">Sebutkan nama siswa dari daftar di atas yang meraih peringkat/prestasi khusus.</p>
                </div>
              )}
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