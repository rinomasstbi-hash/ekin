import React, { useEffect } from 'react';
import { ReportData } from '../types';
import { RHK_CATEGORIES } from '../constants';

interface Props {
  data: ReportData;
  onReset: () => void;
}

export const ReportView: React.FC<Props> = ({ data, onReset }) => {
  const { profile, analysis, images, periode, tanggalLaporan, categoryLabel, categoryId, coverBorderIndex } = data;

  // --- GET THEME CONFIG ---
  const categoryConfig = RHK_CATEGORIES.find(c => c.id === categoryId);
  const theme = categoryConfig?.theme;
  const colorName = theme ? theme.primary.split('-')[1] : 'gray';

  // --- BORDER STYLES CONFIGURATION ---
  const BORDER_STYLES = [
    "border-4 border-double border-gray-800", // 0: Classic Double (Original)
    "border-[6px] border-solid border-gray-900", // 1: Bold Solid
    "border-y-[8px] border-x-[2px] border-gray-800", // 2: Art Deco Vertical
    "border-4 border-solid border-gray-600 outline outline-offset-4 outline-2 outline-gray-400", // 3: Frame Ring
    "border-[3px] border-dashed border-gray-500 outline outline-4 outline-gray-800", // 4: Technical
  ];

  // Fallback to 0 if index is missing
  let activeBorderStyle = BORDER_STYLES[coverBorderIndex || 0];
  
  // Apply theme color to border if theme exists (replace gray-800/900/600 with theme color)
  if (theme) {
    activeBorderStyle = activeBorderStyle
      .replace(/gray-800/g, `${colorName}-800`)
      .replace(/gray-900/g, `${colorName}-900`)
      .replace(/gray-600/g, `${colorName}-600`)
      .replace(/gray-500/g, `${colorName}-500`)
      .replace(/gray-400/g, `${colorName}-400`);
  }

  // --- EFFECT: SET PDF FILENAME ---
  useEffect(() => {
    // Simpan judul asli aplikasi
    const originalTitle = document.title;

    // Cari judul kategori pendek (bukan coverTitle) untuk nama file
    const categoryTitle = categoryConfig ? categoryConfig.title : 'Kinerja Guru';
    
    // Set judul baru. Ini akan menjadi nama file default saat Save as PDF.
    // Format: Laporan - [Kategori RHK] - [Periode]
    document.title = `Laporan - ${categoryTitle} - ${periode}`;

    // Kembalikan ke judul asli saat keluar dari halaman laporan
    return () => {
      document.title = originalTitle;
    };
  }, [categoryId, periode, categoryConfig]);

  // --- SIGNATURE ROLES DYNAMICS ---
  const getSignatureRoles = () => {
    switch (categoryId) {
      case 'DIGITAL': return { left: "Mengetahui,\nKepala Madrasah", right: "Guru Pengampu Digital" };
      case 'COMPETITION': return { left: "Mengetahui,\nKepala Madrasah", right: "Guru Pembimbing" };
      case 'MANAGEMENT': return { left: "Mengetahui,\nKepala Madrasah", right: "Penyusun Laporan" };
      case 'HEALTH': return { left: "Kepala Madrasah", right: "Pembina UKS / Wali Kelas" };
      case 'CHILD_FRIENDLY': return { left: "Mengetahui,\nKepala Madrasah", right: "Guru BK / Pendamping" };
      case 'TALENT': return { left: "Mengetahui,\nKepala Madrasah", right: "Guru Pembimbing Bakat" };
      default: return { left: "Mengetahui,\nKepala Madrasah", right: "Guru Penyusun" };
    }
  };
  const signatures = getSignatureRoles();

  // --- DYNAMIC COVER COMPONENTS ---
  const renderCoverContent = () => {
    const rhkMatch = analysis.judul_terpilih.match(/\[(RHK \d+)\]/);
    const rhkBadge = rhkMatch ? rhkMatch[1] : null;
    const cleanTitle = analysis.judul_terpilih.replace(/\[RHK \d+\]\s*/, '');

    const isModern = ['DIGITAL', 'MANAGEMENT', 'LEARNING_DEVICE'].includes(categoryId || '');
    const isElegant = ['COMPETITION', 'TALENT'].includes(categoryId || '');
    const isMinimal = ['CHILD_FRIENDLY', 'HEALTH'].includes(categoryId || '');

    if (isModern) {
      // MODERN: Left-aligned, thick accent line, clean typography
      return (
        <div className={`flex-1 flex flex-col justify-center text-left pl-10 border-l-[12px] bg-white/70 backdrop-blur-sm print:bg-transparent ${theme ? `border-${colorName}-600` : 'border-gray-800'}`}>
          <div className="mb-auto mt-8 flex items-center justify-between">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Kementerian_Agama_new_logo.png" 
              alt="Logo Kementerian Agama" 
              className="w-24 h-auto object-contain"
            />
            <div className={`text-right ${theme ? `text-${colorName}-600` : 'text-gray-500'}`}>
              <p className="font-bold tracking-widest uppercase text-sm">Tahun Pelaporan</p>
              <p className="text-2xl font-bold">{periode}</p>
            </div>
          </div>
          
          <div className="my-16">
            <h1 className={`text-3xl font-sans font-black tracking-tight uppercase mb-4 leading-tight ${theme?.primary || 'text-slate-900'}`}>
              {categoryLabel || "Laporan Kinerja"}
            </h1>
            {rhkBadge && <span className={`inline-block px-3 py-1 mb-4 rounded-md text-sm font-bold tracking-widest ${theme ? `bg-${colorName}-100 text-${colorName}-700` : 'bg-gray-100 text-gray-700'}`}>{rhkBadge}</span>}
            <h2 className={`text-2xl font-serif font-bold ${theme ? `text-slate-700` : 'text-gray-700'}`}>
              {cleanTitle}
            </h2>
          </div>

          <div className="mt-auto mb-8">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Disusun Oleh:</p>
            <h3 className={`text-2xl font-bold ${theme ? `text-${colorName}-900` : 'text-slate-900'}`}>
              {profile.nama}
            </h3>
            <p className="text-md mt-1 font-mono text-slate-600">{profile.nip ? `NIP. ${profile.nip}` : '-'}</p>
            <div className={`mt-6 pt-6 border-t-2 w-2/3 ${theme ? `border-${colorName}-200` : 'border-gray-200'}`}>
              <h4 className="text-lg font-bold uppercase text-slate-800">{profile.unitKerja}</h4>
              <p className="text-sm font-medium text-slate-500 uppercase">{profile.kota}</p>
            </div>
          </div>
        </div>
      );
    }

    if (isElegant) {
      // ELEGANT: Certificate-like, centered, decorative borders
      return (
         <div className={`flex-1 flex flex-col items-center justify-between text-center p-10 border-[16px] border-double bg-white/80 backdrop-blur-md print:bg-transparent ${theme ? `border-${colorName}-700` : 'border-gray-800'}`}>
          <div className="mt-8 flex flex-col items-center">
             <img 
              src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Kementerian_Agama_new_logo.png" 
              alt="Logo Kementerian Agama" 
              className="w-28 h-auto mb-8 object-contain"
            />
            <h1 className={`text-sm font-sans font-bold tracking-[0.3em] uppercase mb-12 ${theme ? `text-${colorName}-600` : 'text-gray-500'}`}>
              Dokumen Prestasi & Bakat
            </h1>
            <h2 className={`text-4xl font-serif font-bold uppercase mb-6 leading-snug px-4 ${theme?.primary || 'text-slate-900'}`}>
              {categoryLabel || "Laporan Kinerja"}
            </h2>
            <div className={`w-24 h-1 mx-auto mb-6 ${theme ? `bg-${colorName}-500` : 'bg-gray-800'}`}></div>
            <h3 className={`text-xl font-serif italic px-8 ${theme ? `text-slate-700` : 'text-gray-700'}`}>
              "{cleanTitle}"
            </h3>
            {rhkBadge && <span className={`block mt-6 text-sm font-bold tracking-widest ${theme ? `text-${colorName}-400` : 'text-gray-400'}`}>{rhkBadge}</span>}
          </div>

          <div className="mb-12 flex flex-col items-center w-full">
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Guru Pembimbing / Pendamping</p>
            <h3 className={`text-2xl font-bold uppercase tracking-wide ${theme ? `text-${colorName}-900` : 'text-slate-900'}`}>
              {profile.nama}
            </h3>
            <p className="text-sm mt-2 mb-6 font-mono font-medium text-slate-600">{profile.nip ? `NIP. ${profile.nip}` : '-'}</p>
            
            <p className="text-md uppercase font-bold text-slate-800">{profile.unitKerja}</p>
            <p className={`text-sm uppercase tracking-widest mt-1 ${theme ? `text-${colorName}-700` : 'text-gray-600'}`}>{profile.kota} - {periode}</p>
          </div>
        </div>
      );
    }

    if (isMinimal) {
      // MINIMAL: Soft, rounded, floating card effect inside the cover
      return (
        <div className={`flex-1 flex flex-col items-center justify-center text-center p-8 m-4 rounded-[3rem] bg-white/90 backdrop-blur-md shadow-xl print:shadow-none print:bg-transparent print:border print:border-gray-200`}>
          <div className="my-auto flex flex-col items-center">
            <div className={`p-6 rounded-full mb-8 ${theme ? `bg-${colorName}-50` : 'bg-gray-50'}`}>
               <img 
                src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Kementerian_Agama_new_logo.png" 
                alt="Logo Kementerian Agama" 
                className="w-24 h-auto object-contain"
              />
            </div>
            
            <h1 className={`text-2xl font-bold tracking-wider uppercase mb-3 ${theme?.primary || 'text-slate-900'}`}>
              {categoryLabel || "Laporan Kinerja"}
            </h1>
            {rhkBadge && <span className={`block text-xs mb-3 font-bold tracking-widest ${theme ? `text-${colorName}-400` : 'text-gray-400'}`}>{rhkBadge}</span>}
            <h2 className={`text-2xl font-medium px-4 mb-8 ${theme ? `text-slate-700` : 'text-gray-700'}`}>
              {cleanTitle}
            </h2>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase ${theme ? `bg-${colorName}-100 text-${colorName}-700` : 'bg-gray-100 text-gray-700'}`}>
              {periode}
            </div>
          </div>

          <div className="mt-auto w-full pt-8 flex flex-col items-center">
            <h3 className="text-xl font-bold text-slate-800 mb-1">
              {profile.nama}
            </h3>
            <p className="text-sm font-mono text-slate-500 mb-6">{profile.nip ? `NIP. ${profile.nip}` : '-'}</p>
            <div className="flex flex-col items-center space-y-1">
              <span className="font-bold uppercase text-slate-700">{profile.unitKerja}</span>
              <span className="text-sm text-slate-500">{profile.kota}</span>
            </div>
          </div>
        </div>
      );
    }

    // DEFAULT / CLASSIC
    return (
      <div className={`flex-1 flex flex-col items-center justify-between text-center p-8 ${activeBorderStyle} relative z-10 bg-white/60 backdrop-blur-sm print:bg-transparent`}>
        <div className="mt-10">
          <h1 className={`text-2xl font-serif font-bold tracking-widest uppercase mb-4 leading-relaxed px-4 whitespace-pre-line ${theme?.primary || 'text-slate-900'}`}>
            {categoryLabel || "Laporan Kinerja Guru"}
          </h1>
          <h2 className={`text-xl font-serif font-bold uppercase px-4 mt-6 ${theme ? `text-${colorName}-700` : 'text-gray-700'}`}>
            {rhkBadge && <span className={`block text-sm mb-2 font-sans tracking-widest ${theme ? `text-${colorName}-500` : 'text-gray-500'}`}>{rhkBadge}</span>}
            {cleanTitle}
          </h2>
        </div>

        <div className="my-8 flex flex-col items-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Kementerian_Agama_new_logo.png" 
            alt="Logo Kementerian Agama" 
            className="w-32 h-auto mb-6 object-contain"
          />
          <p className={`text-lg font-semibold uppercase tracking-wider ${theme ? `text-${colorName}-600` : 'text-gray-600'}`}>
            Periode: {periode}
          </p>
        </div>

        <div className="mb-10 w-full">
          <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">Disusun Oleh:</p>
          <h3 className={`text-xl font-bold border-b-2 pb-2 inline-block min-w-[50%] ${theme ? `text-slate-900 border-${colorName}-800` : 'text-slate-900 border-gray-800'}`}>
            {profile.nama}
          </h3>
          <p className="text-lg mt-2 font-mono">{profile.nip ? `NIP. ${profile.nip}` : '-'}</p>
        </div>

        <div className="w-full mb-4">
          <h4 className="text-xl font-bold uppercase">{profile.unitKerja}</h4>
          <p className={`text-md uppercase ${theme ? `text-${colorName}-700` : 'text-gray-600'}`}>{profile.kota}</p>
          <p className="text-sm text-gray-500 mt-2">2026</p>
        </div>
      </div>
    );
  };

  // Function to render content dynamically based on sections
  const renderDynamicContent = () => {
    return (
      <div className="flex-1 flex flex-col gap-6">
        {analysis.sections.map((section, index) => (
          <div key={index} className="break-inside-avoid-page">
            {/* Styling title differently based on category for visual flair */}
            <h3 className={`font-bold text-lg mb-2 pb-1 
              ${categoryId === 'DIGITAL' ? 'text-blue-900 border-b border-blue-200' : 
                categoryId === 'CHILD_FRIENDLY' ? 'text-teal-800' :
                categoryId === 'RELIGIOUS_MODERATION' ? 'uppercase text-green-800 tracking-wide border-b-2 border-green-600 inline-block' :
                categoryId === 'TEACHING' ? 'text-cyan-800 border-b border-cyan-200' :
                categoryId === 'COMPETITION' ? 'text-violet-900 border-b border-violet-200 uppercase tracking-tight' :
                categoryId === 'COMPETENCY' ? 'text-blue-900 border-b border-blue-200' :
                categoryId === 'LEARNING_DEVICE' ? 'text-orange-900 border-b border-orange-200' :
                categoryId === 'TALENT' ? 'text-fuchsia-900 border-b border-fuchsia-200' :
                categoryId === 'MANAGEMENT' ? 'text-slate-900 border-b border-slate-200' :
                categoryId === 'HEALTH' ? 'text-pink-900 border-b border-pink-200' :
                categoryId === 'CUSTOM' ? 'text-amber-900 border-b border-amber-200' :
                'text-gray-900 border-b border-gray-300'
              }`}
            >
              {['A', 'B', 'C', 'D'][index] || '*'}. {section.title}
            </h3>

            {section.type === 'paragraph' ? (
              // Render Paragraph
              <p className="text-base text-justify leading-relaxed text-slate-800">
                {section.content[0]}
              </p>
            ) : (
              // Render List
              <div className={`${
                categoryId === 'DIGITAL' ? 'bg-blue-50 p-4 rounded-lg border border-blue-100' :
                categoryId === 'CHILD_FRIENDLY' ? 'bg-white border-l-4 border-teal-400 pl-4 py-2' :
                categoryId === 'RELIGIOUS_MODERATION' ? 'border-2 border-green-100 p-4 bg-green-50/30' :
                categoryId === 'TEACHING' ? 'bg-cyan-50/50 p-3 rounded border-l-2 border-cyan-500' :
                categoryId === 'COMPETITION' ? 'bg-violet-50 p-4 rounded-xl border border-violet-100' :
                categoryId === 'COMPETENCY' ? 'bg-blue-50 p-3 rounded border-l-2 border-blue-500' :
                categoryId === 'LEARNING_DEVICE' ? 'bg-orange-50 p-4 rounded-lg border border-orange-100' :
                categoryId === 'TALENT' ? 'bg-fuchsia-50 p-3 rounded border-l-2 border-fuchsia-500' :
                categoryId === 'MANAGEMENT' ? 'bg-slate-50 p-4 rounded-xl border border-slate-200' :
                categoryId === 'HEALTH' ? 'bg-pink-50 p-3 rounded border-l-2 border-pink-500' :
                categoryId === 'CUSTOM' ? 'bg-amber-50 p-3 rounded border-l-2 border-amber-500' :
                ''
              }`}>
                <ul className={`text-base space-y-1 ${categoryId === 'RELIGIOUS_MODERATION' ? '' : 'list-disc pl-5'}`}>
                  {section.content.map((item, idx) => (
                    <li key={idx} className={`${categoryId === 'RELIGIOUS_MODERATION' ? 'flex items-start gap-2' : ''}`}>
                       {categoryId === 'RELIGIOUS_MODERATION' && <span className="text-green-600 font-bold">❖</span>}
                       <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAssessmentTable = () => {
    if (!analysis.studentGrades) return null;
    
    // Logic for dense layout if many students
    const studentCount = analysis.studentGrades.length;
    
    // Tiered density
    const isSuperDense = studentCount > 32;
    const isVeryDense = studentCount > 25;
    const isDense = studentCount > 15;

    // Font size for general cells (No, Nama, Predikat)
    const rowFontSize = isSuperDense ? 'text-[8px]' : isVeryDense ? 'text-[9px]' : isDense ? 'text-[10px]' : 'text-xs';
    
    // Font size specifically for Description (usually the longest text)
    // using leading-none for SuperDense to maximize vertical space
    const descFontSize = isSuperDense ? 'text-[7px] leading-none' : isVeryDense ? 'text-[8px] leading-tight' : isDense ? 'text-[9px] leading-tight' : 'text-xs';
    
    // Padding Logic
    const cellPaddingClass = isSuperDense ? 'py-[1px] px-1' : isVeryDense ? 'py-0.5 px-2' : isDense ? 'py-1 px-2' : 'py-2 px-4';
    const headerPaddingClass = isSuperDense ? 'py-1 px-1' : isVeryDense ? 'py-1 px-2' : 'py-2 px-4';

    // Headers text based on category
    const gradeHeader = categoryId === 'COMPETITION' ? 'Status' : categoryId === 'TALENT' ? 'Tingkat' : categoryId === 'HEALTH' ? 'Status' : 'Nilai';
    const descHeader = categoryId === 'COMPETITION' ? 'Capaian / Keterangan' : categoryId === 'TALENT' ? 'Potensi Bakat' : categoryId === 'HEALTH' ? 'Hasil Pemeriksaan' : categoryId === 'CUSTOM' ? 'Keterangan' : 'Deskripsi Sikap';

    return (
      <div className="w-full">
         <div className="mb-1">
            <h3 className="text-center font-bold text-sm uppercase mb-0 leading-tight">{analysis.prinsipModerasi || (categoryId === 'COMPETITION' ? 'Daftar Peserta & Prestasi' : categoryId === 'TALENT' ? 'Daftar Pemetaan Bakat' : categoryId === 'HEALTH' ? 'Daftar Pemeriksaan Siswa' : categoryId === 'CUSTOM' ? 'Daftar Peserta & Keterangan' : 'Nilai Sikap')}</h3>
            <p className="text-center text-[10px] text-gray-600 italic">"{analysis.caption}"</p>
         </div>

         <div className="overflow-hidden border border-gray-300 rounded-sm">
           <table className={`min-w-full`}>
             <thead className={`bg-amber-100 ${rowFontSize}`}>
               <tr>
                 <th className={`${headerPaddingClass} border-b border-r border-gray-300 w-8 text-center`}>No</th>
                 <th className={`${headerPaddingClass} border-b border-r border-gray-300 text-left`}>Nama Siswa/Peserta</th>
                 <th className={`${headerPaddingClass} border-b border-r border-gray-300 text-center w-16`}>{gradeHeader}</th>
                 <th className={`${headerPaddingClass} border-b border-gray-300 text-left`}>{descHeader}</th>
               </tr>
             </thead>
             <tbody className={rowFontSize}>
               {analysis.studentGrades.map((student, idx) => (
                 <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                   <td className={`${cellPaddingClass} border-b border-r border-gray-200 text-center`}>{idx + 1}</td>
                   <td className={`${cellPaddingClass} border-b border-r border-gray-200 font-medium whitespace-nowrap`}>{student.nama}</td>
                   <td className={`${cellPaddingClass} border-b border-r border-gray-200 text-center font-bold 
                      ${student.predikat === 'SB' ? 'text-blue-600' : 
                        student.predikat === 'B' ? 'text-green-600' : 
                        student.predikat === 'C' ? 'text-amber-600' : 'text-red-600'}`}>
                     {categoryId === 'COMPETITION' 
                        ? (student.predikat === 'SB' ? 'JUARA' : student.predikat === 'B' ? 'FINALIS' : 'PESERTA')
                        : categoryId === 'TALENT'
                        ? (student.predikat === 'SB' ? 'SANGAT BERBAKAT' : student.predikat === 'B' ? 'BERBAKAT' : student.predikat === 'C' ? 'CUKUP' : 'KURANG')
                        : categoryId === 'HEALTH'
                        ? (student.predikat === 'SB' ? 'SANGAT SEHAT' : student.predikat === 'B' ? 'SEHAT' : student.predikat === 'C' ? 'CUKUP' : 'KURANG')
                        : student.predikat}
                   </td>
                   <td className={`${cellPaddingClass} border-b border-gray-200 text-gray-600 italic ${descFontSize}`}>
                     {student.deskripsi}
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
         
         {categoryId !== 'COMPETITION' && categoryId !== 'TALENT' && categoryId !== 'HEALTH' && (
           <div className="mt-1 text-[9px] text-gray-500">
             <p><span className="font-bold">Ket:</span> SB=Sangat Baik, B=Baik, C=Cukup, K=Kurang</p>
           </div>
         )}
      </div>
    );
  };

  // --- STANDARD REPORT VIEW (FOR ALL CATEGORIES) ---
  return (
    // Wrapper print settings
    <div className="flex flex-col items-center w-full bg-gray-100 min-h-screen p-4 sm:p-8 print:p-0 print:bg-white print:block">
      
      {/* Floating Action Bar (Hidden when printing) */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 bg-white px-6 py-3 rounded-full shadow-xl border border-gray-200 z-50 print:hidden transition-transform hover:-translate-y-1">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          Cetak / PDF
        </button>
        <div className="w-px bg-gray-300"></div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-red-600 font-semibold hover:text-red-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Buat Baru
        </button>
      </div>

      {/* --- HALAMAN 1: COVER --- */}
      <div className={`sheet shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-[25mm] mb-8 print:mb-0 relative mx-auto flex flex-col justify-between overflow-hidden ${theme?.bgGradient || 'bg-white'}`}>
        
        {/* Decorative Background Patterns (Theme Based) */}
        {theme && (
          <>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.07] pointer-events-none transform translate-x-1/4 -translate-y-1/4 rotate-12 print:opacity-[0.05]">
               <svg viewBox="0 0 24 24" fill="currentColor" className={`w-full h-full ${theme.primary}`}>
                  <path d={theme.patternPath} />
               </svg>
            </div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.07] pointer-events-none transform -translate-x-1/4 translate-y-1/4 -rotate-12 print:opacity-[0.05]">
               <svg viewBox="0 0 24 24" fill="currentColor" className={`w-full h-full ${theme.primary}`}>
                  <path d={theme.patternPath} />
               </svg>
            </div>
          </>
        )}

        {/* Dynamic Cover Applied Here */}
        {renderCoverContent()}
      </div>

      {/* --- HALAMAN 2: ISI LAPORAN (DYNAMIC) --- */}
      <div className="sheet bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-[25mm] relative mx-auto print:mt-0 mb-8 print:mb-0 flex flex-col">
        <div className="font-serif text-justify leading-relaxed text-gray-900 h-full flex flex-col">
          
          {/* Header Internal */}
          <div className="border-b-2 border-gray-800 pb-4 mb-6 text-center shrink-0">
            <h2 className="text-lg font-bold uppercase">Laporan Pelaksanaan Kinerja</h2>
            <p className="text-sm text-gray-600">{analysis.jenis_kegiatan}</p>
          </div>

          {/* Body Content */}
          {renderDynamicContent()}
          
          {/* Footer Note */}
          <div className="mt-auto text-right text-xs italic text-gray-400">
            (Dokumentasi dan Pengesahan di halaman berikutnya)
          </div>
        </div>
      </div>

      {/* --- HALAMAN 3: DOKUMENTASI & PENGESAHAN --- */}
      <div className="sheet bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-[25mm] relative mx-auto print:mt-0 mb-8 print:mb-0 flex flex-col justify-between">
        <div className="font-serif w-full h-full flex flex-col">
          
          {/* Header Internal */}
          <div className="border-b border-gray-300 pb-2 mb-6 text-right shrink-0">
            <p className="text-xs text-gray-400 italic">Lampiran: {analysis.judul_terpilih.replace(/\[RHK \d+\]\s*/, '')}</p>
          </div>

          {/* Section: Dokumentasi */}
          <div className="flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-4 border-b border-gray-200 pb-1">D. Dokumentasi Kegiatan</h3>
            
            <div className={`flex-1 border border-gray-300 bg-gray-50 rounded-lg p-4 grid gap-4 overflow-hidden max-h-[140mm] ${
              images && images.length > 1 
                ? images.length <= 2 ? 'grid-cols-2' : images.length <= 4 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-3 grid-rows-2'
                : 'grid-cols-1'
            }`}>
              {images && images.map((img, idx) => (
                <div key={idx} className="flex items-center justify-center overflow-hidden bg-white border border-gray-200 rounded shadow-sm">
                  <img 
                    src={img} 
                    alt={`Bukti Kegiatan ${idx + 1}`} 
                    className="w-full h-full object-contain" 
                  />
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-2 italic">Gambar 1.1: {analysis.caption}</p>
          </div>

          {/* Footer / Signature with Image */}
          <div className="mt-12 flex justify-end shrink-0 px-4">
            <div className="text-center w-52 flex flex-col">
              <p>{profile.kota}, {tanggalLaporan}</p>
              <p className="mt-1 mb-2">{signatures.right}</p>
              
              {/* Added Signature Image from Google Drive */}
              <div className="h-20 flex items-center justify-center my-2">
                <img 
                  src="https://drive.google.com/thumbnail?id=1gdxnC3M_VZLA--WQ5eEB66EJAO7dYm3o&sz=w500" 
                  alt="Tanda Tangan" 
                  className="h-full object-contain mix-blend-multiply" 
                />
              </div>

              <p className="font-bold underline text-lg">{profile.nama}</p>
              <p className="text-md">NIP. {profile.nip || "-"}</p>
            </div>
          </div>

        </div>
      </div>

      {/* --- HALAMAN 4: OPTIONAL ASSESSMENT TABLE (HYBRID MODE) --- */}
      {analysis.studentGrades && analysis.studentGrades.length > 0 && (
         <div className={`sheet bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-[10mm] relative mx-auto print:mt-0 flex flex-col`}>
             {/* Header Assessment: Reduced margins */}
             <div className="text-center border-b-4 border-double border-amber-600 pb-1 mb-2">
                <h1 className="text-base font-bold uppercase text-gray-900 tracking-wide leading-tight">
                  {categoryId === 'COMPETITION' ? 'Lampiran Data Prestasi & Partisipasi' : categoryId === 'CUSTOM' ? 'Lampiran Data Keterlibatan' : 'Jurnal Penilaian Sikap Sosial & Spiritual'}
                </h1>
                
                {/* Dynamic Sub-header based on Category */}
                <h2 className="text-sm font-bold text-amber-700 leading-tight">
                    {categoryId === 'RELIGIOUS_MODERATION' ? 'Penguatan Moderasi Beragama' : 
                     categoryId === 'TEACHING' ? 'Penguatan Pendidikan Karakter' : 
                     categoryId === 'COMPETITION' ? 'Rekapitulasi Keikutsertaan Lomba' : 
                     categoryId === 'CUSTOM' ? 'Rekapitulasi Kegiatan Kustom' : ''}
                </h2>

                <div className="flex justify-between mt-1 text-[10px] font-semibold border-t border-dashed border-amber-200 pt-1 px-2">
                   <span>Unit Kerja: {profile.unitKerja}</span>
                   <span>Periode: {periode}</span>
                </div>
             </div>

             {/* Content: Table */}
             <div className="flex-1">
                {renderAssessmentTable()}
             </div>

             {/* Footer Signature: Reduced margins */}
             <div className="mt-2 flex justify-end shrink-0 break-inside-avoid-page px-8">
                <div className="text-center w-48 flex flex-col">
                  <p className="text-xs">{profile.kota}, {tanggalLaporan}</p>
                  <p className="mt-0.5 mb-0 text-xs">{signatures.right}</p>
                  
                  <div className="h-14 flex items-center justify-center my-0.5">
                    <img 
                      src="https://drive.google.com/thumbnail?id=1gdxnC3M_VZLA--WQ5eEB66EJAO7dYm3o&sz=w500" 
                      alt="Tanda Tangan" 
                      className="h-full object-contain mix-blend-multiply" 
                    />
                  </div>

                  <p className="font-bold underline text-sm">{profile.nama}</p>
                  <p className="text-xs">NIP. {profile.nip || "-"}</p>
                </div>
              </div>
          </div>
      )}

    </div>
  );
};