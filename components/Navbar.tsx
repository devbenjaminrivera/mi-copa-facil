'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Cierra el menú al hacer clic en un enlace en móvil
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. LOGO CEVI */}
          <Link href="/" className="flex items-center gap-3 z-50">
            {/* Si tienes un logo en /public, ajusta la ruta aquí */}
            <div className="relative w-8 h-8 md:w-10 md:h-10">
              <Image src="/logo.png" alt="cevi" fill className="object-contain" />
            </div>
            <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white">
              COPA <span className="text-green-500">CEVI</span>
            </span>
          </Link>

          {/* 2. ENLACES VERSIÓN PC (Ocultos en móvil con hidden md:flex) */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-green-500 transition-colors">
              Dashboard
            </Link>
            <Link href="/equipos" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-green-500 transition-colors">
              Equipos
            </Link>
            <Link href="/resultados" className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-green-500 transition-colors">
              Partidos
            </Link>
            <Link href="/login" className="bg-white/10 hover:bg-white text-white hover:text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">
              Login →
            </Link>
          </div>

          {/* 3. BOTÓN HAMBURGUESA VERSIÓN MÓVIL (Oculto en PC con md:hidden) */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-zinc-400 hover:text-white p-2 focus:outline-none z-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                // Ícono de "X" cuando está abierto
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                // Ícono de 3 rayas cuando está cerrado
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 4. MENÚ DESPLEGABLE MÓVIL */}
      <div 
        className={`md:hidden absolute top-20 left-0 w-full bg-zinc-950 border-b border-zinc-800 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
        }`}
      >
        <div className="flex flex-col gap-4 px-6">
          <Link onClick={closeMenu} href="/" className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-green-500 py-2 border-b border-zinc-900">
            Dashboard
          </Link>
          <Link onClick={closeMenu} href="/equipos" className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-green-500 py-2 border-b border-zinc-900">
            Equipos
          </Link>
          <Link onClick={closeMenu} href="/resultados" className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-green-500 py-2 border-b border-zinc-900">
            Partidos
          </Link>
          <Link onClick={closeMenu} href="/login" className="mt-4 bg-green-600 text-black text-center py-3 rounded-xl text-xs font-black uppercase tracking-widest">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}