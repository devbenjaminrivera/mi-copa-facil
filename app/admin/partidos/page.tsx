'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function RegistrarPartido() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [jugadoresLocal, setJugadoresLocal] = useState<any[]>([]);
  const [jugadoresVisita, setJugadoresVisita] = useState<any[]>([]);
  
  const [localId, setLocalId] = useState('');
  const [visitaId, setVisitaId] = useState('');
  const [golesL, setGolesL] = useState(0);
  const [golesV, setGolesV] = useState(0);
  
  const [paso, setPaso] = useState(1); // 1: Resultado, 2: Goleadores
  const [partidoId, setPartidoId] = useState<number | null>(null);
  const [goleadoresL, setGoleadoresL] = useState<string[]>([]);
  const [goleadoresV, setGoleadoresV] = useState<string[]>([]);

  useEffect(() => {
    const fetchEquipos = async () => {
      const { data } = await supabase.from('equipos').select('*').order('nombre');
      if (data) setEquipos(data);
    };
    fetchEquipos();
  }, []);

  // Cargar jugadores cuando se seleccionan los equipos
  useEffect(() => {
    if (localId) fetchJugadores(localId, setJugadoresLocal);
  }, [localId]);

  useEffect(() => {
    if (visitaId) fetchJugadores(visitaId, setJugadoresVisita);
  }, [visitaId]);

  const fetchJugadores = async (id: string, setter: any) => {
    const { data } = await supabase.from('jugadores').select('*').eq('equipo_id', id);
    if (data) setter(data);
  };

  const guardarPartido = async () => {
    if (!localId || !visitaId || localId === visitaId) {
      alert("Selecciona equipos válidos");
      return;
    }

    // 1. Insertar el partido
    const { data, error } = await supabase.from('partidos').insert([
      { 
        equipo_local: localId, 
        equipo_visita: visitaId, 
        goles_local: golesL, 
        goles_visita: golesV,
        estado: 'jugado'
      }
    ]).select();

    if (error) {
      alert("Error: " + error.message);
      return;
    }

    setPartidoId(data[0].id);
    setGoleadoresL(new Array(golesL).fill(''));
    setGoleadoresV(new Array(golesV).fill(''));
    setPaso(2);
  };

  const guardarGoleadores = async () => {
    const todosLosGoles = [
      ...goleadoresL.map(id => ({ partido_id: partidoId, jugador_id: id, equipo_id: localId })),
      ...goleadoresV.map(id => ({ partido_id: partidoId, jugador_id: id, equipo_id: visitaId }))
    ].filter(g => g.jugador_id !== '');

    const { error } = await supabase.from('goles').insert(todosLosGoles);

    if (error) alert("Error al guardar goleadores");
    else {
      alert("Partido y goleadores registrados con éxito");
      window.location.href = '/admin';
    }
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">⚽ Registrar Resultado</h1>
          <Link href="/admin" className="text-zinc-500 hover:text-white text-sm">← Cancelar</Link>
        </div>

        {paso === 1 ? (
          <div className="space-y-6 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
            <div className="grid grid-cols-2 gap-8">
              {/* Local */}
              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-widest text-zinc-500">Local</label>
                <select 
                  className="w-full bg-black border border-zinc-700 p-3 rounded-lg outline-none focus:border-green-500"
                  onChange={(e) => setLocalId(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="Goles"
                  className="w-full bg-black border border-zinc-700 p-3 rounded-lg outline-none text-center text-2xl font-bold"
                  onChange={(e) => setGolesL(parseInt(e.target.value) || 0)}
                />
              </div>

              {/* Visita */}
              <div className="space-y-4">
                <label className="block text-xs uppercase tracking-widest text-zinc-500 text-right">Visita</label>
                <select 
                  className="w-full bg-black border border-zinc-700 p-3 rounded-lg outline-none focus:border-green-500 text-right"
                  onChange={(e) => setVisitaId(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="Goles"
                  className="w-full bg-black border border-zinc-700 p-3 rounded-lg outline-none text-center text-2xl font-bold"
                  onChange={(e) => setGolesV(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <button 
              onClick={guardarPartido}
              className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold transition-all shadow-lg shadow-green-900/20"
            >
              Siguiente: Asignar Goleadores →
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-sm font-bold text-zinc-400 mb-6 uppercase tracking-widest">¿Quiénes anotaron?</h2>
              
              {/* Goleadores Local */}
              {golesL > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-green-500 mb-3 uppercase tracking-tighter">Goles Local</p>
                  {goleadoresL.map((_, i) => (
                    <select 
                      key={`l-${i}`}
                      className="w-full bg-black border border-zinc-800 p-3 rounded-lg mb-2 outline-none focus:border-green-500"
                      onChange={(e) => {
                        const copy = [...goleadoresL];
                        copy[i] = e.target.value;
                        setGoleadoresL(copy);
                      }}
                    >
                      <option value="">Seleccionar Jugador</option>
                      {jugadoresLocal.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                    </select>
                  ))}
                </div>
              )}

              {/* Goleadores Visita */}
              {golesV > 0 && (
                <div>
                  <p className="text-xs font-bold text-green-500 mb-3 uppercase tracking-tighter text-right">Goles Visita</p>
                  {goleadoresV.map((_, i) => (
                    <select 
                      key={`v-${i}`}
                      className="w-full bg-black border border-zinc-800 p-3 rounded-lg mb-2 outline-none focus:border-green-500"
                      onChange={(e) => {
                        const copy = [...goleadoresV];
                        copy[i] = e.target.value;
                        setGoleadoresV(copy);
                      }}
                    >
                      <option value="">Seleccionar Jugador</option>
                      {jugadoresVisita.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                    </select>
                  ))}
                </div>
              )}

              <button 
                onClick={guardarGoleadores}
                className="w-full mt-6 bg-white text-black hover:bg-zinc-200 py-4 rounded-xl font-bold transition-all"
              >
                Finalizar Registro 🏁
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}