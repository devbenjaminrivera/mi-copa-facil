'use client';
import Link from 'next/link';

const CARDS = [
  {
    title: 'Registrar Resultados',
    desc: 'Cierra actas de partidos, asigna goles y actualiza la tabla.',
    href: '/admin/partidos',
    accent: 'group-hover:border-green-500/60',
    accentBar: 'bg-green-500',
    shortcut: '01',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Calendario',
    desc: 'Programa fechas, horarios y organiza los próximos encuentros.',
    href: '/admin/calendario',
    accent: 'group-hover:border-blue-500/60',
    accentBar: 'bg-blue-500',
    shortcut: '02',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Jugadores',
    desc: 'Control de plantillas, inscripciones y tabla de goleadores.',
    href: '/admin/jugadores',
    accent: 'group-hover:border-yellow-500/60',
    accentBar: 'bg-yellow-500',
    shortcut: '03',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Equipos',
    desc: 'Administra los clubes, añade participantes o edita nombres.',
    href: '/admin/gestionar-equipos',
    accent: 'group-hover:border-purple-500/60',
    accentBar: 'bg-purple-500',
    shortcut: '04',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    ),
  },
  {
    title: 'Historial',
    desc: 'Auditoría de partidos. Edita o elimina registros antiguos.',
    href: '/admin/historial',
    accent: 'group-hover:border-red-500/60',
    accentBar: 'bg-red-500',
    shortcut: '05',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function AdminDashboard() {
  return (
    <div className="p-4 md:p-10 text-white font-sans">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <header className="mb-12 pt-6">
          <p className="text-green-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-3">
            Central de operaciones
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
            Panel de control
          </h1>
        </header>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative flex flex-col justify-between p-6 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl transition-all duration-200 hover:bg-zinc-900/60 ${card.accent} min-h-[160px]`}
            >
              {/* TOP ROW */}
              <div className="flex items-start justify-between mb-6">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800/80 text-zinc-400 group-hover:text-white transition-colors`}>
                  {card.icon}
                </div>
                <span className="text-[9px] font-black font-mono text-zinc-700 tracking-widest">
                  {card.shortcut}
                </span>
              </div>

              {/* CONTENT */}
              <div>
                <h2 className="text-sm font-black uppercase tracking-tight text-white mb-1.5">
                  {card.title}
                </h2>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  {card.desc}
                </p>
              </div>

              {/* ACCENT BOTTOM BAR */}
              <div className={`absolute bottom-0 left-4 right-4 h-[1.5px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${card.accentBar}`} />
            </Link>
          ))}

          {/* CARD VISTA PÚBLICA */}
          <Link
            href="/"
            className="group flex flex-col justify-between p-6 bg-transparent border border-dashed border-zinc-800/60 rounded-2xl transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/20 min-h-[160px]"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900/60 text-zinc-600 group-hover:text-zinc-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-zinc-600 group-hover:text-zinc-400 mb-1.5 transition-colors">
                Vista pública
              </h2>
              <p className="text-zinc-700 text-xs leading-relaxed">
                Ver el sitio como lo ven los participantes.
              </p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}