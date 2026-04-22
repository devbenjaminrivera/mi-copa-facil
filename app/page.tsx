import { supabase } from '@/lib/supabase';
import AdminButton from '@/components/AdminButton';

// Configuración de renderizado dinámico
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. AUDITORÍA ESTADÍSTICA: Clasificación profesional (Puntos -> DG -> GF)
  const { data: equipos, error: errorEquipos } = await supabase
    .from('equipos')
    .select('*')
    .order('puntos', { ascending: false }) // (PG * 3) + PE
    .order('df', { ascending: false })     // GF - GC
    .order('gf', { ascending: false })     // Goles a favor
    .order('nombre', { ascending: true });

  // 2. ÚLTIMOS RESULTADOS (Partidos ya jugados)
  const { data: partidos } = await supabase
    .from('partidos')
    .select(`
      id, goles_local, goles_visita,
      equipo_local:equipos!equipo_local(nombre),
      equipo_visita:equipos!equipo_visita(nombre)
    `)
    .eq('estado', 'jugado')
    .order('created_at', { ascending: false })
    .limit(5);

  // 3. PRÓXIMOS PARTIDOS (Calendario programado)
  const { data: proximos } = await supabase
    .from('partidos')
    .select(`
      id, fecha,
      equipo_local:equipos!equipo_local(nombre),
      equipo_visita:equipos!equipo_visita(nombre)
    `)
    .eq('estado', 'programado')
    .order('fecha', { ascending: true })
    .limit(4);

  // 4. TOP GOLEADORES (Pichichi con sanciones)
  const { data: goleadores } = await supabase
    .from('jugadores')
    .select('nombre, goles, equipos!inner(nombre), sanciones(tipo)')
    .gt('goles', 0)
    .order('goles', { ascending: false })
    .limit(5);

  return (
    <main className="p-4 md:p-8 bg-black text-white min-h-screen font-sans">
      {/* Header */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          🏆 COPA CEVI
        </h1>
        <AdminButton />
      </div>
      
      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-12">
        
        {/* SECCIÓN 1: TABLA DE POSICIONES AUDITADA */}
        <section>
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2 italic">Clasificación General</h2>
          <div className="bg-zinc-900/50 rounded-2xl p-1 border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
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
                      <td className="px-4 py-4 font-bold text-zinc-200 uppercase tracking-tight">{eq.nombre}</td>
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

        {/* SECCIÓN 2: CALENDARIO DE PRÓXIMOS PARTIDOS */}
        {proximos && proximos.length > 0 && (
          <section>
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2 italic text-center">Próximos Encuentros</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {proximos.map((p: any) => (
                <div key={p.id} className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-4 rounded-2xl flex flex-col items-center">
                  <div className="text-[10px] text-green-500 font-mono mb-2 uppercase">
                    {new Date(p.fecha).toLocaleString('es-CL', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex justify-between items-center w-full px-2">
                    <span className="flex-1 text-right text-xs font-black truncate uppercase">{p.equipo_local?.nombre}</span>
                    <span className="mx-3 text-zinc-700 font-bold italic text-[10px]">VS</span>
                    <span className="flex-1 text-left text-xs font-black truncate uppercase">{p.equipo_visita?.nombre}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* SECCIÓN 3: TABLA DE GOLEADORES */}
          <section>
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2 italic">Top Goleadores</h2>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
              {goleadores && goleadores.map((g: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 border-b border-zinc-800/50 last:border-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center">
                    <span className="text-zinc-600 font-mono text-[10px] mr-3">0{i + 1}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm leading-none">{g.nombre}</p>
                        <div className="flex gap-0.5">
                          {g.sanciones?.map((s: any, idx: number) => (
                            <div key={idx} className={`w-2 h-3 rounded-[1px] ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 uppercase mt-1 tracking-tighter">
                        {g.equipos?.nombre}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-500 font-black text-lg">{g.goles}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECCIÓN 4: ÚLTIMOS RESULTADOS */}
          <section>
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2 italic">Resultados Recientes</h2>
            <div className="space-y-3">
              {partidos && partidos.map((partido: any) => (
                <div key={partido.id} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
                  <div className="flex-1 text-right font-bold text-xs uppercase truncate pr-2">{partido.equipo_local?.nombre}</div>
                  <div className="bg-zinc-800 px-3 py-1 rounded font-mono font-black text-green-500 text-sm">
                    {partido.goles_local} - {partido.goles_visita}
                  </div>
                  <div className="flex-1 text-left font-bold text-xs uppercase truncate pl-2">{partido.equipo_visita?.nombre}</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      <footer className="max-w-5xl mx-auto mt-20 pb-8 text-center text-zinc-700 text-[10px] uppercase tracking-[0.4em]">
        CEVI • 2026
      </footer>
    </main>
  );
}