export interface TeacherProfile {
  nama: string;
  nip: string;
  unitKerja: string;
  kota: string;
}

export interface ReportSection {
  title: string;
  type: 'paragraph' | 'list';
  content: string[]; // For paragraph, it's an array with 1 string. For list, multiple strings.
}

export interface AnalysisResult {
  judul_terpilih: string;
  jenis_kegiatan: 'Intrakurikuler' | 'Kokurikuler' | 'Ekstrakurikuler';
  sections: ReportSection[];
}

export type CategoryId = 'TEACHING' | 'DIGITAL' | 'CHILD_FRIENDLY' | 'RELIGIOUS_MODERATION';

export interface ReportData {
  image: string; // Base64
  profile: TeacherProfile;
  periode: string;
  analysis: AnalysisResult;
  tanggalLaporan: string;
  categoryLabel: string;
  categoryId: CategoryId;
}

export interface RHKCategory {
  id: CategoryId;
  title: string;
  description: string;
  icon: string;
  coverTitle: string; 
  rhkList: string[];
}