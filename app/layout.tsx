import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Copa CEVI | Torneo de Fútbol",
  description: "Sistema de gestión y resultados para el torneo Copa CEVI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black pt-16 text-white">
        {/* Aquí renderizamos la Navbar para que aparezca en todas las páginas */}
        <Navbar />
        
        {/* Aquí se renderiza el contenido de cada página (page.tsx) */}
        {children}
        <Analytics />
      </body>
    </html>
  );
}