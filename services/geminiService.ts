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
  base64Image: string | null, // Made nullable
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

  // --- BRANCH 1: STUDENT ASSESSMENT (TEXT ONLY) ---
  if (categoryId === 'STUDENT_ASSESSMENT') {
    if (!studentNames) throw new Error("Daftar nama siswa diperlukan.");
    
    const prompt = `
      Saya butuh tabel penilaian sikap moderasi beragama siswa.
      Daftar Nama Siswa: 
      ${studentNames}

      Konteks:
      - Kelas: ${kelas || 'Umum'}
      - Materi/Bab Pembelajaran: ${userNote || 'Materi Umum Moderasi Beragama'}
      
      Tugas:
      1. Pilih SATU Prinsip Moderasi Beragama yang paling relevan dengan materi "${userNote}" dari daftar berikut: Tasamuh (Toleransi), Tawazun (Seimbang), I'tidal (Lurus/Adil), Hubbul Wathon (Cinta Tanah Air), Syura (Musyawarah), Islah (Perbaikan), Qudwah (Keteladanan), Muwathonah (Kewarganegaraan).
      2. Set 'judul_terpilih' menjadi "Penilaian Sikap [Prinsip yang dipilih]".
      3. Set 'caption' menjadi deskripsi singkat materi dalam 1 kalimat (misal: "Penilaian sikap pada materi [Materi] di kelas [Kelas]").
      4. Untuk SETIAP nama siswa, berikan nilai predikat secara ACAK namun realistis (mayoritas B atau SB, sedikit C atau K). Pilihan: SB (Sangat Baik), B (Baik), C (Cukup), K (Kurang).
      5. Berikan deskripsi singkat untuk setiap nilai (misal: SB = "Sangat konsisten menunjukkan sikap...", K = "Perlu bimbingan dalam...").
      
      Output JSON only.
    `;

    try {
       const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              judul_terpilih: { type: Type.STRING },
              jenis_kegiatan: { type: Type.STRING, enum: ["Penilaian Pembelajaran"] },
              caption: { type: Type.STRING },
              prinsipModerasi: { type: Type.STRING },
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
              sections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {title: {type: Type.STRING}, type: {type: Type.STRING}, content: {type: Type.ARRAY, items: {type: Type.STRING}}} } } // Empty array holder
            },
            required: ["judul_terpilih", "caption", "studentGrades", "prinsipModerasi"]
          }
        }
      });
      
      const text = response.text;
      if (!text) throw new Error("No response from AI");
      const result = JSON.parse(text) as AnalysisResult;
      // Manually set empty sections if AI omits it
      if(!result.sections) result.sections = [];
      return result;

    } catch (error: any) {
      handleGeminiError(error, "Gagal membuat penilaian siswa");
    }
  }

  // --- BRANCH 2: IMAGE ANALYSIS (ORIGINAL) ---
  if (!base64Image) throw new Error("Gambar diperlukan untuk kategori ini.");
  
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

  // Define structure instructions based on category
  let structureInstruction = "";

  if (categoryId === 'DIGITAL') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Analisis Kebutuhan & Masalah" (Type: paragraph) -> Jelaskan masalah pembelajaran (misal: abstrak, membosankan) yang butuh solusi digital.
      2. Title: "Implementasi Teknologi" (Type: paragraph) -> Deskripsikan cara penggunaan alat/aplikasi dalam kegiatan.
      3. Title: "Spesifikasi Alat & Aplikasi" (Type: list) -> Sebutkan nama aplikasi, hardware, atau platform yang digunakan (misal: Canva, Quizizz, LCD Proyektor).
      4. Title: "Dampak & Efektivitas" (Type: list) -> Poin-poin peningkatan hasil belajar atau motivasi siswa.
    `;
  } else if (categoryId === 'CHILD_FRIENDLY') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Situasi & Kondisi Awal" (Type: paragraph) -> Konteks interaksi di kelas.
      2. Title: "Bentuk Layanan Ramah Anak" (Type: paragraph) -> Deskripsi pendekatan humanis, 5S, atau pencegahan bullying.
      3. Title: "Prinsip Hak Anak" (Type: list) -> Poin hak anak yang dipenuhi (misal: Non-diskriminasi, Hak didengar).
      4. Title: "Respon Siswa" (Type: list) -> Poin respon emosional siswa (misal: Senang, Merasa aman).
    `;
  } else if (categoryId === 'RELIGIOUS_MODERATION') {
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Latar Belakang Kegiatan" (Type: paragraph) -> Konteks keberagaman atau materi ajar.
      2. Title: "Penguatan Nilai Moderasi" (Type: paragraph) -> Narasi penanaman nilai.
      3. Title: "Indikator Sikap Moderat" (Type: list) -> Poin sikap yang muncul (Tasamuh, Tawazun, I'tidal, Hubbul Wathon).
    `;
  } else {
    // TEACHING
    structureInstruction = `
      Buat struktur laporan dengan sections berikut:
      1. Title: "Latar Belakang" (Type: paragraph) -> Alasan pedagogis kegiatan.
      2. Title: "Deskripsi Kegiatan" (Type: paragraph) -> Jalannya pembelajaran.
      3. Title: "Nilai Karakter (Profil Pelajar)" (Type: list) -> Nilai karakter yang dikuatkan.
    `;
  }

  const prompt = `
    Saya mengirimkan foto kegiatan guru. Konteks: ${selectedCategory.title}.
    ${userNote ? `\nCATATAN KHUSUS PENGGUNA: "${userNote}"` : ''}
    
    Tugas:
    1. Identifikasi visual foto.
    2. Pilih SATU Judul RHK yang paling cocok dari daftar:
    ${rhkListString}
    (Jika catatan pengguna lebih spesifik, boleh sesuaikan judul sedikit agar relevan, tapi tetap mengacu pada daftar RHK).
    3. Tentukan jenis kegiatan (Intrakurikuler/Kokurikuler/Ekstrakurikuler).
    4. Isi field 'caption':
       - JIKA ada CATATAN KHUSUS PENGGUNA: Gunakan catatan tersebut sebagai caption.
       - JIKA TIDAK ADA catatan: Buatlah deskripsi singkat (maksimal 1 kalimat, formal) tentang apa yang terlihat di gambar (Contoh: "Guru sedang memberikan penjelasan materi di depan kelas").
    5. ${structureInstruction}
    
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