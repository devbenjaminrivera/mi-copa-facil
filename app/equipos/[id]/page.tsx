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
          ← Volver a la lista
        </Link>
      </div>
    );
  }

  // Ordenamos por goles (máximos anotadores primero)
  const jugadoresOrdenados = equipo.jugadores?.sort((a: any, b: any) => b.goles - a.goles) || [];

  return (
    <main className="p-4 md:p-12 bg-black text-white min-h-screen font-sans pt-12">
      <div className="max-w-4xl mx-auto">
        
        {/* BOTÓN VOLVER (Estilo Minimalista de pagenuevo) */}
        <Link href="/equipos" className="inline-block border border-white/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-sm mb-12">
          ← VOLVER A EQUIPOS
        </Link>

        {/* HEADER: ESTILO "PAGENUEVO" (Centralizado y Premium) */}
        <header className="flex flex-col items-center text-center mb-20">
          <div className="relative w-48 h-48 mb-6 drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <Image 
              src={`/escudos/${id}.png`} 
              alt={equipo.nombre}
              fill
              className="object-contain"
            />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-green-500 mb-8 leading-none">
            {equipo.nombre}
          </h1>
          
          <div className="flex gap-12 md:gap-20">
            <div className="text-center">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] italic mb-1">Puntos</p>
              <p className="text-5xl font-black">{equipo.puntos}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] italic mb-1">PJ</p>
              <p className="text-5xl font-black">{equipo.pj}</p>
            </div>
          </div>
        </header>

        {/* PLANTILLA: ESTILO "PAGE" (Lista Oscura y Elegante) */}
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] italic">
              Plantilla Oficial
            </h2>
            <span className="text-[10px] text-zinc-700 font-black uppercase">Goles / Tarjetas</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {jugadoresOrdenados.map((jugador: any) => (
              <div 
                key={jugador.id} 
                className="group bg-zinc-900/40 border border-zinc-800/50 p-5 rounded-2xl flex justify-between items-center hover:bg-zinc-900 transition-all hover:border-zinc-700"
              >
                
                <div className="flex items-center gap-4">
                  {/* Número de camiseta con estilo neón suave */}
                  <span className="font-black text-green-500 w-6 text-center italic text-lg">
                    {jugador.numero_camiseta || '--'}
                  </span>

                  <div>
                    <p className="font-bold uppercase text-sm tracking-tight text-zinc-200 group-hover:text-white transition-colors">
                      {jugador.nombre}
                    </p>
                    {/* Indicador de goles pequeño bajo el nombre */}
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                      Stats: {jugador.goles} Goles
                    </p>
                  </div>
                  
                  {/* Tarjetas de sanciones */}
                  <div className="flex gap-1 ml-2">
                    {jugador.sanciones?.map((s: any, i: number) => (
                      <div 
                        key={i} 
                        className={`w-2.5 h-3.5 rounded-[1px] shadow-sm shadow-black ${
                          s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Lado derecho: Contador de goles destacado */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-xl font-black italic ${jugador.goles > 0 ? 'text-green-500' : 'text-zinc-800'}`}>
                      {jugador.goles}
                    </span>
                  </div>
                  <span className="text-sm grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">⚽</span>
                </div>

              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}