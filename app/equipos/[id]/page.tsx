import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// 1. Definimos la interfaz correctamente
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PerfilEquipo({ params }: PageProps) {
  // 2. ESPERAR A PARAMS (Crucial para evitar el error de tu imagen)
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 3. CONSULTA A SUPABASE
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
    .eq('id', id)
    .single();

  // Si hay error o no hay equipo, mostramos un aviso limpio
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

  // 4. ORDENAR JUGADORES POR GOLES
  const jugadoresOrdenados = equipo.jugadores?.sort((a: any, b: any) => b.goles - a.goles) || [];

  return (
    <main className="p-4 md:p-12 bg-black text-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link href="/equipos" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em]">
          ← Volver a Equipos
        </Link>

        <header className="mt-8 mb-12">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
            {equipo.nombre}
          </h1>
          
          <div className="flex gap-8 mt-6 border-y border-zinc-800/50 py-6">
            <div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Puntos</p>
              <p className="text-2xl font-black text-green-500">{equipo.puntos}</p>
            </div>
            {/* ... resto de stats (PJ, DF) ... */}
          </div>
        </header>

        <section>
          <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mb-6 italic">Plantilla Oficial</h2>
          <div className="grid grid-cols-1 gap-3">
            {jugadoresOrdenados.map((jugador: any) => (
              <div key={jugador.id} className="bg-zinc-900/30 border border-zinc-800/50 p-5 rounded-2xl flex justify-between items-center">
                <span className="font-bold uppercase text-sm">{jugador.nombre}</span>
                
                <div className="flex items-center gap-4">
                  <span className="text-green-500 font-black text-sm">{jugador.goles} ⚽</span>
                  <div className="flex gap-1">
                    {jugador.sanciones?.map((s: any, i: number) => (
                      <div key={i} className={`w-3 h-4 rounded-[2px] ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'}`} />
                    ))}
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