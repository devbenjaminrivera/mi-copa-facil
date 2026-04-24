import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PerfilEquipo({ params }: PageProps) {
  // 1. Esperar a que se resuelvan los parámetros de la URL
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 2. Consulta a Supabase incluyendo 'numero_camiseta'
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

  // Manejo de error si el equipo no existe
  if (error || !equipo) {
    return (
      <div className="p-20 text-center bg-black text-white min-h-screen">
        <p className="text-zinc-500 mb-4">Equipo no encontrado (ID: {id})</p>
        <Link href="/equipos" className="text-green-500 font-black uppercase text-xs tracking-widest">
          ← Volver a la lista
        </Link>
      </div>
    );
  }

  // 3. Ordenar jugadores por cantidad de goles
  const jugadoresOrdenados = equipo.jugadores?.sort((a: any, b: any) => b.goles - a.goles) || [];

  return (
    <main className="p-4 md:p-12 bg-black text-white min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/equipos" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors">
          ← Volver a Equipos
        </Link>

        {/* Encabezado con el nombre del equipo */}
        <header className="mt-8 mb-12">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
            {equipo.nombre}
          </h1>
          
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

        {/* Sección de la Plantilla con Número de Camiseta */}
        <section>
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 italic px-2">Plantilla Oficial</h2>
          <div className="grid grid-cols-1 gap-3">
            {jugadoresOrdenados.map((jugador: any) => (
              <div key={jugador.id} className="group bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-2xl flex justify-between items-center hover:bg-zinc-900 transition-all">
                
                {/* LADO IZQUIERDO: Número, Nombre y Sanciones juntas */}
                <div className="flex items-center gap-4">
                  {/* Número de camiseta (Dorsal) */}
                  <span className="text-zinc-600 font-mono text-xs w-6 text-center italic group-hover:text-zinc-400">
                    {jugador.numero_camiseta ? `#${jugador.numero_camiseta}` : '--'}
                  </span>

                  <p className="font-bold uppercase text-sm tracking-tight group-hover:text-white transition-colors">
                    {jugador.nombre}
                  </p>
                  
                  <div className="flex gap-1">
                    {jugador.sanciones && jugador.sanciones.length > 0 && (
                      jugador.sanciones.map((s: any, i: number) => (
                        <div 
                          key={i} 
                          className={`w-2.5 h-3.5 rounded-[1px] shadow-sm ${
                            s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'
                          }`} 
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* LADO DERECHO: Goles alineados al final */}
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