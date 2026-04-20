import { supabase } from '@/lib/supabase';

export default async function Home() {
  // Traemos los equipos ordenados por puntos
  const { data: equipos } = await supabase
    .from('equipos')
    .select('*')
    .order('puntos', { ascending: false });

  return (
    <main className="p-8 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">🏆 Mi Torneo Pro</h1>
      
      <div className="max-w-2xl mx-auto bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="py-2">Equipo</th>
              <th>PJ</th>
              <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {equipos?.map((eq) => (
              <tr key={eq.id} className="border-b border-zinc-800 hover:bg-zinc-800">
                <td className="py-3 font-medium">{eq.nombre}</td>
                <td>{eq.pj}</td>
                <td className="text-green-400 font-bold">{eq.puntos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}