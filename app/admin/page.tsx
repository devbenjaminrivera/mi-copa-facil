import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Link href="/admin/gestionar-equipos" className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-green-500 transition">
          <h2 className="text-xl font-bold mb-2">🛡️ Gestionar Equipos</h2>
          <p className="text-zinc-400">Añade o elimina equipos del torneo.</p>
        </Link>

        <Link href="/admin/partidos" className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-green-500 transition">
          <h2 className="text-xl font-bold mb-2">⚽ Registrar Resultados</h2>
          <p className="text-zinc-400">Ingresa goles y actualiza la tabla automáticamente.</p>
        </Link>
        <Link href="/admin/jugadores" className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-green-500 transition">
          <h2 className="text-xl font-bold mb-2">🏃 Gestionar Jugadores</h2>
          <p className="text-zinc-400">Inscribe jugadores y revisa sus estadísticas.</p>
        </Link>
        <Link href="/admin/historial" className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-red-500 transition">
          <h2 className="text-xl font-bold mb-2">📜 Historial y Corrección</h2>
          <p className="text-zinc-400">Edita o elimina partidos mal registrados.</p>
        </Link>
        <Link href="/admin/calendario" className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-green-500 transition">
          <h2 className="text-xl font-bold mb-2">🗓️ Calendario y Fixture</h2>
          <p className="text-zinc-400">Programa los proximos encuentros.</p>
        </Link>
      </div>

      <div className="mt-8">
        <Link href="/" className="text-green-500 hover:underline">← Volver a la Tabla Pública</Link>
      </div>
    </div>
  );
}