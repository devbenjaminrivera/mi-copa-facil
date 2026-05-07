'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/admin',                    label: 'Panel'     },
  { href: '/admin/partidos',           label: 'Partidos'  },
  { href: '/admin/calendario',         label: 'Calendario'},
  { href: '/admin/jugadores',          label: 'Jugadores' },
  { href: '/admin/gestionar-equipos',  label: 'Equipos'   },
  { href: '/admin/historial',          label: 'Historial' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="bg-black text-white h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border border-zinc-700 border-t-green-500 rounded-full animate-spin" />
          <span className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">
            Verificando acceso...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans">

      {/* HEADER STICKY */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-14">

            {/* LOGO / MARCA */}
            <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
              <div className="w-1.5 h-5 bg-green-500 rounded-full" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-white">
                Copa <span className="text-green-500">CEVI</span>
              </span>
              <span className="hidden md:block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700 ml-1 border-l border-zinc-800 pl-2">
                Admin
              </span>
            </Link>

            {/* NAV DESKTOP */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                      ${isActive
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* ACCIONES DERECHA */}
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden md:flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors px-2 py-1.5"
              >
                Vista pública
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>

              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-red-400 transition-colors px-2 py-1.5"
              >
                Salir
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>

              {/* HAMBURGUESA MÓVIL */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
              >
                {menuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* MENÚ MÓVIL */}
        <div className={`md:hidden border-t border-zinc-800/60 transition-all duration-200 overflow-hidden
          ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <nav className="flex flex-col px-4 py-3 gap-1 bg-zinc-950">
            {NAV_ITEMS.map((item) => {
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                    ${isActive
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-zinc-800 mt-2 pt-2 flex gap-2">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                Vista pública
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500/70 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 transition-all"
              >
                Cerrar sesión
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* CONTENIDO — offset por el header */}
      <main className="pt-14">
        {children}
      </main>

    </div>
  );
}