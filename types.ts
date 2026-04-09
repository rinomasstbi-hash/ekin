export interface TeacherProfile {
  nama: string;
  nip: string;
  unitKerja: string;
  kota: string;
  mataPelajaran: string;
  tahunPelaporan: string;
}

export interface ReportSection {
  title: string;
  type: 'paragraph' | 'list';
  content: string[]; // For paragraph, it's an array with 1 string. For list, multiple strings.
}

export interface StudentGrade {
  nama: string;
  predikat: 'SB' | 'B' | 'C' | 'K';
  deskripsi: string;
}

export interface AnalysisResult {
  judul_terpilih: string;
  jenis_kegiatan: 'Intrakurikuler' | 'Kokurikuler' | 'Ekstrakurikuler' | 'Penilaian Pembelajaran';
  caption: string; // Deskripsi gambar atau Konteks Materi
  sections: ReportSection[];
  studentGrades?: StudentGrade[]; // Optional data for assessment category
  kelas?: string; // Optional data
  prinsipModerasi?: string; // Optional data
}

export type CategoryId = 'TEACHING' | 'DIGITAL' | 'CHILD_FRIENDLY' | 'RELIGIOUS_MODERATION' | 'COMPETITION' | 'COMPETENCY' | 'LEARNING_DEVICE' | 'TALENT' | 'MANAGEMENT' | 'HEALTH' | 'CUSTOM';

export interface ReportData {
  images: string[]; // Array of Base64 images
  profile: TeacherProfile;
  periode: string;
  analysis: AnalysisResult;
  tanggalLaporan: string;
  categoryLabel: string;
  categoryId: CategoryId;
  coverBorderIndex: number;
}

export interface ThemeConfig {
  primary: string; // Main dark color (e.g., text-blue-800)
  secondary: string; // Lighter color for accents (e.g., bg-blue-100)
  accent: string; // Bright accent (e.g., text-blue-600)
  bgGradient: string; // Gradient class for card background
  headerColor: string; // Class for header background (e.g. bg-blue-700)
  patternPath: string; // SVG Path for the background decoration
}

export interface RHKCategory {
  id: CategoryId;
  title: string;
  description: string;
  icon: string;
  coverTitle: string; 
  rhkList: string[];
  theme: ThemeConfig;
}