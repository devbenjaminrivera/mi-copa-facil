import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PerfilEquipo({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

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

  if (error || !equipo) {
    return (
      <div className="p-20 text-center bg-black text-white min-h-screen">
        <p className="text-zinc-500 mb-4">Equipo no encontrado</p>
        <Link href="/equipos" className="text-green-500 font-black uppercase text-xs tracking-widest">
          ← Volver a la lista
        </Link>
      </div>
    );
  }

  // Ordenamos por goles (máximos anotadores primero)
  const jugadoresOrdenados = equipo.jugadores?.sort((a: any, b: any) => b.goles - a.goles) || [];

  return (
    <main className="p-4 md:p-12 bg-black text-white min-h-screen font-sans pt-12">
      <div className="max-w-6xl mx-auto">
        {/* BOTÓN VOLVER (Estilo Minimalista) */}
        <Link href="/equipos" className="inline-block border border-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-sm mb-12">
          ← VOLVER A EQUIPOS
        </Link>

        {/* HEADER CENTRALIZADO (Según imagen) */}
        <header className="flex flex-col items-center text-center mb-16">
          <div className="relative w-48 h-48 mb-6 drop-shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <Image 
              src={`/escudos/${id}.png`} 
              alt={equipo.nombre}
              fill
              className="object-contain"
            />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black italic uppercase tracking-tighter text-green-500 mb-8">
            {equipo.nombre}
          </h1>
          
          <div className="flex gap-12 md:gap-20">
            <div className="text-center">
              <p className="text-xs text-zinc-500 font-black uppercase tracking-[0.3em] italic mb-1">Puntos</p>
              <p className="text-5xl font-black">{equipo.puntos}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-zinc-500 font-black uppercase tracking-[0.3em] italic mb-1">PJ</p>
              <p className="text-5xl font-black">{equipo.pj}</p>
            </div>
          </div>
        </header>

        {/* SECCIÓN DE PLANTILLA */}
        <section>
          <h2 className="text-center text-4xl font-black italic uppercase mb-12 tracking-tight">
            Plantilla Oficial
          </h2>

          {/* GRID DE JUGADORES (3 COLUMNAS EN DESKTOP) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jugadoresOrdenados.map((jugador: any) => (
              <div key={jugador.id} className="bg-white p-6 rounded-lg flex justify-between items-center shadow-lg transition-transform hover:scale-[1.02]">
                
                <div className="flex items-center gap-4">
                  {/* Icono de Pelota Verde */}
                  <div className="bg-green-500 p-2 rounded-full shadow-inner">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                  </div>

                  <div className="text-black">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                      N. CAMISETA {jugador.numero_camiseta || '--'} |
                    </p>
                    <p className="text-lg font-black uppercase leading-tight italic">
                      {jugador.nombre}
                    </p>
                    <p className="text-[11px] font-bold text-zinc-500">
                      (Goles: {jugador.goles})
                    </p>
                  </div>
                </div>

                {/* SANCIONES (Tarjetas alineadas a la derecha) */}
                <div className="flex gap-1.5 self-center">
                  {jugador.sanciones?.map((s: any, i: number) => (
                    <div 
                      key={i} 
                      className={`w-6 h-8 rounded-sm shadow-md ${
                        s.tipo === 'amarilla' ? 'bg-yellow-400 border-2 border-yellow-500' : 'bg-red-600 border-2 border-red-700'
                      }`} 
                    />
                  ))}
                  {(!jugador.sanciones || jugador.sanciones.length === 0) && (
                    <div className="w-6 h-8 rounded-sm bg-green-500/20 border-2 border-green-500/30" title="Sin sanciones" />
                  )}
                </div>

              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}