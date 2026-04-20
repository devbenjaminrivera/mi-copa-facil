import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Esto asegura que cada vez que alguien entre, vea los puntos reales 
// y no una versión guardada en caché por Vercel.
export const revalidate = 0;

export default async function Home() {
  // Traemos los equipos ordenados por puntos (descendente) y luego por PJ (ascendente)
  const { data: equipos } = await supabase
    .from('equipos')
    .select('*')
    .order('puntos', { ascending: false })
    .order('pj', { ascending: true });

  return (
    <main className="p-4 md:p-8 bg-black text-white min-h-screen font-sans">
      {/* Header con enlace a Login */}
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
      
      {/* Contenedor de la Tabla */}
      <div className="max-w-4xl mx-auto bg-zinc-900/50 rounded-2xl p-1 border border-zinc-800 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-zinc-500 uppercase text-[10px] tracking-widest border-b border-zinc-800">
                <th className="px-6 py-4">Posición</th>
                <th className="px-6 py-4">Equipo</th>
                <th className="px-6 py-4 text-center">PJ</th>
                <th className="px-6 py-4 text-right">Puntos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {equipos?.map((eq, index) => (
                <tr 
                  key={eq.id} 
                  className="group hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="px-6 py-4 text-zinc-500 font-mono">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-semibold text-zinc-200 group-hover:text-white">
                    {eq.nombre}
                  </td>
                  <td className="px-6 py-4 text-center text-zinc-400">
                    {eq.pj}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-block px-3 py-1 rounded-lg font-bold ${
                      index === 0 ? 'bg-green-500/10 text-green-400' : 'text-zinc-300'
                    }`}>
                      {eq.puntos} pts
                    </span>
                  </td>
                </tr>
              ))}

              {(!equipos || equipos.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-zinc-600">
                    No hay equipos registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="max-w-4xl mx-auto mt-12 text-center text-zinc-600 text-[10px] uppercase tracking-[0.2em]">
        Desarrollado por Benjamín Rivera Araneda • 2026
      </footer>
    </main>
  );
}