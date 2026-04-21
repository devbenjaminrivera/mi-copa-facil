'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProgramarCalendario() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [localId, setLocalId] = useState('');
  const [visitaId, setVisitaId] = useState('');
  const [fecha, setFecha] = useState('');
  const [lugar, setLugar] = useState('Cancha Principal');

  useEffect(() => {
    const fetchEquipos = async () => {
      const { data } = await supabase.from('equipos').select('*').order('nombre');
      if (data) setEquipos(data);
    };
    fetchEquipos();
  }, []);

  const agendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localId === visitaId) return alert("Equipos iguales");

    const { error } = await supabase.from('partidos').insert([
      { 
        equipo_local: localId, 
        equipo_visita: visitaId, 
        fecha: fecha,
        lugar: lugar,
        estado: 'programado' 
      }
    ]);

    if (error) alert("Error: " + error.message);
    else {
      alert("Partido programado con éxito");
      window.location.href = '/admin';
    }
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white font-sans">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-green-500">🗓️ Programar Fecha</h1>
        
        <form onSubmit={agendar} className="space-y-6 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Enfrentamiento</label>
            <div className="grid grid-cols-2 gap-4">
              <select className="bg-black border border-zinc-800 p-3 rounded-xl outline-none" onChange={e => setLocalId(e.target.value)}>
                <option value="">Local</option>
                {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
              </select>
              <select className="bg-black border border-zinc-800 p-3 rounded-xl outline-none" onChange={e => setVisitaId(e.target.value)}>
                <option value="">Visita</option>
                {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Fecha y Hora</label>
            <input 
              type="datetime-local" 
              className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none"
              onChange={e => setFecha(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Lugar / Cancha</label>
            <input 
              type="text" 
              placeholder="Ej: Cancha 1, Gimnasio..."
              className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none"
              value={lugar}
              onChange={e => setLugar(e.target.value)}
            />
          </div>

          <button className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase hover:bg-green-400 transition-all">
            Publicar en Calendario
          </button>
        </form>
      </div>
    </div>
  );
}