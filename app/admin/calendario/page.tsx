'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProgramarCalendario() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [partidosProgramados, setPartidosProgramados] = useState<any[]>([]); 
  const [localId, setLocalId] = useState('');
  const [visitaId, setVisitaId] = useState('');
  const [fecha, setFecha] = useState('');

  const fetchData = async () => {
    const { data: eq } = await supabase.from('equipos').select('*').order('nombre');
    if (eq) setEquipos(eq);

    // OBTENEMOS LA HORA ACTUAL EN FORMATO ISO
    const ahora = new Date().toISOString();

    // FILTRAMOS: Solo partidos 'programados' cuya fecha sea MAYOR que 'ahora'
    const { data: part } = await supabase
      .from('partidos')
      .select(`
        id, fecha,
        equipo_local:equipos!equipo_local(nombre),
        equipo_visita:equipos!equipo_visita(nombre)
      `)
      .eq('estado', 'programado')
      .gt('fecha', ahora) // <--- ESTO SOLUCIONA TU PETICIÓN
      .order('fecha', { ascending: true });
    
    if (part) setPartidosProgramados(part);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const agendar = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!localId || !visitaId || !fecha) return alert("Completa todos los campos");

  // AJUSTE: Convertimos la fecha del input a un objeto Date y luego a ISO 
  // pero asegurando que se guarde con el desfase correcto.
  const fechaAjustada = new Date(fecha).toISOString();

  const { error } = await supabase.from('partidos').insert([
    { 
      equipo_local: localId, 
      equipo_visita: visitaId, 
      fecha: fechaAjustada, // Usamos la fecha procesada
      estado: 'programado' 
    }
  ]);

    if (error) alert("Error: " + error.message);
    else {
      alert("Partido programado con éxito");
      setFecha(''); 
      fetchData();  
    }
  };

  const eliminarPartido = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este encuentro del calendario?")) {
      const { error } = await supabase.from('partidos').delete().eq('id', id);
      if (!error) fetchData();
      else alert("Error al eliminar");
    }
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white font-sans pt-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-green-500">🗓️ Calendario</h1>
          <Link href="/admin" className="text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
            ← VOLVER AL PANEL
          </Link>
        </div>
        
        <form onSubmit={agendar} className="space-y-6 bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800 mb-12 shadow-2xl">
          <div className="grid grid-cols-2 gap-4">
            <select 
              className="bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-green-500 text-sm font-bold transition-all" 
              onChange={e => setLocalId(e.target.value)}
              value={localId}
            >
              <option value="">Local</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id} className="bg-zinc-900">{eq.nombre}</option>)}
            </select>
            <select 
              className="bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-green-500 text-sm font-bold transition-all" 
              onChange={e => setVisitaId(e.target.value)}
              value={visitaId}
            >
              <option value="">Visita</option>
              {equipos.map(eq => <option key={eq.id} value={eq.id} className="bg-zinc-900">{eq.nombre}</option>)}
            </select>
          </div>

          <input 
            type="datetime-local" 
            className="w-full bg-black border border-zinc-800 p-4 rounded-2xl outline-none focus:border-green-500 text-sm font-bold color-scheme-dark transition-all"
            onChange={e => setFecha(e.target.value)}
            value={fecha}
            required
          />

          <button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-green-500 transition-all text-xs">
            Publicar Partido en Cartelera
          </button>
        </form>

        <div className="space-y-3">
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 ml-2 italic">Próximos Duelos Confirmados</h2>
          {partidosProgramados.length > 0 ? (
            partidosProgramados.map((p) => (
              <div key={p.id} className="bg-zinc-900/30 border border-zinc-800 p-5 rounded-3xl flex justify-between items-center group hover:border-zinc-600 transition-all">
                <div>
                   <p className="text-[10px] text-green-500 font-mono font-black mb-1 uppercase tracking-widest">
                    {new Date(p.fecha).toLocaleString('es-CL', { 
                      timeZone: 'America/Santiago', 
                      day: 'numeric', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <p className="text-sm font-black uppercase tracking-tight italic">
                    {p.equipo_local?.nombre} <span className="text-zinc-700 mx-2 not-italic">vs</span> {p.equipo_visita?.nombre}
                  </p>
                </div>
                
                <button 
                  onClick={() => eliminarPartido(p.id)}
                  className="p-3 text-zinc-700 hover:text-red-500 transition-colors bg-black/50 rounded-xl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-zinc-900 rounded-[2.5rem]">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">No hay partidos agendados</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}