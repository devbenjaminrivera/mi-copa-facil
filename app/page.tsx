import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Home() {
  // 1. Consulta de Equipos para la Tabla
  const { data: equipos } = await supabase
    .from('equipos')
    .select('*')
    .order('puntos', { ascending: false })
    .order('df', { ascending: false })
    .order('gf', { ascending: false })
    .order('nombre', { ascending: true });

  // 2. Consulta de Partidos Jugados (Resultados)
  const { data: partidos } = await supabase
    .from('partidos')
    .select(`
      id, goles_local, goles_visita,
      equipo_local:equipos!equipo_local(id, nombre),
      equipo_visita:equipos!equipo_visita(id, nombre)
    `)
    .eq('estado', 'jugado')
    .order('created_at', { ascending: false })
    .limit(5);

  // 3. Consulta de Próximos Partidos
  const { data: proximos } = await supabase
    .from('partidos')
    .select(`
      id, fecha,
      equipo_local:equipos!equipo_local(id, nombre),
      equipo_visita:equipos!equipo_visita(id, nombre)
    `)
    .eq('estado', 'programado')
    .order('fecha', { ascending: true })
    .limit(4);

  return (
    <main className="p-4 md:p-10 max-w-7xl mx-auto text-white min-h-screen pt-24">
      
      {/* SECCIÓN: CLASIFICACIÓN GENERAL */}
      <section className="mb-12">
        <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 italic ml-2 text-center md:text-left">
          Clasificación General
        </h2>
        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800/50 text-[10px] uppercase tracking-widest text-zinc-500">
                <th className="p-5 font-black text-center">Pos</th>
                <th className="p-5 font-black">Equipo</th>
                <th className="p-5 font-black text-center">PJ</th>
                <th className="p-5 font-black text-center text-green-500">Pts</th>
              </tr>
            </thead>
            <tbody>
              {equipos?.map((equipo, index) => (
                <tr key={equipo.id} className="border-b border-zinc-800/30 hover:bg-white/5 transition-colors group">
                  <td className="p-5 text-sm font-mono text-zinc-600 text-center">{index + 1}</td>
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Escudo del equipo en la tabla */}
                      <div className="w-8 h-8 relative flex-shrink-0">
                        <Image 
                          src={`/escudos/${equipo.id}.png`} 
                          alt={equipo.nombre}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-bold uppercase tracking-tight group-hover:text-green-500 transition-colors">
                        {equipo.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-center text-sm font-bold text-zinc-400">{equipo.pj}</td>
                  <td className="p-5 text-center text-lg font-black text-green-500">{equipo.puntos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* SECCIÓN: ÚLTIMOS RESULTADOS */}
        <section className="lg:col-span-6">
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 italic ml-2">Últimos Resultados</h2>
          <div className="space-y-3">
            {partidos?.map((p: any) => (
              <div key={p.id} className="group bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex items-center justify-between hover:border-green-500/30 transition-all">
                {/* Equipo Local */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="text-[10px] font-black uppercase truncate">{p.equipo_local.nombre}</span>
                  <div className="w-6 h-6 relative flex-shrink-0">
                    <Image src={`/escudos/${p.equipo_local.id}.png`} alt="" fill className="object-contain" />
                  </div>
                </div>

                {/* Marcador */}
                <div className="bg-black px-4 py-1 rounded-full border border-zinc-800 mx-4 shadow-inner">
                  <span className="font-black text-sm italic tracking-widest">{p.goles_local} - {p.goles_visita}</span>
                </div>

                {/* Equipo Visitante */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-6 h-6 relative flex-shrink-0">
                    <Image src={`/escudos/${p.equipo_visita.id}.png`} alt="" fill className="object-contain" />
                  </div>
                  <span className="text-[10px] font-black uppercase truncate">{p.equipo_visita.nombre}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECCIÓN: PRÓXIMOS PARTIDOS */}
        <section className="lg:col-span-6">
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 italic ml-2 text-center md:text-left">
            Próximos Encuentros
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {proximos?.map((p: any) => (
              <div key={p.id} className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-5 rounded-2xl flex flex-col items-center hover:border-zinc-600 transition-all">
                <span className="text-[9px] text-green-500 font-black mb-4 uppercase tracking-[0.2em] border-b border-green-500/20 pb-1">
                  {new Date(p.fecha).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                
                <div className="flex justify-between items-center w-full gap-2">
                  {/* Local */}
                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <div className="w-10 h-10 relative">
                      <Image src={`/escudos/${p.equipo_local.id}.png`} alt="" fill className="object-contain" />
                    </div>
                    <span className="text-[9px] font-bold uppercase text-center truncate w-full">{p.equipo_local.nombre}</span>
                  </div>

                  <span className="text-zinc-700 font-black italic text-[10px]">VS</span>

                  {/* Visitante */}
                  <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <div className="w-10 h-10 relative">
                      <Image src={`/escudos/${p.equipo_visita.id}.png`} alt="" fill className="object-contain" />
                    </div>
                    <span className="text-[9px] font-bold uppercase text-center truncate w-full">{p.equipo_visita.nombre}</span>
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