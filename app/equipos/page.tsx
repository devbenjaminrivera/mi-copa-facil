import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function ListaEquipos() {
  const { data: equipos } = await supabase.from('equipos').select('*').order('nombre');

  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-10">Equipos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipos?.map((equipo) => (
          <Link 
            key={equipo.id} 
            href={`/equipos/${equipo.id}`}
            className="group bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl hover:border-green-500 transition-all"
          >
            <h2 className="text-2xl font-black uppercase tracking-tight group-hover:text-green-500 transition-colors">
              {equipo.nombre}
            </h2>
            <p className="text-zinc-500 text-[10px] font-bold mt-2 tracking-widest">VER PLANTILLA →</p>
          </Link>
        ))}
      </div>
    </main>
  );
}