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
        <p className="text-zinc-500 mb-4">Equipo no encontrado</p>
        <Link href="/equipos" className="text-green-500 font-black uppercase text-xs tracking-widest">
          ← Volver
        </Link>
      </div>
    );
  }

  // ORDEN POR GOLES (MÁXIMOS ANOTADORES PRIMERO)
  const jugadoresOrdenados = equipo.jugadores?.sort((a: any, b: any) => b.goles - a.goles) || [];

  return (
    <main className="p-4 md:p-12 bg-black text-white min-h-screen font-sans pt-24">
      <div className="max-w-4xl mx-auto">
        <Link href="/equipos" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors">
          ← Volver a Equipos
        </Link>

        <header className="mt-8 mb-12 flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
            <Image 
              src={`/escudos/${id}.png`} 
              alt={`Escudo de ${equipo.nombre}`}
              fill
              className="object-contain"
            />
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
              {equipo.nombre}
            </h1>
            
            <div className="flex gap-8 mt-6 border-y border-zinc-800/50 py-6 justify-center md:justify-start">
              <div>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Puntos</p>
                <p className="text-2xl font-black text-green-500">{equipo.puntos}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">PJ</p>
                <p className="text-2xl font-black">{equipo.pj}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">DG</p>
                <p className="text-2xl font-black italic">{equipo.df > 0 ? `+${equipo.df}` : equipo.df}</p>
              </div>
            </div>
          </div>
        </header>

        <section>
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 italic px-2">Goleadores del Equipo</h2>
          <div className="grid grid-cols-1 gap-3">
            {jugadoresOrdenados.map((jugador: any) => (
              <div key={jugador.id} className="group bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-[1.5rem] flex justify-between items-center hover:bg-zinc-900 transition-all">
                
                <div className="flex items-center gap-4">
                  <span className="font-black text-green-500 w-6 text-center italic">
                    {jugador.numero_camiseta || '--'}
                  </span>
                  <p className="font-bold uppercase text-sm tracking-tight">
                    {jugador.nombre}
                  </p>
                  <div className="flex gap-1">
                    {jugador.sanciones?.map((s: any, i: number) => (
                      <div key={i} className={`w-2.5 h-3.5 rounded-[1px] ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'}`} />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 min-w-[60px] justify-end">
                  <span className={`font-black text-sm ${jugador.goles > 0 ? 'text-green-500' : 'text-zinc-700'}`}>
                    {jugador.goles}
                  </span>
                  <span className="text-xs opacity-60">⚽</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}