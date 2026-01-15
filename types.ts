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
  caption: string; // Deskripsi gambar (dari user input atau AI generated)
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
  coverBorderIndex: number; // Added for random border variation
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