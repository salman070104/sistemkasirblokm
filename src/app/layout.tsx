import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blok M Studio - Sistem Kasir",
  description: "Sistem aplikasi kasir (POS) modern oleh Blok M Studio",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex h-full min-h-full">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-muted/30 pt-14 pb-20 lg:pt-0 lg:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
