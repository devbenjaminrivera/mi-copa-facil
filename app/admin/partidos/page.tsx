'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GestionPartidos() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [localId, setLocalId] = useState('');
  const [visitaId, setVisitaId] = useState('');
  const [golesL, setGolesL] = useState(0);
  const [golesV, setGolesV] = useState(0);

  // Cargar equipos para los select
  useEffect(() => {
    const fetchEquipos = async () => {
      const { data } = await supabase.from('equipos').select('*');
      if (data) setEquipos(data);
    };
    fetchEquipos();
  }, []);

  const registrarPartido = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Guardar el registro del partido
    const { error: pError } = await supabase.from('partidos').insert([
  { 
    equipo_local: localId,    // Antes decía local_id
    equipo_visita: visitaId,  // Antes decía visita_id
    goles_local: golesL, 
    goles_visita: golesV, 
    estado: 'jugado'          // Usamos 'estado' porque así está en tu tabla
  }
]);
    if (pError) return alert("Error al guardar partido");

    // 2. Lógica de Puntos
    let puntosL = 0;
    let puntosV = 0;

    if (golesL > golesV) puntosL = 3;      // Gana Local
    else if (golesV > golesL) puntosV = 3; // Gana Visita
    else { puntosL = 1; puntosV = 1; }      // Empate

    // 3. Actualizar tabla de equipos (Incrementar Puntos y PJ)
    // Nota: En una app pro usarías RPC o Triggers, aquí lo hacemos directo para aprender
    await actualizarEquipo(localId, puntosL);
    await actualizarEquipo(visitaId, puntosV);

    alert("¡Resultado actualizado y puntos asignados!");
  };

  const actualizarEquipo = async (id: string, puntosNuevos: number) => {
  const { data, error } = await supabase.from('equipos').select('puntos, pj').eq('id', id).single();
  
  if (data) {
    await supabase.from('equipos').update({
      puntos: data.puntos + puntosNuevos,
      pj: data.pj + 1
    }).eq('id', id);
  } else {
    console.error("No se encontró el equipo o hubo un error:", error);
  }
};

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Registrar Resultado</h1>
      <form onSubmit={registrarPartido} className="grid grid-cols-2 gap-4 max-w-xl bg-zinc-900 p-6 rounded-lg border border-zinc-800">
        <div>
          <label>Local</label>
          <select className="w-full p-2 bg-zinc-800 rounded mt-1" onChange={(e)=>setLocalId(e.target.value)}>
            <option>Seleccionar...</option>
            {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
          </select>
          <input type="number" className="w-full p-2 mt-2 bg-zinc-700 rounded" placeholder="Goles" onChange={(e)=>setGolesL(parseInt(e.target.value))} />
        </div>

        <div>
          <label>Visita</label>
          <select className="w-full p-2 bg-zinc-800 rounded mt-1" onChange={(e)=>setVisitaId(e.target.value)}>
            <option>Seleccionar...</option>
            {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
          </select>
          <input type="number" className="w-full p-2 mt-2 bg-zinc-700 rounded" placeholder="Goles" onChange={(e)=>setGolesV(parseInt(e.target.value))} />
        </div>

        <button className="col-span-2 bg-green-600 p-3 rounded font-bold mt-4 hover:bg-green-500 transition">
          Finalizar Partido y Sumar Puntos
        </button>
      </form>
    </div>
  );
}