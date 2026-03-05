import { NextRequest, NextResponse } from "next/server";
import { generateImageWithPhoto } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const photo = formData.get("photo") as File | null;
    const prompt = formData.get("prompt") as string | null;
    const aspectRatio = (formData.get("aspectRatio") as string) || undefined;
    const imageSize = (formData.get("imageSize") as string) || undefined;

    if (!photo || !prompt) {
      return NextResponse.json(
        { error: "photo and prompt are required" },
        { status: 400 },
      );
    }

    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = photo.type || "image/jpeg";

    const result = await generateImageWithPhoto(buffer, mimeType, prompt, {
      aspectRatio,
      imageSize,
    });
    const base64 = result.toString("base64");

    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error("Generate with photo error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 },
    );
  }
}
