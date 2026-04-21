'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function GestionarEquipos() {
  const [nombre, setNombre] = useState('');
  const [equipos, setEquipos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  // 1. Cargar equipos existentes
  const fetchEquipos = async () => {
    const { data } = await supabase.from('equipos').select('*').order('nombre');
    if (data) setEquipos(data);
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  // 2. Insertar nuevo equipo
  const crearEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    
    setCargando(true);
    const { error } = await supabase.from('equipos').insert([{ nombre, puntos: 0, pj: 0 }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setNombre('');
      fetchEquipos(); // Refrescar lista
    }
    setCargando(false);
  };

  // 3. Borrar equipo
  const borrarEquipo = async (id: number) => {
    if (confirm("¿Seguro que quieres eliminar este equipo? Se borrarán sus puntos.")) {
      const { error } = await supabase.from('equipos').delete().eq('id', id);
      if (error) alert("Error al borrar");
      else fetchEquipos();
    }
  };
  const editarNombreEquipo = async (id: string, nuevoNombre: string) => {
  const { error } = await supabase
    .from('equipos')
    .update({ nombre: nuevoNombre })
    .eq('id', id);
  if (!error) fetchEquipos();
};

  return (
    <div className="p-8 bg-black min-h-screen text-white font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">🛡️ Gestión de Equipos</h1>
          <Link href="/admin" className="text-zinc-500 hover:text-white text-sm">← Volver</Link>
        </div>

        {/* Formulario de Creación */}
        <form onSubmit={crearEquipo} className="mb-10 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <label className="block text-zinc-400 text-sm mb-2">Nombre del Nuevo Equipo</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Universidad Adventista FC" 
              className="flex-1 bg-black border border-zinc-700 rounded-lg px-4 py-2 outline-none focus:border-green-500 transition"
            />
            <button 
              disabled={cargando}
              className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 px-6 py-2 rounded-lg font-bold transition"
            >
              {cargando ? 'Guardando...' : 'Añadir'}
            </button>
          </div>
        </form>

        {/* Lista de Equipos */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <h2 className="p-4 border-b border-zinc-800 text-sm font-bold text-zinc-500 uppercase tracking-widest">
            Equipos Registrados ({equipos.length})
          </h2>
          <ul className="divide-y divide-zinc-800">
            {equipos.map((eq) => (
              <li key={eq.id} className="p-4 flex justify-between items-center group hover:bg-zinc-800/50 transition">
                <div>
                  <p className="font-semibold">{eq.nombre}</p>
                  <p className="text-xs text-zinc-500">{eq.puntos} pts • {eq.pj} partidos</p>
                </div>
                <button 
                  onClick={() => borrarEquipo(eq.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 text-sm transition"
                >
                  Eliminar
                </button>
              </li>
            ))}
            {equipos.length === 0 && (
              <li className="p-8 text-center text-zinc-600">No hay equipos creados.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}