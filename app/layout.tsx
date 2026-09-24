import type { Metadata } from "next";
import { Geist, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
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
      className={`${geistSans.variable} ${outfit.variable} h-full antialiased`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col font-geist pt-20 pb-10">
        <Navbar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}