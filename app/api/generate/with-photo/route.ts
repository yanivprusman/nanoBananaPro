import { NextRequest, NextResponse } from "next/server";
import { generateImageWithPhoto } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const photoFiles = formData.getAll("photo") as File[];
    const prompt = formData.get("prompt") as string | null;
    const aspectRatio = (formData.get("aspectRatio") as string) || undefined;
    const imageSize = (formData.get("imageSize") as string) || undefined;

    if (photoFiles.length === 0 || !prompt) {
      return NextResponse.json(
        { error: "At least one photo and prompt are required" },
        { status: 400 },
      );
    }

    const photos = await Promise.all(
      photoFiles.map(async (file) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        mimeType: file.type || "image/jpeg",
      })),
    );

    const result = await generateImageWithPhoto(photos, prompt, {
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
