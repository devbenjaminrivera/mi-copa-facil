import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function ListaEquipos() {
  const { data: equipos } = await supabase
    .from('equipos')
    .select('*')
    .order('nombre');

  return (
    <main className="bg-black text-white min-h-screen font-sans" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-24 pb-20">

        {/* HEADER */}
        <header className="mb-12">
          <p className="text-green-500 font-mono text-[10px] uppercase tracking-[0.35em] mb-3">
            Copa CEVI 2026
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
            Equipos
          </h1>
        </header>

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipos?.map((equipo) => (
            <Link
              key={equipo.id}
              href={`/equipos/${equipo.id}`}
              className="group bg-zinc-900/20 border border-zinc-800/60 rounded-2xl md:rounded-3xl p-10 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all flex flex-col items-center text-center"
            >
              {/* ESCUDO */}
              <div className="relative w-32 h-32 mb-6 transition-transform duration-500 group-hover:scale-110">
                <Image
                  src={`/escudos/${equipo.id}.png`}
                  alt={`Escudo de ${equipo.nombre}`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* NOMBRE */}
              <h2 className="text-xl font-black uppercase tracking-tight text-zinc-200 group-hover:text-white transition-colors">
                {equipo.nombre}
              </h2>

              {/* VER PLANTILLA */}
              <div className="mt-4 px-4 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 group-hover:border-green-500/30 group-hover:bg-green-500/10 transition-all">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-green-400">
                  Ver Plantilla →
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}
