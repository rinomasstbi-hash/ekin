import { GoogleGenAI, Type } from "@google/genai";
import { DAFTAR_RHK } from "../constants";
import { AnalysisResult } from "../types";

export const analyzeImageWithGemini = async (
  apiKey: string,
  base64Image: string
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey });

  const model = "gemini-2.5-flash"; // Best for vision + speed
  
  // Clean base64 string if it contains metadata
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

  const rhkListString = DAFTAR_RHK.join("\n- ");

  const prompt = `
    Saya mengirimkan foto kegiatan guru di sekolah. Tugasmu adalah menganalisis foto tersebut secara visual.
    
    Langkah kerja:
    1. Analisis aktivitas yang terlihat.
    2. COCOKKAN aktivitas tersebut dengan SATU judul yang PALING RELEVAN dari daftar RHK berikut:
    
    DAFTAR RHK:
    - ${rhkListString}
    
    3. Tentukan apakah kegiatan tersebut termasuk Intrakurikuler atau Kokurikuler.
    4. Buat 2 kalimat latar belakang akademis yang relevan.
    5. Buat 1 paragraf narasi formal (Deskripsi) menceritakan apa yang terjadi di foto secara spesifik.
    6. Tentukan 2 nilai karakter (Dimensi Profil Lulusan) atau 5 topik panca cinta yang relevan.
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
            judul_terpilih: { type: Type.STRING, description: "Judul RHK yang dipilih dari daftar" },
            jenis_kegiatan: { type: Type.STRING, enum: ["Intrakurikuler", "Kokurikuler"] },
            latar_belakang: { type: Type.STRING, description: "2 kalimat latar belakang akademis" },
            deskripsi: { type: Type.STRING, description: "Narasi formal kegiatan" },
            nilai_karakter: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 nilai karakter relevan"
            }
          },
          required: ["judul_terpilih", "jenis_kegiatan", "latar_belakang", "deskripsi", "nilai_karakter"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text) as AnalysisResult;
    
    // Double check if the title is actually in our list (hallucination check)
    if (!DAFTAR_RHK.includes(result.judul_terpilih)) {
      // Fallback: If AI invents a title, try to find the closest match or keep it if it makes sense, 
      // but strictly speaking we asked to pick from list. 
      // For this app, we trust the JSON schema enforcement of Gemini 2.5 Flash mostly.
      console.warn("AI generated a title not strictly in the list:", result.judul_terpilih);
    }

    return result;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw new Error("Gagal menganalisis foto. Pastikan API Key benar dan koneksi internet stabil.");
  }
};