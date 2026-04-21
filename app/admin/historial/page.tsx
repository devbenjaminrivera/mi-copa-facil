'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function HistorialPartidos() {
  const [partidos, setPartidos] = useState<any[]>([]);

  const fetchPartidos = async () => {
    const { data } = await supabase
      .from('partidos')
      .select(`
        id, goles_local, goles_visita, created_at,
        equipo_local:equipos!equipo_local(id, nombre),
        equipo_visita:equipos!equipo_visita(id, nombre)
      `)
      .order('created_at', { ascending: false });
    if (data) setPartidos(data);
  };

  useEffect(() => { fetchPartidos(); }, []);

  const eliminarPartido = async (partido: any) => {
    if (!confirm("¿Eliminar este partido? Se restarán los puntos y goles de los equipos y jugadores.")) return;

    // 1. Lógica de reversa de puntos
    let puntosL = 0; let puntosV = 0;
    if (partido.goles_local > partido.goles_visita) puntosL = 3;
    else if (partido.goles_visita > partido.goles_local) puntosV = 3;
    else { puntosL = 1; puntosV = 1; }

    // 2. Restar puntos y PJ a los equipos
    await ajustarStatsEquipo(partido.equipo_local.id, -puntosL);
    await ajustarStatsEquipo(partido.equipo_visita.id, -puntosV);

    // 3. Borrar el partido (El CASCADE que hicimos antes borrará los goles y el trigger restará los goles de los jugadores)
    const { error } = await supabase.from('partidos').delete().eq('id', partido.id);

    if (error) alert("Error al eliminar");
    else fetchPartidos();
  };

  const ajustarStatsEquipo = async (id: number, puntos: number) => {
    const { data } = await supabase.from('equipos').select('puntos, pj').eq('id', id).single();
    
    if (data) { // Esta es la forma segura y profesional
      await supabase.from('equipos').update({
        puntos: data.puntos + puntos,
        pj: data.pj - 1
      }).eq('id', id);
    }
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">📜 Historial de Partidos</h1>
          <Link href="/admin" className="text-zinc-500 hover:text-white">← Volver</Link>
        </div>

        <div className="space-y-4">
          {partidos.map((p) => (
            <div key={p.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex justify-between items-center group">
              <div className="flex items-center gap-4 flex-1">
                <span className="text-zinc-600 text-xs font-mono">{new Date(p.created_at).toLocaleDateString()}</span>
                <div className="flex-1 text-right font-bold">{p.equipo_local.nombre}</div>
                <div className="bg-zinc-800 px-3 py-1 rounded text-green-500 font-bold">{p.goles_local} - {p.goles_visita}</div>
                <div className="flex-1 font-bold">{p.equipo_visita.nombre}</div>
              </div>
              <button 
                onClick={() => eliminarPartido(p)}
                className="ml-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:underline text-sm"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}