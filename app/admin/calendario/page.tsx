'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProgramarCalendario() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [partidosProgramados, setPartidosProgramados] = useState<any[]>([]); // Estado para la lista
  const [localId, setLocalId] = useState('');
  const [visitaId, setVisitaId] = useState('');
  const [fecha, setFecha] = useState('');

  // 1. Unificamos la carga de datos (Esta es la función que antes faltaba)
  const fetchData = async () => {
    // Cargar equipos para el selector
    const { data: eq } = await supabase.from('equipos').select('*').order('nombre');
    if (eq) setEquipos(eq);

    // Cargar partidos que están programados (Calendario actual)
    const { data: part } = await supabase
      .from('partidos')
      .select(`
        id, fecha,
        equipo_local:equipos!equipo_local(nombre),
        equipo_visita:equipos!equipo_visita(nombre)
      `)
      .eq('estado', 'programado')
      .order('fecha', { ascending: true });
    
    if (part) setPartidosProgramados(part);
  };

  useEffect(() => {
    fetchData();
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
      setFecha(''); // Limpiar campo
      fetchData();  // Recargar la lista automáticamente
    }
  };

  // 2. Nueva función para ELIMINAR encuentros
  const eliminarPartido = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este encuentro del calendario?")) {
      const { error } = await supabase.from('partidos').delete().eq('id', id);
      if (!error) fetchData();
      else alert("Error al eliminar");
    }
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-green-500">🗓️ Calendario</h1>
          <Link href="/admin" className="text-zinc-500 hover:text-white text-xs font-mono">← VOLVER</Link>
        </div>
        
        {/* Formulario para agregar */}
        <form onSubmit={agendar} className="space-y-6 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 mb-10">
          <div className="grid grid-cols-2 gap-4">
            <select 
              className="bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-green-500 text-sm" 
              onChange={e => setLocalId(e.target.value)}
              value={localId}
            >
              <option value="">Local</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id} className="bg-zinc-900">{eq.nombre}</option>)}
            </select>
            <select 
              className="bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-green-500 text-sm" 
              onChange={e => setVisitaId(e.target.value)}
              value={visitaId}
            >
              <option value="">Visita</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id} className="bg-zinc-900">{eq.nombre}</option>)}
            </select>
          </div>

          <input 
            type="datetime-local" 
            className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-green-500 text-sm color-scheme-dark"
            onChange={e => setFecha(e.target.value)}
            value={fecha}
            required
          />

          <button className="w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase hover:bg-green-500 transition-all">
            Publicar Partido
          </button>
        </form>

        {/* LISTA PARA BORRAR ENCUENTROS */}
        <div className="space-y-3">
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4 italic">Encuentros Programados</h2>
          {partidosProgramados.map((p) => (
            <div key={p.id} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center group">
              <div>
                <p className="text-[10px] text-green-500 font-mono mb-1">
                  {new Date(p.fecha).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm font-bold uppercase tracking-tight">
                  {p.equipo_local?.nombre} <span className="text-zinc-600 mx-1">vs</span> {p.equipo_visita?.nombre}
                </p>
              </div>
              
              <button 
                onClick={() => eliminarPartido(p.id)}
                className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}