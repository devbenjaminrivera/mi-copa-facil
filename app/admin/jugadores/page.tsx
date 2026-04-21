'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function GestionJugadores() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [nombre, setNombre] = useState('');
  const [equipoId, setEquipoId] = useState('');

  const fetchData = async () => {
    const { data: eq } = await supabase.from('equipos').select('*').order('nombre');
    
    const { data: jug } = await supabase
      .from('jugadores')
      .select('*, equipos(nombre), sanciones(id, tipo)') // Traemos el id de la sanción para borrarla
      .order('goles', { ascending: false });

    if (eq) setEquipos(eq);
    if (jug) setJugadores(jug);
  };

  const eliminarJugador = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar a este jugador?")) {
      const { error } = await supabase.from('jugadores').delete().eq('id', id);
      if (!error) fetchData();
    }
  };

  const corregirGoles = async (id: string, nuevosGoles: number) => {
    await supabase.from('jugadores').update({ goles: nuevosGoles }).eq('id', id);
    fetchData();
  };

  const quitarSancion = async (sancionId: number) => {
    if (confirm("¿Quitar esta sanción?")) {
      const { error } = await supabase.from('sanciones').delete().eq('id', sancionId);
      if (!error) fetchData();
    }
  };

  useEffect(() => { fetchData(); }, []);

  const agregarJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('jugadores').insert([{ nombre, equipo_id: equipoId }]);
    if (!error) { setNombre(''); fetchData(); }
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-green-500">🏃 Gestión de Jugadores</h1>
          <Link href="/admin" className="text-zinc-500 hover:text-white text-xs font-mono">← Volver</Link>
        </div>

        <form onSubmit={agregarJugador} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 mb-8">
          <input 
            placeholder="Nombre del jugador" 
            className="bg-black border border-zinc-700 p-2 rounded-lg outline-none focus:border-green-500 text-sm"
            value={nombre} onChange={e => setNombre(e.target.value)}
          />
          <select 
            className="bg-black border border-zinc-700 p-2 rounded-lg outline-none text-sm"
            onChange={e => setEquipoId(e.target.value)}
            value={equipoId}
          >
            <option value="">Selecciona Equipo</option>
            {equipos.map(eq => <option key={eq.id} value={eq.id} className="bg-zinc-900">{eq.nombre}</option>)}
          </select>
          <button className="bg-green-600 hover:bg-green-500 font-bold p-2 rounded-lg transition text-sm">Inscribir</button>
        </form>

        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-800/50 text-zinc-500 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-4">Jugador</th>
                <th className="p-4">Sanciones</th>
                <th className="p-4">Equipo</th>
                <th className="p-4 text-center">Goles</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {jugadores.map(j => (
                <tr key={j.id} className="hover:bg-white/[0.02] transition group">
                  <td className="p-4">
                    <span className="font-bold text-sm">{j.nombre}</span>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex gap-1.5">
                      {j.sanciones && j.sanciones.length > 0 ? (
                        j.sanciones.map((s: any) => (
                          <button 
                            key={s.id}
                            onClick={() => quitarSancion(s.id)}
                            title="Click para quitar sanción"
                            className={`w-3 h-4 rounded-[1px] relative group/card cursor-pointer transition-transform hover:scale-110 ${
                              s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'
                            }`}
                          >
                            <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 bg-black/40 text-[8px] font-bold text-white">✕</span>
                          </button>
                        ))
                      ) : (
                        <span className="text-[10px] text-zinc-700 italic">Limpio</span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-zinc-500 text-xs uppercase">{j.equipos?.nombre}</td>
                  
                  <td className="p-4">
                    <div className="flex justify-center">
                      <input 
                        type="number"
                        defaultValue={j.goles}
                        onBlur={(e) => corregirGoles(j.id, parseInt(e.target.value) || 0)}
                        className="w-12 bg-black border border-zinc-800 text-center text-sm font-bold text-green-500 rounded p-1 focus:border-green-500 outline-none"
                      />
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    <button 
                      onClick={() => eliminarJugador(j.id)}
                      className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}