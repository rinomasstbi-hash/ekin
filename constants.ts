import { RHKCategory } from "./types";

export const RHK_CATEGORIES: RHKCategory[] = [
  {
    id: 'TEACHING',
    title: 'Tugas Guru & Pembelajaran',
    description: 'Laporan aktivitas pembelajaran kelas, tugas tambahan, dan pengembangan diri.',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    coverTitle: 'Laporan Pelaksanaan\nTugas Guru & Pembelajaran',
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
      "Melaksanakan proses pembelajaran di dalam kelas",
      "Melaksanakan kegiatan praktik di laboratorium/bengkel",
      "Menjadi Wali Kelas",
      "Menjadi Guru Piket Harian",
      "Menjadi Pembina Ekstrakurikuler",
      "Mengikuti kegiatan KKG/MGMP",
      "Mengikuti Seminar/Webinar Pendidikan",
      "Menyusun Perangkat Pembelajaran (RPP/Modul Ajar)",
      "Melaksanakan Remedial dan Pengayaan",
      "Melakukan Penilaian Hasil Belajar Siswa",
      "Melaksanakan Tugas Tambahan Wakil Kepala Sekolah",
      "Melaksanakan Rapat Dinas Sekolah",
      "Menjadi Pengawas Ujian Sekolah"
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
      "Pemanfaatan taman sekolah untuk pembelajaran menyenangkan",
      "Kampanye disiplin positif tanpa kekerasan",
      "Kegiatan permainan tradisional saat istirahat",
      "Pemantauan fasilitas sanitasi yang layak anak"
    ]
  },
  {
    id: 'RELIGIOUS_MODERATION',
    title: 'Moderasi Beragama',
    description: 'Penilaian dan penguatan moderasi beragama bagi siswa.',
    icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    coverTitle: 'Laporan Penguatan\nModerasi Beragama',
    theme: {
      primary: 'text-emerald-800',
      secondary: 'bg-emerald-50',
      accent: 'text-emerald-600',
      bgGradient: 'from-emerald-50 to-white',
      headerColor: 'bg-emerald-700',
      // Pattern: Geometric Star/Diamond
      patternPath: 'M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z'
    },
    rhkList: [
      "Penanaman nilai toleransi (Tasamuh) dalam diskusi kelas",
      "Peringatan hari besar keagamaan secara moderat",
      "Pembiasaan sikap adil dan seimbang (Tawazun)",
      "Kegiatan bakti sosial lintas golongan",
      "Dialog kebangsaan dan cinta tanah air (Hubbul Wathon)",
      "Penilaian sikap menghargai perbedaan pendapat",
      "Kampanye anti-radikalisme dan kekerasan",
      "Penguatan nilai musyawarah (Syura) dalam pemilihan ketua",
      "Doa bersama untuk keselamatan bangsa",
      "Integrasi nilai moderasi dalam materi pelajaran"
    ]
  },
  {
    id: 'STUDENT_ASSESSMENT',
    title: 'Penilaian Moderasi Siswa',
    description: 'Input nama siswa dan generate tabel nilai sikap moderasi beragama otomatis.',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    coverTitle: 'Jurnal Penilaian Sikap\nPenguatan Moderasi Beragama',
    theme: {
      primary: 'text-amber-800',
      secondary: 'bg-amber-50',
      accent: 'text-amber-600',
      bgGradient: 'from-amber-50 to-white',
      headerColor: 'bg-amber-600',
      // Pattern: Scales / Balance / Checklist
      patternPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    rhkList: [
      "Penilaian Sikap Toleransi (Tasamuh)",
      "Penilaian Sikap Adil & Seimbang (Tawazun)",
      "Penilaian Sikap Cinta Tanah Air (Hubbul Wathon)",
      "Penilaian Sikap Musyawarah (Syura)",
      "Penilaian Sikap Anti-Kekerasan (La' Unf)",
      "Penilaian Sikap Menghargai Tradisi (Urf)",
      "Penilaian Sikap Pelopor Kebaikan (Ishlah)"
    ]
  }
];