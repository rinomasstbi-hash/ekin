import React from 'react';
import { ReportData } from '../types';

interface Props {
  data: ReportData;
  onReset: () => void;
}

export const ReportView: React.FC<Props> = ({ data, onReset }) => {
  const { profile, analysis, image, periode, tanggalLaporan } = data;

  return (
    <div className="flex flex-col items-center w-full bg-gray-100 min-h-screen p-4 sm:p-8">
      {/* Floating Action Bar (Hidden when printing) */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 bg-white px-6 py-3 rounded-full shadow-xl border border-gray-200 z-50 print:hidden">
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

      {/* PAPER 1: COVER */}
      <div className="bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-[25mm] mb-8 print:mb-0 print:break-after-page relative mx-auto">
        <div className="h-full flex flex-col items-center justify-between text-center border-4 border-double border-gray-800 p-8">
          
          <div className="mt-10">
            <h1 className="text-2xl font-serif font-bold tracking-widest uppercase mb-4 leading-relaxed px-4">
              Pembiasaan Pendidikan Karakter<br />Dalam Pembelajaran
            </h1>
            <h2 className="text-xl font-serif font-bold uppercase text-gray-700 px-4">{analysis.judul_terpilih}</h2>
          </div>

          <div className="my-12">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/9/9a/Kementerian_Agama_new_logo.png" 
              alt="Logo Kementerian Agama" 
              className="w-32 h-auto mx-auto mb-6 object-contain"
            />
            <p className="text-lg font-semibold uppercase tracking-wider text-gray-600">Periode: {periode}</p>
          </div>

          <div className="mb-20 w-full">
            <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">Disusun Oleh:</p>
            <h3 className="text-xl font-bold border-b-2 border-gray-800 pb-2 inline-block min-w-[50%]">{profile.nama}</h3>
            <p className="text-lg mt-2 font-mono">{profile.nip ? `NIP. ${profile.nip}` : '-'}</p>
          </div>

          <div className="w-full">
            <h4 className="text-xl font-bold uppercase">{profile.unitKerja}</h4>
            <p className="text-md uppercase text-gray-600">{profile.kota}</p>
            <p className="text-sm text-gray-500 mt-2">{new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* PAPER 2: CONTENT */}
      <div className="bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] p-[25mm] relative mx-auto print:mt-0">
        <div className="font-serif text-justify leading-relaxed text-gray-900">
          
          {/* Header Internal */}
          <div className="border-b-2 border-gray-800 pb-4 mb-8 text-center">
            <h2 className="text-lg font-bold uppercase">Laporan Pelaksanaan Kinerja</h2>
            <p className="text-sm text-gray-600">{analysis.jenis_kegiatan}</p>
          </div>

          {/* Section A: Latar Belakang */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">A. Latar Belakang</h3>
            <p>{analysis.latar_belakang}</p>
          </div>

          {/* Section B: Deskripsi Kegiatan */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">B. Deskripsi Kegiatan</h3>
            <p>{analysis.deskripsi}</p>
          </div>

          {/* Section C: Nilai Karakter */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2">C. Nilai Karakter (Dimensi Profil Lulusan)</h3>
            <ul className="list-disc pl-5">
              {analysis.nilai_karakter.map((nilai, index) => (
                <li key={index}>{nilai}</li>
              ))}
            </ul>
          </div>

          {/* Section D: Dokumentasi */}
          <div className="mb-8 break-inside-avoid">
            <h3 className="font-bold text-lg mb-4">D. Dokumentasi</h3>
            <div className="border border-gray-300 p-2 rounded bg-gray-50 inline-block w-full">
              <img src={image} alt="Bukti Kegiatan" className="w-full h-auto max-h-[400px] object-contain mx-auto rounded" />
            </div>
            <p className="text-center text-xs text-gray-500 mt-2 italic">Bukti foto kegiatan pelaksanaan kinerja.</p>
          </div>

          {/* Footer / Signature */}
          <div className="mt-16 flex justify-end break-inside-avoid">
            <div className="text-center w-64">
              <p>{profile.kota}, {tanggalLaporan}</p>
              <p className="mt-1 mb-20">Guru Penyusun,</p>
              <p className="font-bold underline">{profile.nama}</p>
              <p>NIP. {profile.nip || "-"}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};