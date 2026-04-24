import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

// --- ESTAS LÍNEAS SOLUCIONAN EL PROBLEMA ---
export const revalidate = 0; // Desactiva el caché para que siempre consulte datos nuevos
export const dynamic = 'force-dynamic'; // Asegura que la página se genere en cada visita

export default async function ListaEquipos() {
  const { data: equipos } = await supabase.from('equipos').select('*').order('nombre');

  return (
    <main className="p-8 max-w-7xl mx-auto pt-24">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-10 text-white">Equipos</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipos?.map((equipo) => (
          <Link 
            key={equipo.id} 
            href={`/equipos/${equipo.id}`}
            className="group bg-zinc-900/40 border border-zinc-800 p-10 rounded-[2.5rem] hover:border-green-500/50 hover:bg-zinc-900/60 transition-all flex flex-col items-center text-center shadow-2xl"
          >
            {/* CONTENEDOR DEL ESCUDO */}
            <div className="relative w-32 h-32 mb-6 transition-transform duration-500 group-hover:scale-110">
              <Image 
                src={`/escudos/${equipo.id}.png`} 
                alt={`Escudo de ${equipo.nombre}`}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* INFORMACIÓN DEL EQUIPO */}
            <h2 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-green-500 transition-colors">
              {equipo.nombre}
            </h2>
            
            <div className="mt-4 px-4 py-1.5 rounded-full bg-zinc-800/50 border border-zinc-700/50 group-hover:border-green-500/30 group-hover:bg-green-500/10 transition-all">
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-green-400">
                Ver Plantilla →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}