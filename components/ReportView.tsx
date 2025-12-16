import React from 'react';
import { ReportData } from '../types';

interface Props {
  data: ReportData;
  onReset: () => void;
}

export const ReportView: React.FC<Props> = ({ data, onReset }) => {
  const { profile, analysis, image, periode, tanggalLaporan } = data;

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
      <div className="sheet bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-[25mm] mb-8 print:mb-0 relative mx-auto flex flex-col justify-between">
        <div className="flex-1 flex flex-col items-center justify-between text-center border-4 border-double border-gray-800 p-8">
          
          <div className="mt-10">
            <h1 className="text-2xl font-serif font-bold tracking-widest uppercase mb-4 leading-relaxed px-4">
              Pembiasaan Pendidikan Karakter<br />Dalam Pembelajaran
            </h1>
            <h2 className="text-xl font-serif font-bold uppercase text-gray-700 px-4 mt-6">{analysis.judul_terpilih}</h2>
          </div>

          <div className="my-8 flex flex-col items-center">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Kementerian_Agama_new_logo.png" 
              alt="Logo Kementerian Agama" 
              className="w-32 h-auto mb-6 object-contain"
            />
            <p className="text-lg font-semibold uppercase tracking-wider text-gray-600">Periode: {periode}</p>
          </div>

          <div className="mb-10 w-full">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">Disusun Oleh:</p>
            <h3 className="text-xl font-bold border-b-2 border-gray-800 pb-2 inline-block min-w-[50%]">{profile.nama}</h3>
            <p className="text-lg mt-2 font-mono">{profile.nip ? `NIP. ${profile.nip}` : '-'}</p>
          </div>

          <div className="w-full mb-4">
            <h4 className="text-xl font-bold uppercase">{profile.unitKerja}</h4>
            <p className="text-md uppercase text-gray-600">{profile.kota}</p>
            <p className="text-sm text-gray-500 mt-2">{new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* --- HALAMAN 2: ISI LAPORAN (TEKS) --- */}
      <div className="sheet bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-[25mm] relative mx-auto print:mt-0 mb-8 print:mb-0 flex flex-col">
        <div className="font-serif text-justify leading-relaxed text-gray-900 h-full flex flex-col">
          
          {/* Header Internal */}
          <div className="border-b-2 border-gray-800 pb-4 mb-6 text-center shrink-0">
            <h2 className="text-lg font-bold uppercase">Laporan Pelaksanaan Kinerja</h2>
            <p className="text-sm text-gray-600">{analysis.jenis_kegiatan}</p>
          </div>

          {/* Content Body */}
          <div className="flex-1 flex flex-col gap-8">
            {/* Section A */}
            <div>
              <h3 className="font-bold text-lg mb-2 border-b border-gray-200 pb-1">A. Latar Belakang</h3>
              <p className="text-base">{analysis.latar_belakang}</p>
            </div>

            {/* Section B */}
            <div>
              <h3 className="font-bold text-lg mb-2 border-b border-gray-200 pb-1">B. Deskripsi Kegiatan</h3>
              <p className="text-base">{analysis.deskripsi}</p>
            </div>

            {/* Section C */}
            <div>
              <h3 className="font-bold text-lg mb-2 border-b border-gray-200 pb-1">C. Nilai Karakter (Dimensi Profil Lulusan)</h3>
              <ul className="list-disc pl-5 text-base space-y-1">
                {analysis.nilai_karakter.map((nilai, index) => (
                  <li key={index}>{nilai}</li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Footer Note */}
          <div className="mt-auto text-right text-xs italic text-gray-400">
            (Dokumentasi dan Pengesahan di halaman berikutnya)
          </div>
        </div>
      </div>

      {/* --- HALAMAN 3: DOKUMENTASI & PENGESAHAN --- */}
      <div className="sheet bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-[25mm] relative mx-auto print:mt-0 flex flex-col justify-between">
        <div className="font-serif w-full h-full flex flex-col">
          
          {/* Header Internal (Optional, kept small for context) */}
          <div className="border-b border-gray-300 pb-2 mb-6 text-right shrink-0">
            <p className="text-xs text-gray-400 italic">Lampiran Laporan: {analysis.judul_terpilih}</p>
          </div>

          {/* Section D: Dokumentasi */}
          <div className="flex-1 flex flex-col">
            <h3 className="font-bold text-lg mb-4 border-b border-gray-200 pb-1">D. Dokumentasi Kegiatan</h3>
            
            <div className="flex-1 border border-gray-300 bg-gray-50 rounded-lg p-4 flex items-center justify-center overflow-hidden max-h-[140mm]">
              <img 
                src={image} 
                alt="Bukti Kegiatan" 
                className="w-full h-full object-contain" 
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2 italic">Gambar 1.1: Bukti fisik pelaksanaan kegiatan</p>
          </div>

          {/* Footer / Signature */}
          <div className="mt-12 flex justify-end shrink-0">
            <div className="text-center w-64">
              <p>{profile.kota}, {tanggalLaporan}</p>
              <p className="mt-1 mb-24 print:mb-24">Guru Penyusun,</p>
              <p className="font-bold underline text-lg">{profile.nama}</p>
              <p className="text-md">NIP. {profile.nip || "-"}</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};