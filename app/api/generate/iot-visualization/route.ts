import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/gemini";
import { buildIoTVisualizationPrompt } from "@/lib/iot-prompt";

export async function POST(req: NextRequest) {
  try {
    const { name, description, mcu, components, userNotes } = await req.json();

    if (!name || !Array.isArray(components)) {
      return NextResponse.json(
        { error: "name and components[] are required" },
        { status: 400 },
      );
    }

    const prompt = buildIoTVisualizationPrompt(
      { name, description, mcu, components },
      userNotes,
    );

    const buffer = await generateImage(prompt, {
      aspectRatio: "16:9",
      imageSize: "1K",
    });
    const base64 = buffer.toString("base64");

    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
      prompt,
    });
  } catch (error) {
    console.error("IoT visualization error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 },
    );
  }
}
