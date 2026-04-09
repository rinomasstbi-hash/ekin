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
      "[RHK 09] Jumlah program pembiasaan karakter harian/mingguan",
      "[RHK 11] Jumlah kegiatan kepramukaan (perkemahan, bakti sosial, lomba)",
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
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
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
      "[RHK 03] Tersedianya daftar satuan pendidikan yang memiliki potensi inklusif",
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
      "[RHK 18] Jumlah guru yang mengikuti pelatihan penguatan moderasi beragama",
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
  },
  {
    id: 'COMPETITION',
    title: 'Keikutsertaan Lomba',
    description: 'Laporan keikutsertaan guru/siswa dalam kompetisi akademik/non-akademik.',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    coverTitle: 'Laporan Keikutsertaan\nKompetisi & Perlombaan',
    theme: {
      primary: 'text-violet-800',
      secondary: 'bg-violet-50',
      accent: 'text-violet-600',
      bgGradient: 'from-violet-50 to-white',
      headerColor: 'bg-violet-700',
      // Pattern: Trophy / Star burst
      patternPath: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
    },
    rhkList: [
      "[RHK 11] Jumlah kegiatan kepramukaan (perkemahan, bakti sosial, lomba)",
      "Membimbing siswa mengikuti kompetisi (KSN/KSM/O2SN)",
      "Menjadi peserta lomba/kompetisi guru inovatif",
      "Menjadi Juri/Wasit dalam perlombaan tingkat sekolah/daerah",
      "Mendampingi siswa dalam lomba kepramukaan",
      "Mengikuti lomba karya tulis ilmiah guru",
      "Melatih tim ekstrakurikuler untuk perlombaan",
      "Menjadi panitia penyelenggara lomba di sekolah",
      "Meraih prestasi/penghargaan dalam kompetisi pendidikan"
    ]
  },
  {
    id: 'COMPETENCY',
    title: 'Pengembangan Kompetensi',
    description: 'Laporan keikutsertaan diklat, bimtek, seminar, dan pelatihan guru.',
    icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
    coverTitle: 'Laporan Kegiatan\nPengembangan Kompetensi Guru',
    theme: {
      primary: 'text-blue-800',
      secondary: 'bg-blue-50',
      accent: 'text-blue-600',
      bgGradient: 'from-blue-50 to-white',
      headerColor: 'bg-blue-700',
      patternPath: 'M12 14l9-5-9-5-9 5 9 5z'
    },
    rhkList: [
      "[RHK 06] Jumlah guru yang mengikuti pelatihan berbasis literasi",
      "[RHK 15] Jumlah guru yang mengikuti pelatihan metode pengajaran bilingual",
      "[RHK 18] Jumlah guru yang mengikuti pelatihan penguatan moderasi beragama",
      "[RHK 21] Tersedianya Dokumen Peningkatan Indeks Profesionalisme ASN",
      "Sertifikat/Bimtek/Seminar Pendidikan"
    ]
  },
  {
    id: 'LEARNING_DEVICE',
    title: 'Perangkat Pembelajaran',
    description: 'Penyusunan RPP, Modul Ajar, Silabus, dan strategi pembelajaran.',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    coverTitle: 'Laporan Penyusunan\nPerangkat Pembelajaran',
    theme: {
      primary: 'text-orange-800',
      secondary: 'bg-orange-50',
      accent: 'text-orange-600',
      bgGradient: 'from-orange-50 to-white',
      headerColor: 'bg-orange-700',
      patternPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    rhkList: [
      "[RHK 07] Jumlah guru yang menerapkan strategi pembelajaran numerasi",
      "[RHK 12] Jumlah guru yang mengikuti pelatihan/penyusunan silabus dan RPP",
      "[RHK 17] Persentase guru yang mampu menyusun RPP memuat pendidikan karakter",
      "Pembuatan Modul Ajar IPA/Mata Pelajaran Lain"
    ]
  },
  {
    id: 'TALENT',
    title: 'Bakat & Minat Siswa',
    description: 'Program pengembangan, pemetaan, dan database bakat minat siswa.',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    coverTitle: 'Laporan Program\nPengembangan Bakat & Minat',
    theme: {
      primary: 'text-fuchsia-800',
      secondary: 'bg-fuchsia-50',
      accent: 'text-fuchsia-600',
      bgGradient: 'from-fuchsia-50 to-white',
      headerColor: 'bg-fuchsia-700',
      patternPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
    },
    rhkList: [
      "[RHK 02] Jumlah program pengembangan bakat dan minat yang diselenggarakan",
      "[RHK 10] Tersedianya database siswa madrasah yang memiliki bakat/minat",
      "[RHK 16] Tersedianya database siswa berbakat/berprestasi pada berbagai bidang",
      "Pemetaan siswa berprestasi"
    ]
  },
  {
    id: 'MANAGEMENT',
    title: 'Tata Kelola & Administrasi',
    description: 'Penyusunan RKT, Akreditasi, SIMPEG, ZI, dan Supervisi.',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    coverTitle: 'Laporan Pelaksanaan\nTata Kelola & Administrasi',
    theme: {
      primary: 'text-slate-800',
      secondary: 'bg-slate-100',
      accent: 'text-slate-600',
      bgGradient: 'from-slate-100 to-white',
      headerColor: 'bg-slate-700',
      patternPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
    },
    rhkList: [
      "[RHK 04] Tersedianya data daya tampung dan jumlah siswa existing (PPDB)",
      "[RHK 08] Jumlah satuan pendidikan yang menyelenggarakan forum RKT",
      "[RHK 13] Tersedianya database satuan pendidikan termasuk status akreditasi",
      "[RHK 14] Jumlah dokumen satuan pendidikan yang menerima pendampingan (Supervisi)",
      "[RHK 19] Tersedianya Surat Keputusan (SK) Tim Pembangunan ZI",
      "[RHK 20] Tersedianya data profil pegawai yang terekam di SIMPEG"
    ]
  },
  {
    id: 'HEALTH',
    title: 'Kesehatan & Kesejahteraan',
    description: 'Pemeriksaan kesehatan rutin (UKS) dan pembinaan pranikah.',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    coverTitle: 'Laporan Kegiatan\nKesehatan & Kesejahteraan Siswa',
    theme: {
      primary: 'text-pink-800',
      secondary: 'bg-pink-50',
      accent: 'text-pink-600',
      bgGradient: 'from-pink-50 to-white',
      headerColor: 'bg-pink-700',
      patternPath: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
    },
    rhkList: [
      "[RHK 01] Jumlah kegiatan pembinaan pranikah yang diselenggarakan",
      "[RHK 05] Jumlah satuan pendidikan yang melaksanakan pemeriksaan kesehatan rutin (UKS)",
      "Kampanye kesehatan dan gizi siswa"
    ]
  },
  {
    id: 'CUSTOM',
    title: 'Custom RHK',
    description: 'Laporan kustom berdasarkan foto atau dokumen yang diunggah. AI akan menganalisis dan membuat laporan yang relevan.',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
    coverTitle: 'Laporan Pelaksanaan\nKegiatan Kustom',
    theme: {
      primary: 'text-amber-800',
      secondary: 'bg-amber-50',
      accent: 'text-amber-600',
      bgGradient: 'from-amber-50 to-white',
      headerColor: 'bg-amber-700',
      patternPath: 'M12 2L2 22h20L12 2zm0 4l6 14H6l6-14z'
    },
    rhkList: [
      "Laporan Kegiatan Kustom (Dianalisis oleh AI)"
    ]
  }
];