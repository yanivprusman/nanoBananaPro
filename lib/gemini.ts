import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GenerateOptions {
  aspectRatio?: string;
  imageSize?: string;
}

/**
 * Generate an image from a text prompt using Gemini Nano Banana Pro.
 */
export async function generateImage(
  prompt: string,
  options: GenerateOptions = {},
): Promise<Buffer> {
  const { aspectRatio = "1:1", imageSize = "1K" } = options;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio, imageSize },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No response from Gemini");

  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error("No image in Gemini response");
}

/**
 * Generate an image from a photo + text prompt using Gemini Nano Banana Pro.
 */
export async function generateImageWithPhoto(
  photoBuffer: Buffer,
  mimeType: string,
  prompt: string,
  options: GenerateOptions = {},
): Promise<Buffer> {
  const { aspectRatio = "3:4", imageSize = "1K" } = options;
  const base64Photo = photoBuffer.toString("base64");

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType, data: base64Photo } },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio, imageSize },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No response from Gemini");

  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error("No image in Gemini response");
}
