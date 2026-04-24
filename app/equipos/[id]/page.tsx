import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function PerfilEquipo({ params }: { params: { id: string } }) {
  
  // 1. Añadimos 'goles' a la consulta de jugadores
  const { data: equipo, error } = await supabase
    .from('equipos')
    .select(`
      nombre,
      pj, puntos, pg, pe, pp, gf, gc, df,
      jugadores!id_equipo (
        id,
        nombre,
        goles,
        sanciones (tipo)
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !equipo) {
    return (
      <div className="p-20 text-center bg-black text-white min-h-screen">
        <p className="text-zinc-500 mb-4">Equipo no encontrado en la base de datos.</p>
        <Link href="/equipos" className="text-green-500 font-black uppercase text-xs tracking-widest">
          ← Volver a la lista
        </Link>
      </div>
    );
  }

  // 2. Ordenamos a los jugadores para que los goleadores aparezcan primero
  const jugadoresOrdenados = equipo.jugadores?.sort((a: any, b: any) => b.goles - a.goles) || [];

  return (
    <main className="p-4 md:p-12 bg-black text-white min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/equipos" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors">
          ← Volver a Equipos
        </Link>

        {/* Encabezado del Equipo */}
        <header className="mt-8 mb-12">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
            {equipo.nombre}
          </h1>
          
          {/* Mini Resumen de Estadísticas */}
          <div className="flex gap-8 mt-6 border-y border-zinc-800/50 py-6">
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Puntos</p>
              <p className="text-2xl font-black text-green-500">{equipo.puntos}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">PJ</p>
              <p className="text-2xl font-black">{equipo.pj}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Dif Goles</p>
              <p className="text-2xl font-black">{equipo.df > 0 ? `+${equipo.df}` : equipo.df}</p>
            </div>
          </div>
        </header>

        {/* Plantilla de Jugadores */}
        <section>
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 italic">Plantilla Oficial</h2>
          <div className="grid grid-cols-1 gap-3">
            {jugadoresOrdenados.map((jugador: any) => (
              <div key={jugador.id} className="group bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-2xl flex justify-between items-center hover:bg-zinc-900 transition-colors">
                <div>
                  <p className="font-bold uppercase text-sm tracking-tight group-hover:text-white transition-colors">
                    {jugador.nombre}
                  </p>
                </div>

                {/* Visualización de Goles y Sanciones */}
                <div className="flex items-center gap-4">
                  
                  {/* Goles */}
                  {jugador.goles > 0 ? (
                    <span className="text-green-500 font-black text-sm flex items-center gap-1">
                      {jugador.goles} <span className="text-lg">⚽</span>
                    </span>
                  ) : (
                    <span className="text-zinc-700 font-mono text-[10px]">0 ⚽</span>
                  )}

                  {/* Divisor vertical sutil para separar Goles de Tarjetas */}
                  <div className="w-[1px] h-4 bg-zinc-800"></div>

                  {/* Sanciones */}
                  <div className="flex gap-1.5 w-12 justify-end items-center">
                    {jugador.sanciones && jugador.sanciones.length > 0 ? (
                      jugador.sanciones.map((s: any, i: number) => (
                        <div 
                          key={i} 
                          className={`w-3 h-4 rounded-[2px] shadow-lg ${
                            s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'
                          }`} 
                          title={`Tarjeta ${s.tipo}`}
                        />
                      ))
                    ) : (
                      <span className="text-[9px] text-zinc-800 font-black uppercase tracking-widest italic">Limpio</span>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}