import { supabase } from '@/lib/supabase';
import AdminButton from '@/components/AdminButton';

// FUERZA a Next.js a no usar cache para mostrar siempre datos reales.
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Consulta de equipos con lógica de desempate profesional
  const { data: equipos, error: errorEquipos } = await supabase
    .from('equipos')
    .select('*')
    .order('puntos', { ascending: false })
    .order('df', { ascending: false })
    .order('gf', { ascending: false })
    .order('pj', { ascending: true });

  // 2. Traemos los últimos 5 partidos jugados
  const { data: partidos } = await supabase
    .from('partidos')
    .select(`
      id,
      goles_local,
      goles_visita,
      equipo_local:equipos!equipo_local(nombre),
      equipo_visita:equipos!equipo_visita(nombre)
    `)
    .eq('estado', 'jugado')
    .order('created_at', { ascending: false })
    .limit(5);

  // 3. Traemos el Top 5 de Goleadores (Pichichi)
  // Agregamos !inner para asegurar la relación y facilitar el tipado
  const { data: goleadores } = await supabase
    .from('jugadores')
    .select('nombre, goles, equipos!inner(nombre)')
    .gt('goles', 0)
    .order('goles', { ascending: false })
    .limit(5);

  if (errorEquipos) {
    console.error("Error cargando equipos:", errorEquipos);
  }

  return (
    <main className="p-4 md:p-8 bg-black text-white min-h-screen font-sans">
      {/* Header Dinámico */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          🏆 COPA CEVI
        </h1>
        <AdminButton />
      </div>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-12">
        
        {/* SECCIÓN: TABLA DE POSICIONES */}
        <section>
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2 italic">Clasificación General</h2>
          <div className="bg-zinc-900/50 rounded-2xl p-1 border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-zinc-500 uppercase text-[10px] tracking-widest border-b border-zinc-800">
                    <th className="px-4 py-4 text-center">Pos</th>
                    <th className="px-4 py-4">Equipo</th>
                    <th className="px-4 py-4 text-center">PJ</th>
                    <th className="px-4 py-4 text-center">GF</th>
                    <th className="px-4 py-4 text-center">GC</th>
                    <th className="px-4 py-4 text-center">DF</th>
                    <th className="px-4 py-4 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {equipos?.map((eq, index) => (
                    <tr key={eq.id} className="group hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-4 text-zinc-500 font-mono text-xs text-center">{index + 1}</td>
                      <td className="px-4 py-4 font-bold text-zinc-200 group-hover:text-white uppercase tracking-tight text-sm">
                        {eq.nombre}
                      </td>
                      <td className="px-4 py-4 text-center text-zinc-400 text-sm">{eq.pj}</td>
                      <td className="px-4 py-4 text-center text-zinc-500 text-sm">{eq.gf || 0}</td>
                      <td className="px-4 py-4 text-center text-zinc-500 text-sm">{eq.gc || 0}</td>
                      <td className="px-4 py-4 text-center font-mono text-xs text-zinc-300">
                        {(eq.df || 0) > 0 ? `+${eq.df}` : eq.df || 0}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-lg font-black ${
                          index === 0 ? 'bg-green-500/20 text-green-400' : 'text-zinc-300'
                        }`}>
                          {eq.puntos}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECCIÓN: GOLEADORES Y ÚLTIMOS RESULTADOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* TABLA DE GOLEADORES */}
          <section>
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2 italic">Top Goleadores</h2>
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
              {goleadores && goleadores.length > 0 ? (goleadores as any[]).map((g, i) => (
                <div key={i} className="flex justify-between items-center p-4 border-b border-zinc-800/50 last:border-0 hover:bg-white/5 transition-colors">
                  <div className="flex items-center">
                    <span className="text-zinc-600 font-mono text-[10px] mr-3">0{i + 1}</span>
                    <div>
                      <p className="font-bold text-sm leading-none">{g.nombre}</p>
                      <p className="text-[10px] text-zinc-500 uppercase mt-1 tracking-tighter">
                        {/* Solución al error de Vercel: manejamos si equipos viene como objeto o array */}
                        {Array.isArray(g.equipos) ? g.equipos[0]?.nombre : g.equipos?.nombre}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-500 font-black text-lg">{g.goles}</span>
                </div>
              )) : (
                <p className="p-4 text-zinc-600 text-xs italic">Aún no hay goles registrados.</p>
              )}
            </div>
          </section>

          {/* ÚLTIMOS RESULTADOS */}
          <section>
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2 italic">Resultados Recientes</h2>
            <div className="space-y-3">
              {partidos && partidos.length > 0 ? partidos.map((partido: any) => (
                <div key={partido.id} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex justify-between items-center hover:border-zinc-600 transition-all">
                  <div className="flex-1 text-right font-bold text-xs uppercase truncate pr-2">{partido.equipo_local?.nombre}</div>
                  <div className="bg-zinc-800 px-3 py-1 rounded font-mono font-black text-green-500 text-sm">
                    {partido.goles_local} - {partido.goles_visita}
                  </div>
                  <div className="flex-1 text-left font-bold text-xs uppercase truncate pl-2">{partido.equipo_visita?.nombre}</div>
                </div>
              )) : (
                <p className="p-4 text-zinc-600 text-xs italic">No hay partidos jugados.</p>
              )}
            </div>
          </section>

        </div>
      </div>

      <footer className="max-w-4xl mx-auto mt-20 pb-8 text-center text-zinc-700 text-[10px] uppercase tracking-[0.4em]">
        DESARROLLADO POR BENJAMÍN RIVERA ARANEDA • 2026
      </footer>
    </main>
  );
}