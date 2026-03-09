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
 * Generate an image from one or more photos + text prompt using Gemini Nano Banana Pro.
 */
export async function generateImageWithPhoto(
  photos: Array<{ buffer: Buffer; mimeType: string }>,
  prompt: string,
  options: GenerateOptions = {},
): Promise<Buffer> {
  const { aspectRatio = "3:4", imageSize = "1K" } = options;

  const inputParts = photos.map((photo) => ({
    inlineData: { mimeType: photo.mimeType, data: photo.buffer.toString("base64") },
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: [{ role: "user", parts: [...inputParts, { text: prompt }] }],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: { aspectRatio, imageSize },
    },
  });

  const responseParts = response.candidates?.[0]?.content?.parts;
  if (!responseParts) throw new Error("No response from Gemini");

  for (const part of responseParts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error("No image in Gemini response");
}
