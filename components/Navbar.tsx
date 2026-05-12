'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { href: '/',           label: 'Dashboard'  },
  { href: '/equipos',    label: 'Equipos'    },
  { href: '/resultados', label: 'Resultados' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/98 backdrop-blur-sm border-b border-zinc-900"
      style={{ fontFamily: "'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif" }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-14">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative w-7 h-7 shrink-0">
              <Image src="/logo.png" alt="Copa CEVI" fill className="object-contain" />
            </div>
            <div className="flex items-baseline gap-1">
              <span
                style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", letterSpacing: '-0.02em' }}
                className="text-lg font-black italic uppercase text-white leading-none"
              >
                COPA
              </span>
              <span
                style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", letterSpacing: '-0.02em' }}
                className="text-lg font-black italic uppercase text-green-500 leading-none group-hover:text-green-400 transition-colors"
              >
                CEVI
              </span>
            </div>            
          </Link>

          {/* NAV DESKTOP — separadores verticales entre links */}
          <div className="hidden md:flex items-center">
            {NAV_LINKS.map(({ href, label }, i) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <div key={href} className="flex items-center">
                  {i > 0 && <div className="w-px h-3 bg-zinc-800 mx-1" />}
                  <Link
                    href={href}
                    className="relative px-3 py-1 group"
                  >
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors
                      ${isActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'}
                    `}>
                      {label}
                    </span>
                    {/* LÍNEA ACTIVA */}
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-green-500"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* DERECHA DESKTOP */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 hover:text-green-500 transition-colors border-l border-zinc-900 pl-4"
            >
              Admin →
            </Link>
          </div>

          {/* HAMBURGUESA MÓVIL */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex flex-col gap-[5px] p-2 group"
            aria-label="Menú"
          >
            <motion.div
              animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-5 h-[1.5px] bg-zinc-400 group-hover:bg-white transition-colors origin-center"
            />
            <motion.div
              animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.15 }}
              className="w-5 h-[1.5px] bg-zinc-400 group-hover:bg-white transition-colors"
            />
            <motion.div
              animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
              className="w-5 h-[1.5px] bg-zinc-400 group-hover:bg-white transition-colors origin-center"
            />
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden border-t border-zinc-900 bg-[#0a0a0a]"
          >
            <div className="px-4 py-4 space-y-0">
              {NAV_LINKS.map(({ href, label }, i) => {
                const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between py-4 border-b border-zinc-900 group`}
                    >
                      <span
                        style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", letterSpacing: '-0.01em' }}
                        className={`text-2xl font-black italic uppercase transition-colors
                          ${isActive ? 'text-white' : 'text-zinc-700 group-hover:text-zinc-300'}
                        `}
                      >
                        {label}
                      </span>
                      {isActive
                        ? <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                        : <span className="text-zinc-800 text-xs font-black group-hover:text-zinc-600 transition-colors">→</span>
                      }
                    </Link>
                  </motion.div>
                );
              })}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="pt-4"
              >
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700 hover:text-green-500 transition-colors"
                >
                  Panel de administración →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}