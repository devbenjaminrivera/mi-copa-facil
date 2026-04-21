import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// FUERZA a Next.js a no usar cache. 
// Sin esto, Vercel mostrará la tabla vacía hasta que hagas un nuevo deploy.
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Traemos los equipos para la tabla
  const { data: equipos, error: errorEquipos } = await supabase
    .from('equipos')
    .select('*')
    .order('puntos', { ascending: false })
    .order('pj', { ascending: true });

  // 2. Traemos los últimos 5 partidos jugados para darle vida a la página
  const { data: partidos } = await supabase
    .from('partidos')
    .select(`
      id,
      goles_local,
      goles_visita,
      equipo_local:equipos!equipo_local(nombre),
      equipo_visita:equipos!equipo_visita(nombre)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (errorEquipos) {
    console.error("Error cargando equipos:", errorEquipos);
  }

  return (
    <main className="p-4 md:p-8 bg-black text-white min-h-screen font-sans">
      {/* Header */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          🏆 COPA CEVI
        </h1>
        <Link 
          href="/login" 
          className="text-xs font-mono text-zinc-500 hover:text-green-400 border border-zinc-800 px-3 py-1 rounded-full transition-all"
        >
          ADMIN_PANEL {'>'}
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8">
        
        {/* SECCIÓN: TABLA DE POSICIONES */}
        <section>
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2">Clasificación</h2>
          <div className="bg-zinc-900/50 rounded-2xl p-1 border border-zinc-800 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-zinc-500 uppercase text-[10px] tracking-widest border-b border-zinc-800">
                    <th className="px-6 py-4">Pos</th>
                    <th className="px-6 py-4">Equipo</th>
                    <th className="px-6 py-4 text-center">PJ</th>
                    <th className="px-6 py-4 text-right">Puntos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {equipos?.map((eq, index) => (
                    <tr key={eq.id} className="group hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4 text-zinc-500 font-mono text-sm">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-zinc-200 group-hover:text-white">{eq.nombre}</td>
                      <td className="px-6 py-4 text-center text-zinc-400">{eq.pj}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold ${
                          index === 0 ? 'bg-green-500/10 text-green-400' : 'text-zinc-300'
                        }`}>
                          {eq.puntos} pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECCIÓN: ÚLTIMOS RESULTADOS (Estilo Copa Fácil) */}
        {partidos && partidos.length > 0 && (
          <section>
            <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-2">Últimos Resultados</h2>
            <div className="grid grid-cols-1 gap-3">
              {partidos.map((partido: any) => (
                <div key={partido.id} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-xl flex justify-between items-center">
                  <div className="flex-1 text-right font-medium">{partido.equipo_local?.nombre}</div>
                  <div className="mx-6 bg-zinc-800 px-4 py-1 rounded font-mono font-bold text-green-500">
                    {partido.goles_local} - {partido.goles_visita}
                  </div>
                  <div className="flex-1 text-left font-medium">{partido.equipo_visita?.nombre}</div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      <footer className="max-w-4xl mx-auto mt-16 pb-8 text-center text-zinc-600 text-[10px] uppercase tracking-[0.2em]">
        Desarrollado por Benjamín Rivera Araneda • 2026
      </footer>
    </main>
  );
}