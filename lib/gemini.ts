import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface GenerateOptions {
  aspectRatio?: string;
  imageSize?: string;
}

// Pull the image bytes out of a Gemini response, or throw with the REAL
// reason it's missing (safety block, finish reason, or the model's own text
// explanation) instead of a generic "no response".
function extractImage(response: GenerateContentResponse): Buffer {
  const blockReason = response.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error(`Gemini blocked the request: ${blockReason}`);
  }

  const candidate = response.candidates?.[0];
  const parts = candidate?.content?.parts;
  const textPart = parts?.find((p) => p.text)?.text?.trim();

  const imagePart = parts?.find((p) => p.inlineData?.data);
  if (imagePart?.inlineData?.data) {
    return Buffer.from(imagePart.inlineData.data, "base64");
  }

  const finishReason = candidate?.finishReason;
  const detail = [
    finishReason && finishReason !== "STOP" ? `finish reason: ${finishReason}` : null,
    textPart ? `model said: ${textPart}` : null,
  ]
    .filter(Boolean)
    .join("; ");
  console.error("Gemini returned no image.", JSON.stringify({
    finishReason,
    safetyRatings: candidate?.safetyRatings,
    text: textPart,
  }));
  throw new Error(detail ? `Gemini returned no image (${detail})` : "Gemini returned no image");
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

  return extractImage(response);
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

  return extractImage(response);
}
