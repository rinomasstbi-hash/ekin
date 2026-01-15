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

    // HYBRID LOGIC: If student names are provided, ask to generate grades too.
    if (studentNames) {
      additionalInstruction = `
        TUGAS TAMBAHAN (Wajib karena ada daftar siswa):
        1. Analisis visual foto untuk menentukan SATU Prinsip Moderasi Beragama yang paling dominan/relevan (Contoh: Tasamuh, Tawazun, Hubbul Wathon, dll). Isi ke field 'prinsipModerasi'.
        2. Gunakan daftar nama siswa berikut:
           ${studentNames}
        3. Buat objek 'studentGrades'. Untuk setiap siswa, berikan nilai (SB/B/C/K) dan deskripsi sikap yang relevan dengan prinsip moderasi yang kamu temukan di foto.
        4. Field 'kelas' diisi dengan: "${kelas || 'Umum'}".
      `;
    }
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