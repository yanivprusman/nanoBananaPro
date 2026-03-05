import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio, imageSize } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const buffer = await generateImage(prompt, { aspectRatio, imageSize });
    const base64 = buffer.toString("base64");

    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 },
    );
  }
}
