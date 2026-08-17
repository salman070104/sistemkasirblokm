"use server";

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function recognizeProduct(imageBase64: string, productList: { id: number; name: string; sku: string | null; price: number }[]) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: "GEMINI_API_KEY belum diatur di file .env" };
    }

    const productNames = productList.map(p => `- "${p.name}" (ID: ${p.id})`).join("\n");

    const prompt = `Kamu adalah asisten kasir toko. Lihat foto barang ini dan cocokkan dengan daftar produk di bawah ini.

DAFTAR PRODUK YANG TERSEDIA:
${productNames}

INSTRUKSI:
1. Identifikasi barang yang terlihat di foto.
2. Cocokkan dengan produk yang paling mirip dari daftar di atas.
3. Jika cocok, jawab HANYA dengan format JSON berikut (tanpa markdown, tanpa backtick):
{"found": true, "productId": <ID_PRODUK>, "productName": "<NAMA_PRODUK>", "confidence": "<TINGGI/SEDANG/RENDAH>"}

4. Jika tidak cocok dengan produk manapun, jawab:
{"found": false, "description": "<deskripsi singkat barang yang terlihat>"}

PENTING: Jawab HANYA dengan JSON, tanpa teks lain.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const text = response.text?.trim() || "";
    
    // Clean up potential markdown formatting
    const cleanedText = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    try {
      const result = JSON.parse(cleanedText);
      return { success: true, result };
    } catch {
      return { success: false, error: "AI tidak dapat mengenali barang ini. Coba foto ulang dengan lebih jelas." };
    }
  } catch (error: any) {
    console.error("Gemini API error:", error);
    
    let errorMessage = "Gagal menghubungi Gemini API";
    if (error.message) {
      try {
        const errorObj = JSON.parse(error.message);
        if (errorObj?.error?.code === 503) {
          errorMessage = "Server AI sedang sibuk (tingkat permintaan tinggi). Silakan coba lagi beberapa saat.";
        } else if (errorObj?.error?.message) {
          errorMessage = errorObj.error.message;
        }
      } catch {
        if (error.message.includes("503") || error.message.includes("high demand")) {
          errorMessage = "Server AI sedang sibuk (tingkat permintaan tinggi). Silakan coba lagi beberapa saat.";
        } else {
          errorMessage = error.message;
        }
      }
    }

    return { success: false, error: errorMessage };
  }
}
