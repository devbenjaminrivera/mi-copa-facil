import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PerfilEquipo({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const { data: equipo, error } = await supabase
    .from('equipos')
    .select(`
      nombre,
      pj, puntos, pg, pe, pp, gf, gc, df,
      jugadores!id_equipo (
        id,
        nombre,
        goles,
        numero_camiseta,
        sanciones (tipo)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !equipo) {
    return (
      <div className="p-20 text-center bg-black text-white min-h-screen">
        <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-6">Equipo no encontrado</p>
        <Link href="/equipos" className="text-green-500 font-black uppercase text-xs tracking-widest hover:text-green-400 transition-colors">
          ← Volver a equipos
        </Link>
      </div>
    );
  }

  const jugadoresOrdenados = equipo.jugadores?.sort((a: any, b: any) => b.goles - a.goles) || [];
  const goleadores = jugadoresOrdenados.filter((j: any) => j.goles > 0);
  const sinGoles = jugadoresOrdenados.filter((j: any) => !j.goles || j.goles === 0);

  return (
    <main className="bg-black text-white min-h-screen font-sans">
      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-20 pb-20">

        {/* BACK */}
        <Link
          href="/equipos"
          className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 hover:text-white transition-colors mb-10"
        >
          ← Equipos
        </Link>

        {/* HERO HEADER */}
        <header className="flex flex-col items-center text-center mb-14">
          <div className="relative w-36 h-36 md:w-48 md:h-48 mb-8 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
            <Image
              src={`/escudos/${id}.png`}
              alt={equipo.nombre}
              fill
              className="object-contain"
            />
          </div>

          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none mb-10">
            {equipo.nombre}
          </h1>

          {/* STATS GRID */}
          <div className="grid grid-cols-4 gap-px bg-zinc-800/60 rounded-2xl overflow-hidden border border-zinc-800/60 w-full max-w-sm">
            {[
              { label: 'Puntos', value: equipo.puntos, color: 'text-green-400' },
              { label: 'PJ', value: equipo.pj, color: 'text-white' },
              { label: 'GF', value: equipo.gf, color: 'text-white' },
              { label: 'DG', value: (equipo.df ?? 0) > 0 ? `+${equipo.df}` : equipo.df, color: (equipo.df ?? 0) >= 0 ? 'text-green-400' : 'text-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-zinc-900/60 flex flex-col items-center py-4 px-2">
                <span className={`text-2xl font-black tabular-nums ${color}`}>{value ?? 0}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mt-0.5">{label}</span>
              </div>
            ))}
          </div>

          {/* G E P */}
          <div className="flex items-center gap-4 mt-4">
            {[
              { label: 'Victorias', value: equipo.pg, color: 'text-green-500' },
              { label: 'Empates',   value: equipo.pe, color: 'text-yellow-500' },
              { label: 'Derrotas',  value: equipo.pp, color: 'text-red-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`text-sm font-black ${color}`}>{value ?? 0}</span>
                <span className="text-[8px] font-black uppercase tracking-wider text-zinc-600">{label}</span>
              </div>
            ))}
          </div>
        </header>

        {/* PLANTILLA */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 shrink-0">
              Plantilla oficial · {jugadoresOrdenados.length} jugadores
            </p>
            <div className="h-px flex-1 bg-zinc-900" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Goles</span>
          </div>

          <div className="space-y-2">
            {/* GOLEADORES PRIMERO */}
            {goleadores.map((jugador: any) => (
              <JugadorRow key={jugador.id} jugador={jugador} destacado />
            ))}

            {/* SEPARADOR si hay ambos grupos */}
            {goleadores.length > 0 && sinGoles.length > 0 && (
              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-zinc-900" />
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-800">Sin goles</span>
                <div className="h-px flex-1 bg-zinc-900" />
              </div>
            )}

            {/* RESTO */}
            {sinGoles.map((jugador: any) => (
              <JugadorRow key={jugador.id} jugador={jugador} />
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}

function JugadorRow({ jugador, destacado = false }: { jugador: any; destacado?: boolean }) {
  const amarillas = jugador.sanciones?.filter((s: any) => s.tipo === 'amarilla') || [];
  const rojas = jugador.sanciones?.filter((s: any) => s.tipo === 'roja') || [];

  return (
    <div className={`group flex items-center justify-between border rounded-2xl px-5 py-4 transition-all
      ${destacado
        ? 'bg-zinc-900/30 border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/50'
        : 'bg-transparent border-zinc-900/60 hover:border-zinc-800 hover:bg-zinc-900/20'
      }
    `}>
      <div className="flex items-center gap-4 min-w-0">
        {/* NÚMERO CAMISETA */}
        <span className={`font-black italic text-base w-6 text-center shrink-0
          ${destacado ? 'text-green-500' : 'text-zinc-700'}
        `}>
          {jugador.numero_camiseta ?? '—'}
        </span>

        {/* NOMBRE */}
        <p className={`font-black uppercase text-sm tracking-tight truncate transition-colors
          ${destacado ? 'text-zinc-200 group-hover:text-white' : 'text-zinc-500 group-hover:text-zinc-400'}
        `}>
          {jugador.nombre}
        </p>

        {/* TARJETAS */}
        {(amarillas.length > 0 || rojas.length > 0) && (
          <div className="flex items-center gap-[3px] shrink-0">
            {amarillas.map((_: any, i: number) => (
              <div key={`a${i}`} className="w-2.5 h-3.5 rounded-[2px] bg-yellow-400 rotate-[-5deg]" />
            ))}
            {rojas.map((_: any, i: number) => (
              <div key={`r${i}`} className="w-2.5 h-3.5 rounded-[2px] bg-red-600 rotate-[5deg]" />
            ))}
          </div>
        )}
      </div>

      {/* GOLES */}
      <div className="flex items-center gap-2 shrink-0 ml-3">
        {jugador.goles > 0 && (
          <span className="text-[10px] grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all">⚽</span>
        )}
        <span className={`font-black text-base italic tabular-nums
          ${jugador.goles > 0 ? 'text-green-400' : 'text-zinc-800'}
        `}>
          {jugador.goles}
        </span>
      </div>
    </div>
  );
}
