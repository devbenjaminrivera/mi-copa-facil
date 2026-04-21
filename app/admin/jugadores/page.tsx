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
    
    // MODIFICADO: Ahora traemos también las sanciones asociadas
    const { data: jug } = await supabase
      .from('jugadores')
      .select('*, equipos(nombre), sanciones(tipo)')
      .order('goles', { ascending: false });

    if (eq) setEquipos(eq);
    if (jug) setJugadores(jug);
  };

  useEffect(() => { fetchData(); }, []);

  const agregarJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('jugadores').insert([{ nombre, equipo_id: equipoId }]);
    if (!error) { setNombre(''); fetchData(); }
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-green-500">🏃 Gestión de Jugadores</h1>
          <Link href="/admin" className="text-zinc-500 hover:text-white">← Volver</Link>
        </div>

        <form onSubmit={agregarJugador} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900 p-6 rounded-xl border border-zinc-800 mb-8">
          <input 
            placeholder="Nombre del jugador" 
            className="bg-black border border-zinc-700 p-2 rounded outline-none focus:border-green-500"
            value={nombre} onChange={e => setNombre(e.target.value)}
          />
          <select 
            className="bg-black border border-zinc-700 p-2 rounded outline-none"
            onChange={e => setEquipoId(e.target.value)}
          >
            <option value="">Selecciona Equipo</option>
            {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
          </select>
          <button className="bg-green-600 hover:bg-green-500 font-bold p-2 rounded transition">Inscribir</button>
        </form>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-800 text-zinc-400 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-4">Jugador</th>
                <th className="p-4">Sanciones</th>
                <th className="p-4">Equipo</th>
                <th className="p-4 text-center">Goles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {jugadores.map(j => (
                <tr key={j.id} className="hover:bg-zinc-800/50 transition">
                  <td className="p-4">
                    <span className="font-medium">{j.nombre}</span>
                  </td>
                  
                  {/* NUEVA COLUMNA: Renderizado de Tarjetas */}
                  <td className="p-4">
                    <div className="flex gap-1">
                      {j.sanciones && j.sanciones.length > 0 ? (
                        j.sanciones.map((s: any, idx: number) => (
                          <div 
                            key={idx}
                            title={s.tipo === 'amarilla' ? 'Tarjeta Amarilla' : 'Tarjeta Roja'}
                            className={`w-3 h-4 rounded-[1px] shadow-sm animate-in fade-in zoom-in duration-300 ${
                              s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'
                            }`}
                          />
                        ))
                      ) : (
                        <span className="text-[10px] text-zinc-700 italic">Limpio</span>
                      )}
                    </div>
                  </td>

                  <td className="p-4 text-zinc-400 text-sm">{j.equipos?.nombre}</td>
                  <td className="p-4 text-center font-bold text-green-400">{j.goles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}