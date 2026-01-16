import { RHKCategory } from "./types";

export const RHK_CATEGORIES: RHKCategory[] = [
  {
    id: 'TEACHING',
    title: 'Penguatan Pendidikan Karakter',
    description: 'Laporan pembiasaan karakter, kedisiplinan, dan budaya positif sekolah.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    coverTitle: 'Laporan Pelaksanaan\nPenguatan Pendidikan Karakter',
    theme: {
      primary: 'text-cyan-800',
      secondary: 'bg-cyan-50',
      accent: 'text-cyan-600',
      bgGradient: 'from-cyan-50 to-white',
      headerColor: 'bg-cyan-700',
      // Pattern: Concentric Circles / Ripples
      patternPath: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-14a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z'
    },
    rhkList: [
      "Pelaksanaan Upacara Bendera / Apel Pagi",
      "Pembiasaan 5S (Senyum, Salam, Sapa, Sopan, Santun)",
      "Kegiatan Gotong Royong / Jumat Bersih",
      "Pelaksanaan Sholat Dhuha / Ibadah Berjamaah",
      "Penerapan Budaya Antri dan Disiplin",
      "Kegiatan Literasi Sekolah",
      "Pembinaan Wali Kelas terhadap Siswa",
      "Kegiatan Kepramukaan",
      "Peringatan Hari Besar Nasional",
      "Kampanye Kebersihan dan Lingkungan Hidup (Adiwiyata)",
      "Penyelesaian Masalah Siswa (Restitusi)",
      "Kegiatan Sosial / Infaq Jumat"
    ]
  },
  {
    id: 'DIGITAL',
    title: 'Teknologi Digital',
    description: 'Pembuatan dan pemanfaatan teknologi digital dalam pembelajaran.',
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    coverTitle: 'Laporan Pemanfaatan\nTeknologi Digital Pembelajaran',
    theme: {
      primary: 'text-indigo-800',
      secondary: 'bg-indigo-50',
      accent: 'text-indigo-600',
      bgGradient: 'from-indigo-50 to-white',
      headerColor: 'bg-indigo-700',
      // Pattern: Tech/Grid Nodes
      patternPath: 'M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z'
    },
    rhkList: [
      "Membuat media pembelajaran berbasis video/animasi",
      "Membuat slide presentasi interaktif (Canva/PPT)",
      "Melaksanakan kuis pembelajaran digital (Quizizz/Kahoot)",
      "Menggunakan Google Classroom/LMS untuk materi",
      "Pemanfaatan Smart TV/Proyektor dalam pembelajaran",
      "Membuat konten edukasi di media sosial sekolah",
      "Pengelolaan data nilai siswa berbasis aplikasi (e-Rapor)",
      "Melaksanakan asesmen berbasis komputer/smartphone",
      "Pelatihan literasi digital bagi siswa",
      "Pembuatan E-Modul atau bahan ajar digital"
    ]
  },
  {
    id: 'CHILD_FRIENDLY',
    title: 'Madrasah Ramah Anak',
    description: 'Pelaksanaan layanan ramah anak, anti-bullying, dan inklusivitas.',
    icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    coverTitle: 'Laporan Pelaksanaan\nLayanan Madrasah Ramah Anak',
    theme: {
      primary: 'text-rose-800',
      secondary: 'bg-rose-50',
      accent: 'text-rose-600',
      bgGradient: 'from-rose-50 to-white',
      headerColor: 'bg-rose-600',
      // Pattern: Organic/Flower/Heart shapes
      patternPath: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    },
    rhkList: [
      "Penyambutan siswa dengan 5S (Senyum, Salam, Sapa, Sopan, Santun)",
      "Sosialisasi pencegahan perundungan (Anti-Bullying)",
      "Layanan konseling individu yang ramah anak",
      "Deklarasi Sekolah/Madrasah Ramah Anak",
      "Penciptaan lingkungan kelas yang inklusif dan aman",
      "Pengawasan kantin sehat dan higienis",
      "Pemanfaatan taman sekolah untuk pembelajaran",
      "Pelaksanaan kegiatan permainan tradisional",
      "Penyediaan fasilitas yang aksesibel bagi siswa inklusi",
      "Kampanye sekolah sehat dan bebas asap rokok"
    ]
  },
  {
    id: 'RELIGIOUS_MODERATION',
    title: 'Moderasi Beragama',
    description: 'Penguatan nilai toleransi, kebangsaan, dan moderasi beragama.',
    icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.848.578-4.136m1.838 1.58A6.002 6.002 0 0117.03 14',
    coverTitle: 'Laporan Pelaksanaan\nPenguatan Moderasi Beragama',
    theme: {
      primary: 'text-emerald-800',
      secondary: 'bg-emerald-50',
      accent: 'text-emerald-600',
      bgGradient: 'from-emerald-50 to-white',
      headerColor: 'bg-emerald-700',
      // Pattern: Geometric Islamic Star
      patternPath: 'M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z'
    },
    rhkList: [
      "Melaksanakan kegiatan peringatan hari besar keagamaan",
      "Menanamkan nilai toleransi (Tasamuh) dalam pembelajaran",
      "Melaksanakan pembiasaan sholat berjamaah/ibadah bersama",
      "Kegiatan bakti sosial lintas agama atau kemasyarakatan",
      "Diskusi kelas tentang keberagaman dan kebangsaan",
      "Pencegahan radikalisme dan ekstremisme di sekolah",
      "Kampanye cinta tanah air (Hubbul Wathon)",
      "Penerapan prinsip keadilan (I'tidal) dalam interaksi siswa",
      "Kegiatan gotong royong membersihkan lingkungan ibadah",
      "Penguatan profil pelajar Rahmatan lil Alamin"
    ]
  }
];