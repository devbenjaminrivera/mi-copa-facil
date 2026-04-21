'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProgramarCalendario() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [localId, setLocalId] = useState('');
  const [visitaId, setVisitaId] = useState('');
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    const fetchEquipos = async () => {
      const { data } = await supabase.from('equipos').select('*').order('nombre');
      if (data) setEquipos(data);
    };
    fetchEquipos();
  }, []);

  const agendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localId || !visitaId || !fecha) return alert("Completa todos los campos");
    if (localId === visitaId) return alert("No puedes elegir el mismo equipo");

    const { error } = await supabase.from('partidos').insert([
      { 
        equipo_local: localId, 
        equipo_visita: visitaId, 
        fecha: fecha,
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-green-500">🗓️ Programar Fecha</h1>
          <Link href="/admin" className="text-zinc-500 hover:text-white text-xs font-mono">/CANCELAR</Link>
        </div>
        
        <form onSubmit={agendar} className="space-y-8 bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4 font-black">Enfrentamiento</label>
            <div className="grid grid-cols-2 gap-4">
              <select 
                className="bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-green-500 transition-all text-sm" 
                onChange={e => setLocalId(e.target.value)}
              >
                <option value="" className="bg-zinc-900">Local</option>
                {equipos.map(eq => <option key={eq.id} value={eq.id} className="bg-zinc-900">{eq.nombre}</option>)}
              </select>
              <select 
                className="bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-green-500 transition-all text-sm" 
                onChange={e => setVisitaId(e.target.value)}
              >
                <option value="" className="bg-zinc-900">Visita</option>
                {equipos.map(eq => <option key={eq.id} value={eq.id} className="bg-zinc-900">{eq.nombre}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-4 font-black">Fecha y Hora del Encuentro</label>
            <input 
              type="datetime-local" 
              className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-green-500 transition-all text-sm color-scheme-dark"
              onChange={e => setFecha(e.target.value)}
              required
            />
          </div>

          <button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-green-500/10">
            Publicar en Calendario
          </button>
        </form>
      </div>

      <style jsx>{`
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}