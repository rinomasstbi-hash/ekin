import { GoogleGenAI, Type } from "@google/genai";
import { RHK_CATEGORIES } from "../constants";
import { AnalysisResult, CategoryId } from "../types";

export const analyzeImageWithGemini = async (
  apiKey: string,
  base64Image: string,
  categoryId: CategoryId
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash"; 
  
  // Find the selected category configuration
  const selectedCategory = RHK_CATEGORIES.find(c => c.id === categoryId);
  if (!selectedCategory) throw new Error("Kategori RHK tidak valid");

  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");
  const rhkListString = selectedCategory.rhkList.join("\n- ");

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
    
    Tugas:
    1. Identifikasi visual foto.
    2. Pilih SATU Judul RHK yang paling cocok dari daftar:
    ${rhkListString}
    3. Tentukan jenis kegiatan (Intrakurikuler/Kokurikuler/Ekstrakurikuler).
    4. ${structureInstruction}
    
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
          required: ["judul_terpilih", "jenis_kegiatan", "sections"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Gagal menganalisis foto. Pastikan API Key benar dan koneksi internet stabil.");
  }
};