import type { Metadata } from "next";
import "./globals.css";
import { getStartPointsFile } from "@/lib/data/loaders";
import { StartPointBar } from "@/components/StartPointBar";

export const metadata: Metadata = {
  title: "VIT-AP Campus Navigator",
  description: "JSON-first campus places and services directory for VIT-AP.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { startPoints } = await getStartPointsFile();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-3xl px-4 py-6">{children}</div>
        <StartPointBar startPoints={startPoints} />
      </body>
    </html>
  );
}
