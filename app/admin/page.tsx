'use client';
import Link from 'next/link';

export default function AdminDashboard() {
  const cards = [
    {
      title: "Gestionar Equipos",
      desc: "Administra los clubes, añade nuevos participantes o edita nombres.",
      icon: "🛡️",
      href: "/admin/gestionar-equipos",
      color: "hover:border-blue-500"
    },
    {
      title: "Registrar Resultados",
      desc: "Cierra actas de partidos, asigna goles y actualiza la tabla.",
      icon: "⚽",
      href: "/admin/partidos",
      color: "hover:border-green-500"
    },
    {
      title: "Gestionar Jugadores",
      desc: "Control de plantillas, inscripciones y tabla de goleadores.",
      icon: "🏃",
      href: "/admin/jugadores",
      color: "hover:border-yellow-500"
    },
    {
      title: "Calendario y Fixture",
      desc: "Programa fechas, horarios y organiza los próximos encuentros.",
      icon: "🗓️",
      href: "/admin/calendario",
      color: "hover:border-purple-500"
    },
    {
      title: "Historial y Corrección",
      desc: "Auditoría de partidos. Edita o elimina registros antiguos.",
      icon: "📜",
      href: "/admin/historial",
      color: "hover:border-red-500"
    }
  ];

  return (
    <div className="p-4 md:p-12 bg-black min-h-screen text-white font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header con estilo Dashboard */}
        <header className="mb-12 border-b border-zinc-800 pb-8">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-green-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-2">Central de Operaciones</p>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">Panel de Control</h1>
            </div>
            <Link 
              href="/" 
              className="hidden md:block bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black px-6 py-2 rounded-full text-xs font-bold transition-all"
            >
              VISTA PÚBLICA →
            </Link>
          </div>
        </header>

        {/* Grid de Acceso Rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <Link 
              key={i}
              href={card.href} 
              className={`group relative p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-3xl transition-all duration-300 hover:bg-zinc-900 ${card.color} hover:shadow-[0_0_30px_-10px_rgba(34,197,94,0.1)]`}
            >
              <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
              <h2 className="text-xl font-black mb-3 tracking-tight group-hover:text-white transition-colors uppercase">
                {card.title}
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-4">
                {card.desc}
              </p>
              
              {/* Indicador de acción */}
              <div className="flex items-center text-[10px] font-black tracking-widest text-zinc-600 group-hover:text-white transition-colors">
                GESTIONAR <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer móvil */}
        <div className="mt-12 md:hidden">
          <Link href="/" className="block w-full text-center bg-zinc-900 border border-zinc-800 py-4 rounded-2xl text-xs font-bold">
            ← VOLVER A LA TABLA
          </Link>
        </div>
      </div>
    </div>
  );
}