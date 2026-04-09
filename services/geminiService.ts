import { GoogleGenAI, Type } from "@google/genai";
import { RHK_CATEGORIES } from "../constants";
import { AnalysisResult, CategoryId } from "../types";

// Helper for robust error parsing
const handleGeminiError = (error: any, contextPrefix: string): never => {
  console.error(`Gemini Error [${contextPrefix}]:`, error);

  let finalMessage = "";
  const errString = error.toString().toLowerCase();
  const errMessage = (error.message || "").toLowerCase();
  
  // Check strict codes first
  const isQuota = errString.includes("429") || errMessage.includes("quota") || errMessage.includes("limit") || errMessage.includes("resource_exhausted");
  const isAuth = errString.includes("401") || errString.includes("403") || errMessage.includes("key") || errMessage.includes("permission");
  const isOverload = errString.includes("503") || errMessage.includes("overloaded");
  
  if (isQuota) {
    finalMessage = "Kuota API Harian/Menit Telah Habis. Mohon gunakan API Key Google Gemini milik Anda sendiri (Gratis di aistudio.google.com).";
  } else if (isAuth) {
    finalMessage = "API Key tidak valid atau tidak memiliki izin akses.";
  } else if (isOverload) {
    finalMessage = "Server Google AI sedang sibuk. Silakan coba sesaat lagi.";
  } else {
    // Clean up generic error messages
    const rawMsg = error.message || "Terjadi kesalahan tidak terduga.";
    // Remove JSON garbage if present in message
    const cleanMsg = rawMsg.replace(/\{.*"error".*\}/g, "Detail error teknis (lihat console).");
    finalMessage = `${contextPrefix}: ${cleanMsg}`;
  }

  throw new Error(finalMessage);
};

export const analyzeImageWithGemini = async (
  apiKey: string,
  base64Image: string | null,
  categoryId: CategoryId,
  userNote?: string, // Used as 'Materi/Bab' for assessment
  studentNames?: string, // New param for list of students
  kelas?: string // New param for class
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash"; 
  
  // Find the selected category configuration
  const selectedCategory = RHK_CATEGORIES.find(c => c.id === categoryId);
  if (!selectedCategory) throw new Error("Kategori RHK tidak valid");

  const rhkListString = selectedCategory.rhkList.join("\n- ");

  // --- IMAGE ANALYSIS (REQUIRED) ---
  if (!base64Image) throw new Error("Gambar diperlukan untuk analisis.");
  
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

  // Define structure instructions based on category
  let structureInstruction = "";
  let additionalInstruction = "";

  if (categoryId === 'DIGITAL') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Analisis Kebutuhan & Masalah" (Type: paragraph) -> Jelaskan masalah pembelajaran yang butuh solusi digital.
      2. Title: "Implementasi Teknologi" (Type: paragraph) -> Deskripsikan cara penggunaan alat/aplikasi dalam kegiatan.
      3. Title: "Spesifikasi Alat & Aplikasi" (Type: list) -> Sebutkan nama aplikasi, hardware, atau platform yang digunakan.
      4. Title: "Dampak & Efektivitas" (Type: list) -> Poin-poin peningkatan hasil belajar.
    `;
  } else if (categoryId === 'CHILD_FRIENDLY') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Situasi & Kondisi Awal" (Type: paragraph) -> Konteks interaksi di kelas.
      2. Title: "Bentuk Layanan Ramah Anak" (Type: paragraph) -> Deskripsi pendekatan humanis, 5S, atau pencegahan bullying.
      3. Title: "Prinsip Hak Anak" (Type: list) -> Poin hak anak yang dipenuhi.
      4. Title: "Respon Siswa" (Type: list) -> Poin respon emosional siswa.
    `;
  } else if (categoryId === 'RELIGIOUS_MODERATION') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Latar Belakang Kegiatan" (Type: paragraph) -> Konteks keberagaman atau materi ajar dalam foto.
      2. Title: "Penguatan Nilai Moderasi" (Type: paragraph) -> Narasi penanaman nilai yang terjadi.
      3. Title: "Indikator Sikap Moderat" (Type: list) -> Poin sikap yang muncul dalam kegiatan.
    `;
  } else if (categoryId === 'TEACHING') {
    // This is now CHARACTER EDUCATION
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Nilai Karakter & Pembiasaan" (Type: paragraph) -> Jelaskan nilai karakter utama (Jujur, Disiplin, Gotong Royong, dll) yang dibangun dalam kegiatan ini.
      2. Title: "Deskripsi Pelaksanaan" (Type: paragraph) -> Gambarkan bagaimana proses penanaman karakter dilakukan.
      3. Title: "Refleksi & Dampak" (Type: list) -> Poin perubahan perilaku positif yang diharapkan/terlihat pada siswa.
    `;
  } else if (categoryId === 'COMPETITION') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Identitas Kompetisi" (Type: paragraph) -> Jelaskan Nama Lomba, Tingkat (Sekolah/Kab/Prov/Nasional), dan Penyelenggara berdasarkan sertifikat/foto.
      2. Title: "Persiapan & Pelaksanaan" (Type: paragraph) -> Deskripsikan proses pembimbingan atau keikutsertaan dalam lomba tersebut.
      3. Title: "Hasil & Prestasi" (Type: list) -> Poin capaian, penghargaan, atau pengalaman yang didapat.
    `;
  } else if (categoryId === 'COMPETENCY') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Identitas Kegiatan" (Type: paragraph) -> Jelaskan Nama Pelatihan/Bimtek/Seminar, Penyelenggara, dan Waktu Pelaksanaan.
      2. Title: "Materi & Pelaksanaan" (Type: paragraph) -> Deskripsikan ringkasan materi yang dipelajari atau kegiatan yang dilakukan.
      3. Title: "Rencana Tindak Lanjut" (Type: list) -> Poin-poin implementasi ilmu yang didapat untuk diterapkan di madrasah.
    `;
  } else if (categoryId === 'LEARNING_DEVICE') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Fokus Penyusunan" (Type: paragraph) -> Jelaskan jenis perangkat (RPP/Modul/Silabus) dan materi/kelas yang dituju.
      2. Title: "Integrasi & Inovasi" (Type: paragraph) -> Deskripsikan bagaimana perangkat ini memuat pendidikan karakter, numerasi, atau inovasi lainnya.
      3. Title: "Komponen Perangkat" (Type: list) -> Poin-poin utama yang ada di dalam dokumen perangkat pembelajaran tersebut.
    `;
  } else if (categoryId === 'TALENT') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Tujuan Program" (Type: paragraph) -> Jelaskan tujuan pemetaan atau pengembangan bakat minat siswa.
      2. Title: "Metode Pelaksanaan" (Type: paragraph) -> Deskripsikan cara pengumpulan data, seleksi, atau pelaksanaan program pembinaan.
      3. Title: "Hasil Pemetaan/Pembinaan" (Type: list) -> Poin-poin temuan bakat siswa atau hasil dari program yang dijalankan.
    `;
  } else if (categoryId === 'MANAGEMENT') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Konteks Administrasi" (Type: paragraph) -> Jelaskan dokumen atau kegiatan tata kelola yang sedang dikerjakan (RKT, SK, Akreditasi, dll).
      2. Title: "Proses Pelaksanaan" (Type: paragraph) -> Deskripsikan tahapan penyusunan, rapat, atau verifikasi data yang dilakukan.
      3. Title: "Output & Tindak Lanjut" (Type: list) -> Poin-poin dokumen yang dihasilkan atau langkah selanjutnya dari kegiatan ini.
    `;
  } else if (categoryId === 'HEALTH') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Tujuan Kegiatan" (Type: paragraph) -> Jelaskan tujuan pemeriksaan kesehatan atau pembinaan pranikah.
      2. Title: "Pelaksanaan & Pihak Terlibat" (Type: paragraph) -> Deskripsikan jalannya kegiatan dan siapa saja yang terlibat (Puskesmas, Guru, Siswa).
      3. Title: "Hasil & Rekomendasi" (Type: list) -> Poin-poin hasil pemeriksaan atau rekomendasi tindak lanjut untuk siswa.
    `;
  } else if (categoryId === 'CUSTOM') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Konteks Kegiatan" (Type: paragraph) -> Deskripsikan secara umum apa yang terlihat pada foto/dokumen.
      2. Title: "Rincian Pelaksanaan" (Type: paragraph) -> Jelaskan detail aktivitas, proses, atau informasi penting yang ada.
      3. Title: "Hasil & Kesimpulan" (Type: list) -> Poin-poin hasil, dampak, atau kesimpulan dari kegiatan tersebut.
    `;
  }

  // HYBRID LOGIC: If student names are provided, ask to generate grades.
  // Applies to Religious Moderation, Teaching (Character Education), Competition, Talent, Health, and Custom
  if (studentNames && (categoryId === 'RELIGIOUS_MODERATION' || categoryId === 'TEACHING' || categoryId === 'COMPETITION' || categoryId === 'TALENT' || categoryId === 'HEALTH' || categoryId === 'CUSTOM')) {
    
    let focusValue = "";
    let gradingInstruction = "";

    if (categoryId === 'COMPETITION') {
      focusValue = "Kategori/Cabang Lomba";
      gradingInstruction = "Untuk 'predikat', gunakan kode berikut: 'SB' = Juara/Terbaik, 'B' = Finalis/Baik, 'C' = Peserta. Di 'deskripsi', tuliskan capaian spesifik (Juara 1, Harapan 2, Peserta Aktif, dll).";
    } else if (categoryId === 'TALENT') {
      focusValue = "Bidang Bakat/Minat";
      gradingInstruction = "Untuk 'predikat', gunakan 'SB' (Sangat Berbakat), 'B' (Berbakat), 'C' (Cukup), 'K' (Kurang). Di 'deskripsi', tuliskan potensi spesifik siswa.";
    } else if (categoryId === 'HEALTH') {
      focusValue = "Fokus Pemeriksaan/Pembinaan";
      gradingInstruction = "Untuk 'predikat', gunakan 'SB' (Sangat Sehat/Paham), 'B' (Sehat/Paham), 'C' (Cukup), 'K' (Kurang). Di 'deskripsi', tuliskan hasil pemeriksaan atau tingkat pemahaman.";
    } else if (categoryId === 'CUSTOM') {
      focusValue = "Fokus Utama Kegiatan";
      gradingInstruction = "Untuk setiap siswa, berikan nilai (SB/B/C/K) dan deskripsi capaian/keterlibatan yang relevan dengan kegiatan di foto.";
    } else {
      focusValue = categoryId === 'RELIGIOUS_MODERATION' 
          ? "Prinsip Moderasi Beragama (Tasamuh, Tawazun, dll)" 
          : "Nilai Karakter Utama (Disiplin, Tanggung Jawab, Integritas, dll)";
      gradingInstruction = "Untuk setiap siswa, berikan nilai (SB/B/C/K) dan deskripsi sikap yang relevan dengan nilai karakter/moderasi yang kamu temukan di foto.";
    }

    additionalInstruction = `
      TUGAS TAMBAHAN (Wajib karena ada daftar siswa):
      1. Analisis visual foto/sertifikat untuk menentukan SATU ${focusValue} yang paling dominan/relevan. Isi ke field 'prinsipModerasi'.
      2. Gunakan daftar nama siswa berikut:
         ${studentNames}
      3. Buat objek 'studentGrades'. ${gradingInstruction}
      4. Field 'kelas' diisi dengan: "${kelas || 'Umum'}".
    `;
  }

  const prompt = `
    Saya mengirimkan foto kegiatan guru. Konteks: ${selectedCategory.title}.
    ${userNote ? `\nCATATAN KHUSUS PENGGUNA: "${userNote}"` : ''}
    
    Tugas Utama:
    1. Identifikasi visual foto.
    2. Pilih SATU Judul RHK yang paling cocok dari daftar:
    ${rhkListString}
    3. Tentukan jenis kegiatan (Intrakurikuler/Kokurikuler/Ekstrakurikuler).
    4. Isi field 'caption': Deskripsi singkat dan formal (1 kalimat) tentang foto.
    5. ${structureInstruction}
    
    ${additionalInstruction}

    Gunakan Bahasa Indonesia formal untuk laporan resmi dinas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            judul_terpilih: { type: Type.STRING },
            jenis_kegiatan: { type: Type.STRING, enum: ["Intrakurikuler", "Kokurikuler", "Ekstrakurikuler"] },
            caption: { type: Type.STRING },
            // Optional fields for hybrid mode
            prinsipModerasi: { type: Type.STRING },
            kelas: { type: Type.STRING },
            studentGrades: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    nama: { type: Type.STRING },
                    predikat: { type: Type.STRING, enum: ["SB", "B", "C", "K"] },
                    deskripsi: { type: Type.STRING }
                  },
                  required: ["nama", "predikat", "deskripsi"]
                }
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["paragraph", "list"] },
                  content: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "type", "content"]
              }
            }
          },
          required: ["judul_terpilih", "jenis_kegiatan", "caption", "sections"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as AnalysisResult;
    return result;

  } catch (error: any) {
    handleGeminiError(error, "Gagal menganalisis foto");
  }
};