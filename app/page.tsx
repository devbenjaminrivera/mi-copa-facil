import { supabase } from '@/lib/supabase';
import AdminButton from '@/components/AdminButton';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Auditoría y Clasificación: Orden descendente por Puntos, luego DG y luego GF
  const { data: equipos, error: errorEquipos } = await supabase
    .from('equipos')
    .select('*')
    .order('puntos', { ascending: false }) // (PG * 3) + PE
    .order('df', { ascending: false })     // GF - GC
    .order('gf', { ascending: false })     // Goles a Favor
    .order('nombre', { ascending: true });

  // 2. Resultados Pasados
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

  // 3. Próximos Partidos (Calendario)
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

  // 4. Goleadores
  const { data: goleadores } = await supabase
    .from('jugadores')
    .select('nombre, goles, equipos!inner(nombre), sanciones(tipo)')
    .gt('goles', 0)
    .order('goles', { ascending: false })
    .limit(5);

  return (
    <main className="p-4 md:p-8 bg-black text-white min-h-screen font-sans">
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          🏆 COPA CEVI
        </h1>
        <AdminButton />
      </div>
      
      <div className="max-w-5xl mx-auto grid grid-cols-1 gap-12">
        
        {/* TABLA DE POSICIONES AUDITADA */}
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
                    <th className="px-4 py-4 text-center text-green-500/70">PG</th>
                    <th className="px-4 py-4 text-center text-yellow-500/70">PE</th>
                    <th className="px-4 py-4 text-center text-red-500/70">PP</th>
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
                      <td className="px-4 py-4 text-right font-black text-green-400 text-sm">
                        {eq.puntos || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ... Resto de las secciones (Calendario, Goleadores, Resultados) se mantienen igual ... */}
      </div>

      <footer className="max-w-5xl mx-auto mt-20 pb-8 text-center text-zinc-700 text-[10px] uppercase tracking-[0.4em]">
        SISTEMA DE GESTIÓN DEPORTIVA • BENJAMÍN RIVERA ARANEDA • 2026
      </footer>
    </main>
  );
}