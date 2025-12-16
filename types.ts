export interface TeacherProfile {
  nama: string;
  nip: string;
  unitKerja: string;
  kota: string;
}

export interface AnalysisResult {
  judul_terpilih: string;
  jenis_kegiatan: 'Intrakurikuler' | 'Kokurikuler' | 'Ekstrakurikuler';
  latar_belakang: string;
  deskripsi: string;
  nilai_karakter: string[];
}

export interface ReportData {
  image: string; // Base64
  profile: TeacherProfile;
  periode: string;
  analysis: AnalysisResult;
  tanggalLaporan: string;
}