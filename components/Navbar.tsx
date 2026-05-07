'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',           label: 'Dashboard' },
  { href: '/equipos',    label: 'Equipos'   },
  { href: '/resultados', label: 'Resultados'},
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5 z-50 shrink-0">
            <div className="relative w-7 h-7 md:w-8 md:h-8">
              <Image src="/logo.png" alt="Copa CEVI" fill className="object-contain" />
            </div>
            <span className="text-base md:text-lg font-black italic tracking-tighter text-white">
              COPA <span className="text-green-500">CEVI</span>
            </span>
          </Link>

          {/* NAV DESKTOP */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                    ${isActive
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                    }
                  `}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          {/* ACCIONES DESKTOP */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 text-zinc-400 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Admin →
            </Link>
          </div>

          {/* HAMBURGUESA MÓVIL */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors z-50"
          >
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      <div className={`md:hidden border-t border-zinc-800/60 transition-all duration-200 overflow-hidden
        ${isOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="flex flex-col px-4 py-3 gap-1 bg-zinc-950">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                  ${isActive
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                  }
                `}
              >
                {label}
              </Link>
            );
          })}
          <div className="border-t border-zinc-800 mt-2 pt-2">
            <Link
              href="/login"
              onClick={closeMenu}
              className="block w-full text-center py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-800 hover:border-zinc-700 hover:text-white transition-all"
            >
              Admin →
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}