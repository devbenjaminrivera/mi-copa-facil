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
  
  const [paso, setPaso] = useState(1); // 1: Resultado, 2: Detalle (Goles/Tarjetas)
  const [partidoId, setPartidoId] = useState<number | null>(null);
  const [goleadoresL, setGoleadoresL] = useState<string[]>([]);
  const [goleadoresV, setGoleadoresV] = useState<string[]>([]);
  
  // Nuevo estado para sanciones
  const [sanciones, setSanciones] = useState<{jugador_id: string, tipo: 'amarilla' | 'roja'}[]>([]);

  useEffect(() => {
    const fetchEquipos = async () => {
      const { data } = await supabase.from('equipos').select('*').order('nombre');
      if (data) setEquipos(data);
    };
    fetchEquipos();
  }, []);

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

  const agregarSancion = () => {
    setSanciones([...sanciones, { jugador_id: '', tipo: 'amarilla' }]);
  };

  const guardarPartido = async () => {
    if (!localId || !visitaId || localId === visitaId) {
      alert("Selecciona equipos válidos");
      return;
    }

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

  const finalizarRegistro = async () => {
    // 1. Guardar Goleadores
    const todosLosGoles = [
      ...goleadoresL.map(id => ({ partido_id: partidoId, jugador_id: id, equipo_id: localId })),
      ...goleadoresV.map(id => ({ partido_id: partidoId, jugador_id: id, equipo_id: visitaId }))
    ].filter(g => g.jugador_id !== '');

    if (todosLosGoles.length > 0) {
        await supabase.from('goles').insert(todosLosGoles);
    }

    // 2. Guardar Sanciones
    const todasLasSanciones = sanciones
      .filter(s => s.jugador_id !== '')
      .map(s => ({ ...s, partido_id: partidoId }));

    if (todasLasSanciones.length > 0) {
      await supabase.from('sanciones').insert(todasLasSanciones);
    }

    alert("Registro completado con éxito 🏁");
    window.location.href = '/admin';
  };

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen text-white font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold tracking-tighter">⚽ REGISTRAR PARTIDO</h1>
          <Link href="/admin" className="text-zinc-500 hover:text-white text-xs font-mono">/CANCELAR</Link>
        </div>

        {paso === 1 ? (
          <div className="space-y-6 bg-zinc-900/50 p-6 md:p-8 rounded-2xl border border-zinc-800 shadow-2xl">
            <div className="grid grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Local</label>
                <select 
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-green-500 transition-colors"
                  onChange={(e) => setLocalId(e.target.value)}
                >
                  <option value="">Equipo...</option>
                  {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none text-center text-3xl font-black text-green-500"
                  onChange={(e) => setGolesL(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold text-right">Visita</label>
                <select 
                  className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-green-500 transition-colors text-right"
                  onChange={(e) => setVisitaId(e.target.value)}
                >
                  <option value="">Equipo...</option>
                  {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none text-center text-3xl font-black text-green-500"
                  onChange={(e) => setGolesV(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <button 
              onClick={guardarPartido}
              className="w-full bg-white text-black hover:bg-green-400 py-4 rounded-xl font-black uppercase tracking-widest transition-all mt-4"
            >
              Siguiente etapa →
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
              
              {/* Sección Goleadores */}
              <h2 className="text-[10px] font-black text-zinc-500 mb-6 uppercase tracking-[0.2em]">Autores de los Goles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-green-500 mb-3 uppercase tracking-widest border-b border-green-500/20 pb-1">Goles Local</p>
                  {golesL > 0 ? goleadoresL.map((_, i) => (
                    <select 
                      key={`l-${i}`}
                      className="w-full bg-black border border-zinc-800 p-2 rounded-lg mb-2 text-sm outline-none focus:border-green-500"
                      onChange={(e) => {
                        const copy = [...goleadoresL];
                        copy[i] = e.target.value;
                        setGoleadoresL(copy);
                      }}
                    >
                      <option value="">Seleccionar Jugador</option>
                      {jugadoresLocal.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                    </select>
                  )) : <p className="text-zinc-600 text-xs italic">Sin goles</p>}
                </div>

                <div>
                  <p className="text-[10px] font-bold text-green-500 mb-3 uppercase tracking-widest border-b border-green-500/20 pb-1 text-right">Goles Visita</p>
                  {golesV > 0 ? goleadoresV.map((_, i) => (
                    <select 
                      key={`v-${i}`}
                      className="w-full bg-black border border-zinc-800 p-2 rounded-lg mb-2 text-sm outline-none focus:border-green-500 text-right"
                      onChange={(e) => {
                        const copy = [...goleadoresV];
                        copy[i] = e.target.value;
                        setGoleadoresV(copy);
                      }}
                    >
                      <option value="">Seleccionar Jugador</option>
                      {jugadoresVisita.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                    </select>
                  )) : <p className="text-zinc-600 text-xs italic text-right">Sin goles</p>}
                </div>
              </div>

              {/* Sección Sanciones */}
              <div className="mt-10 pt-8 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Sanciones</h2>
                  <button 
                    onClick={agregarSancion}
                    className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-3 py-1 rounded-full font-bold transition-colors"
                  >
                    + AGREGAR TARJETA
                  </button>
                </div>

                {sanciones.length === 0 && <p className="text-zinc-600 text-xs italic text-center mb-4">No se registraron tarjetas en este partido.</p>}

                {sanciones.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-3 bg-black/40 p-2 rounded-xl border border-zinc-800/50">
                    <select 
                      className="flex-1 bg-zinc-900 border border-zinc-800 p-2 rounded-lg text-sm text-white outline-none focus:border-green-500 appearance-none"
                      onChange={(e) => {
                        const copy = [...sanciones];
                        copy[i].jugador_id = e.target.value;
                        setSanciones(copy);
                      }}
                    >
                      <option value="" className="bg-zinc-900 text-white">Seleccionar Jugador...</option>
                      {[...jugadoresLocal, ...jugadoresVisita].map(j => (
                        <option key={j.id} value={j.id} className="bg-zinc-900 text-white">
                          {j.nombre}
                        </option>
                      ))}
                    </select>
                    
                    <select 
                      className={`w-32 p-1 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none ${
                        s.tipo === 'amarilla' ? 'text-yellow-500' : 'text-red-500'
                      }`}
                      onChange={(e) => {
                        const copy = [...sanciones];
                        copy[i].tipo = e.target.value as 'amarilla' | 'roja';
                        setSanciones(copy);
                      }}
                    >
                      <option value="amarilla" className="bg-zinc-900 text-yellow-500">🟨 AMARILLA</option>
                      <option value="roja" className="bg-zinc-900 text-red-500">🟥 ROJA</option>
                    </select>
                  </div>
                ))}
              </div>

              <button 
                onClick={finalizarRegistro}
                className="w-full mt-10 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-black uppercase tracking-[0.2em] transition-all"
              >
                Cerrar Acta de Partido 🏁
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}