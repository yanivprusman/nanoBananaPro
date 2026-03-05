import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "nanoBananaPro",
  description: "AI image generation service (Gemini Nano Banana Pro)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
