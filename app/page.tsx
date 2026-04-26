import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: equipos, error: errorEquipos } = await supabase
    .from('equipos')
    .select('*')
    .order('puntos', { ascending: false })
    .order('df', { ascending: false })
    .order('gf', { ascending: false })
    .order('nombre', { ascending: true });
  

  const { data: partidos } = await supabase
  .from('partidos')
  .select(`
    id, goles_local, goles_visita,
    equipo_local:equipos!equipo_local(id, nombre),
    equipo_visita:equipos!equipo_visita(id, nombre),
    sanciones(tipo, jugador_id, equipos(id))
  `)
  .eq('estado', 'jugado')
  .order('created_at', { ascending: false })
  .limit(5);

  const ahora = new Date().toISOString();

  const { data: proximos } = await supabase
    .from('partidos')
    .select(`
      id, fecha,
      equipo_local:equipos!equipo_local(id, nombre),
      equipo_visita:equipos!equipo_visita(id, nombre)
    `)
    .eq('estado', 'programado')
    .gt('fecha', ahora)
    .order('fecha', { ascending: true })
    .limit(4);

  const { data: goleadores } = await supabase
  .from('jugadores')
  .select(`
    nombre, 
    goles, 
    equipos:id_equipo (id, nombre)
  `) 
  .gt('goles', 0)
  .order('goles', { ascending: false })
  .limit(5);

  return (
    <main className="p-4 md:p-8 bg-black text-white min-h-screen font-sans pt-20">
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          🏆 COPA CEVI
        </h1>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TOP LEFT: Clasificación con Scroll Interno - Optimizado para móvil */}
        <section className="lg:col-span-8 w-full">
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2 italic">Clasificación General</h2>
          <div className="bg-zinc-900/50 rounded-2xl p-1 border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[310px] custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs min-w-[600px] lg:min-w-full">
                <thead className="sticky top-0 bg-zinc-900 z-10">
                  <tr className="text-zinc-500 uppercase text-[10px] tracking-widest border-b border-zinc-800">
                    <th className="px-4 py-4 text-center">Pos</th>
                    <th className="px-4 py-4">Equipo</th>
                    <th className="px-4 py-4 text-center">PJ</th>
                    <th className="px-4 py-4 text-center text-green-500/70">G</th>
                    <th className="px-4 py-4 text-center text-yellow-500/70">E</th>
                    <th className="px-4 py-4 text-center text-red-500/70">P</th>
                    <th className="px-4 py-4 text-center">GF</th>
                    <th className="px-4 py-4 text-center">GC</th>
                    <th className="px-4 py-4 text-center">DG</th>
                    <th className="px-4 py-4 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {equipos?.map((eq, index) => (
                    <tr key={eq.id} className="group hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-4 text-zinc-500 font-mono text-center">{index + 1}</td>
                      <td className="px-4 py-4 font-bold text-zinc-200 uppercase tracking-tight whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Image src={`/escudos/${eq.id}.png`} alt="" width={28} height={28} className="object-contain shrink-0" />
                          {eq.nombre}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-zinc-400">{eq.pj || 0}</td>
                      <td className="px-4 py-4 text-center text-zinc-500">{eq.pg || 0}</td>
                      <td className="px-4 py-4 text-center text-zinc-500">{eq.pe || 0}</td>
                      <td className="px-4 py-4 text-center text-zinc-500">{eq.pp || 0}</td>
                      <td className="px-4 py-4 text-center text-zinc-500">{eq.gf || 0}</td>
                      <td className="px-4 py-4 text-center text-zinc-500">{eq.gc || 0}</td>
                      <td className="px-4 py-4 text-center font-mono text-zinc-300">
                        {(eq.df || 0) > 0 ? `+${eq.df}` : eq.df || 0}
                      </td>
                      <td className="px-4 py-4 text-right font-black text-green-400 text-sm">{eq.puntos || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* TOP RIGHT: Top Goleadores */}
        <section className="lg:col-span-4 flex flex-col">
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2 italic">Top Goleadores</h2>
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            {goleadores && goleadores.length > 0 ? (
              goleadores.map((g: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 border-b border-zinc-800/50 last:border-0 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center min-w-0">
                    <span className="text-zinc-600 font-mono text-[10px] mr-3">0{i + 1}</span>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 relative shrink-0">
                        <Image 
                          src={`/escudos/${g.equipos?.id}.png`} 
                          alt="" 
                          fill 
                          className="object-contain"
                        />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-sm leading-none group-hover:text-green-500 transition-colors truncate">{g.nombre}</p>
                        <p className="text-[9px] text-zinc-500 uppercase mt-1 tracking-widest font-medium truncate">
                          {g.equipos?.nombre}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-2 shrink-0">
                    <span className="text-green-500 font-black text-lg italic">{g.goles}</span>
                    <span className="text-[7px] text-zinc-600 uppercase font-black tracking-tighter">Goles</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic">Sin goles registrados</p>
              </div>
            )}
          </div>
        </section>

        {/* BOTTOM LEFT: Resultados Recientes - Optimizado para móvil */}
        <section className="lg:col-span-6">
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2 italic">Resultados Recientes</h2>
          <div className="space-y-3">
            {partidos && partidos.map((partido: any) => (
              <div key={partido.id} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3">
                <div className="flex justify-between items-center gap-2">
                  {/* Equipo Local */}
                  <div className="flex-1 flex flex-col items-center md:items-end md:flex-row md:justify-end gap-2 overflow-hidden">
                    <span className="font-bold text-[10px] md:text-xs uppercase truncate order-3 md:order-2">{partido.equipo_local?.nombre}</span>
                    <div className="relative w-7 h-7 md:w-7 md:h-7 shrink-0 order-1 md:order-3">
                      <Image src={`/escudos/${partido.equipo_local?.id}.png`} alt="" fill className="object-contain" />
                    </div>
                  </div>

                  {/* Marcador */}
                  <div className="bg-zinc-800 px-3 py-1 rounded font-mono font-black text-green-500 text-sm md:text-base shrink-0">
                    {partido.goles_local} - {partido.goles_visita}
                  </div>

                  {/* Equipo Visita */}
                  <div className="flex-1 flex flex-col items-center md:items-start md:flex-row gap-2 overflow-hidden">
                    <div className="relative w-7 h-7 md:w-7 md:h-7 shrink-0">
                      <Image src={`/escudos/${partido.equipo_visita?.id}.png`} alt="" fill className="object-contain" />
                    </div>
                    <span className="font-bold text-[10px] md:text-xs uppercase truncate">{partido.equipo_visita?.nombre}</span>
                    <div className="flex gap-0.5">
                      {partido.sanciones
                        ?.filter((s: any) => s.equipos?.id === partido.equipo_visita?.id)
                        .map((s: any, i: number) => (
                          <div key={i} className={`w-2 h-3 rounded-[1px] ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'}`} />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM RIGHT: Próximos Encuentros */}
        {proximos && proximos.length > 0 && (
          <section className="lg:col-span-6">
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2 italic text-center">Próximos Encuentros</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {proximos.map((p: any) => (
                <div key={p.id} className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-4 rounded-2xl flex flex-col items-center">
                  <div className="text-[10px] text-green-500 font-mono mb-2 uppercase text-center">
                    {new Date(p.fecha).toLocaleString('es-CL', { 
                      timeZone: 'America/Santiago', 
                      weekday: 'long',
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="flex justify-between items-center w-full px-2 gap-2">
                    <div className="flex-1 flex flex-col items-center gap-1 overflow-hidden">
                      <div className="relative w-8 h-8 shrink-0">
                        <Image src={`/escudos/${p.equipo_local?.id}.png`} alt="" fill className="object-contain" />
                      </div>
                      <span className="text-center text-[10px] font-black truncate uppercase w-full">{p.equipo_local?.nombre}</span>
                    </div>
                    <span className="text-zinc-700 font-bold italic text-[10px] shrink-0">VS</span>
                    <div className="flex-1 flex flex-col items-center gap-1 overflow-hidden">
                      <div className="relative w-8 h-8 shrink-0">
                        <Image src={`/escudos/${p.equipo_visita?.id}.png`} alt="" fill className="object-contain" />
                      </div>
                      <span className="text-center text-[10px] font-black truncate uppercase w-full">{p.equipo_visita?.nombre}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      <footer className="max-w-7xl mx-auto mt-20 pb-8 text-center text-zinc-700 text-[10px] uppercase tracking-[0.4em]">
        DESARROLLADO POR BENJAMÍN RIVERA ARANEDA • 2026
      </footer>
    </main>
  );
}