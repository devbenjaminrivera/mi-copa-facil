import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// 1. Definimos la interfaz para props (opcional pero recomendado)
interface Props {
  params: Promise<{ id: string }>;
}

// 2. Usamos 'await' para obtener el ID real de la URL
export default async function PerfilEquipo({ params }: Props) {
  
  // ESTA ES LA LÍNEA CLAVE QUE FALTA:
  const { id } = await params; 

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
    .eq('id', id) // Ahora mandamos el 'id' real, no 'undefined'
    .single();

  // Imprimir en el log de Vercel para confirmar que ya no es undefined
  console.log("Cargando equipo con ID:", id);

  if (error || !equipo) {
    console.error("Error de Supabase:", error);
    return (
      <div className="p-20 text-center bg-black text-white min-h-screen">
        <p className="text-zinc-500 mb-4">Equipo no encontrado en la base de datos.</p>
        <Link href="/equipos" className="text-green-500 font-black uppercase text-xs tracking-widest">
          ← Volver a la lista
        </Link>
      </div>
    );
  }

  // ... (el resto del código de renderizado que ya tenías)
}