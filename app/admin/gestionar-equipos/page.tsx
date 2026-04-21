'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function GestionarEquipos() {
  const [nombre, setNombre] = useState('');
  const [equipos, setEquipos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const fetchEquipos = async () => {
    const { data } = await supabase.from('equipos').select('*').order('nombre');
    if (data) setEquipos(data);
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  const crearEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    
    setCargando(true);
    const { error } = await supabase.from('equipos').insert([{ nombre, puntos: 0, pj: 0 }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setNombre('');
      fetchEquipos();
    }
    setCargando(false);
  };

  const borrarEquipo = async (id: number) => {
    if (confirm("¿Seguro que quieres eliminar este equipo? Esto podría afectar a los jugadores asociados.")) {
      const { error } = await supabase.from('equipos').delete().eq('id', id);
      if (!error) fetchEquipos();
    }
  };

  // Nueva función para editar el nombre
  const editarNombreEquipo = async (id: number, nuevoNombre: string) => {
    if (!nuevoNombre.trim()) return;
    const { error } = await supabase
      .from('equipos')
      .update({ nombre: nuevoNombre })
      .eq('id', id);
    if (!error) fetchEquipos();
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-green-500">🛡️ Gestión de Equipos</h1>
          <Link href="/admin" className="text-zinc-500 hover:text-white text-xs font-mono">← Volver</Link>
        </div>

        {/* Formulario para añadir */}
        <form onSubmit={crearEquipo} className="mb-10 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-xl">
          <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4 font-black">Nuevo Equipo</label>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Nombre del equipo..." 
              className="flex-1 bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-green-500 transition-all text-sm"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
            <button 
              disabled={cargando}
              className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest"
            >
              {cargando ? '...' : 'Añadir'}
            </button>
          </div>
        </form>

        {/* Lista de Equipos */}
        <div className="space-y-3">
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-2 italic">Equipos Registrados</h2>
          {equipos.map((eq) => (
            <div key={eq.id} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center group hover:border-zinc-700 transition-all">
              <div className="flex-1 mr-4">
                <input 
                  type="text"
                  defaultValue={eq.nombre}
                  onBlur={(e) => editarNombreEquipo(eq.id, e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-green-500 focus:outline-none font-bold text-lg w-full transition-all uppercase tracking-tight"
                />
                <p className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">
                  {eq.puntos} PUNTOS • {eq.pj} PARTIDOS JUGADOS
                </p>
              </div>
              
              <button 
                onClick={() => borrarEquipo(eq.id)}
                className="p-3 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar Equipo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
          
          {equipos.length === 0 && (
            <div className="text-center p-12 border border-dashed border-zinc-800 rounded-3xl text-zinc-700 text-sm italic">
              No hay equipos registrados todavía.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}