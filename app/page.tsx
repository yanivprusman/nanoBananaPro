"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">nanoBananaPro</h1>
        <p className="mt-1 text-neutral-400">
          AI image generation service powered by Gemini Nano Banana Pro
        </p>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">API Endpoints</h2>
        <div className="flex flex-col gap-3 font-mono text-sm">
          <div>
            <span className="text-green-400">POST</span>{" "}
            <span className="text-neutral-300">/api/generate</span>
            <p className="mt-1 font-sans text-xs text-neutral-500">
              Text prompt to image. Body: {"{ prompt, aspectRatio?, imageSize? }"}
            </p>
          </div>
          <div>
            <span className="text-green-400">POST</span>{" "}
            <span className="text-neutral-300">/api/generate/with-photo</span>
            <p className="mt-1 font-sans text-xs text-neutral-500">
              Photo + prompt to image. FormData: photo (file), prompt, aspectRatio?, imageSize?
            </p>
          </div>
          <div>
            <span className="text-green-400">POST</span>{" "}
            <span className="text-neutral-300">/api/generate/iot-visualization</span>
            <p className="mt-1 font-sans text-xs text-neutral-500">
              IoT project visualization. Body: {"{ name, description?, mcu?, components[], userNotes? }"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Try It</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          rows={3}
          className="rounded-lg border border-neutral-700 bg-neutral-800 p-3 text-sm placeholder:text-neutral-500 focus:border-yellow-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-500 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {image && (
        <div className="overflow-hidden rounded-lg border border-neutral-800">
          <img src={image} alt="Generated" className="w-full" />
        </div>
      )}
    </div>
  );
}
