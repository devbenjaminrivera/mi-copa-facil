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
  
  const [paso, setPaso] = useState(1); 
  const [partidoId, setPartidoId] = useState<number | null>(null);
  const [goleadoresL, setGoleadoresL] = useState<string[]>([]);
  const [goleadoresV, setGoleadoresV] = useState<string[]>([]);
  
  const [sanciones, setSanciones] = useState<{jugador_id: string, tipo: 'amarilla' | 'roja'}[]>([]);

  // Carga inicial de equipos
  useEffect(() => {
    const fetchEquipos = async () => {
      const { data } = await supabase.from('equipos').select('*').order('nombre');
      if (data) setEquipos(data);
    };
    fetchEquipos();
  }, []);

  const iniciarPartido = async () => {
    if (!localId || !visitaId || localId === visitaId) {
      alert("Selecciona dos equipos distintos");
      return;
    }

    // 1. CARGA DE JUGADORES (Antes de pasar al siguiente paso)
    // Nota: Verifica si en tu DB es 'equipo_id' o 'id_equipo'
    const [resLocal, resVisita] = await Promise.all([
      supabase.from('jugadores').select('*').eq('id_equipo', localId),
      supabase.from('jugadores').select('*').eq('id_equipo', visitaId)
    ]);

    if (resLocal.error || resVisita.error) {
      alert("Error al cargar las plantillas de los jugadores.");
      return;
    }

    setJugadoresLocal(resLocal.data || []);
    setJugadoresVisita(resVisita.data || []);

    // 2. CREACIÓN DEL REGISTRO DE PARTIDO
    const { data, error } = await supabase
      .from('partidos')
      .insert([{
        equipo_local: localId,
        equipo_visita: visitaId,
        goles_local: golesL,
        goles_visita: golesV,
        estado: 'jugado'
      }])
      .select();

    if (error) {
      alert("Error en Supabase: " + error.message);
    } else {
      setPartidoId(data[0].id);
      setGoleadoresL(new Array(golesL).fill(''));
      setGoleadoresV(new Array(golesV).fill(''));
      setPaso(2); // Pasamos al acta detallada
    }
  };

  const finalizarRegistro = async () => {
    const faltaGoleadorLocal = goleadoresL.some(id => id === '');
    const faltaGoleadorVisita = goleadoresV.some(id => id === '');

    if (faltaGoleadorLocal || faltaGoleadorVisita) {
      alert("Debes asignar todos los goles a un jugador antes de cerrar el acta.");
      return;
    }

    try {
  const todosLosGoles = [
    ...goleadoresL.map(id => ({ partido_id: partidoId, jugador_id: id, id_equipo: localId })),
    ...goleadoresV.map(id => ({ partido_id: partidoId, jugador_id: id, id_equipo: visitaId }))
  ];

  if (todosLosGoles.length > 0) {
    await supabase.from('goles').insert(todosLosGoles);
    for (const g of todosLosGoles) {
      // Importante: row_id debe ser int4 si tus IDs son números
      await supabase.rpc('incrementar_goles', { row_id: g.jugador_id });
    }
  }

  // Sanciones unificadas
  const todasLasSanciones = sanciones
    .filter(s => s.jugador_id !== '')
    .map(s => {
      const esLocal = jugadoresLocal.some(j => j.id === s.jugador_id);
      return { 
        partido_id: partidoId, 
        jugador_id: s.jugador_id, 
        tipo: s.tipo,
        id_equipo: esLocal ? localId : visitaId 
      };
    });

      if (todasLasSanciones.length > 0) {
        await supabase.from('sanciones').insert(todasLasSanciones);
      }

      // 3. Actualizar Tabla de Posiciones
      await supabase.rpc('actualizar_tabla_posiciones', {
        id_local: localId,
        id_visita: visitaId,
        g_local: golesL,
        g_visita: golesV
      });

      alert("Acta cerrada y goleadores actualizados.");
      window.location.href = '/admin';

    } catch (err) {
      console.error("Error crítico:", err);
      alert("Error al procesar el acta. Revisa la consola.");
    }
  };

  return (
    <div className="p-4 md:p-12 bg-black min-h-screen text-white font-sans pt-20">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <Link href="/admin" className="text-zinc-500 hover:text-white text-[10px] font-black tracking-[0.3em] transition-colors">
            ← VOLVER AL PANEL
          </Link>
          <h1 className="text-4xl font-black uppercase italic mt-4 tracking-tighter">Cerrar Acta de Partido</h1>
        </header>

        {paso === 1 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[2.5rem] shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-2">Local</label>
                <select 
                  className="w-full bg-black border border-zinc-800 p-4 rounded-2xl font-bold outline-none focus:border-green-500 transition-all"
                  onChange={(e) => setLocalId(e.target.value)}
                  value={localId}
                >
                  <option value="">Seleccionar Equipo</option>
                  {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="Goles"
                  className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-center text-3xl font-black text-green-500 outline-none"
                  onChange={(e) => setGolesL(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="text-center text-zinc-800 font-black italic text-5xl opacity-50">VS</div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-2">Visita</label>
                <select 
                  className="w-full bg-black border border-zinc-800 p-4 rounded-2xl font-bold outline-none focus:border-green-500 transition-all"
                  onChange={(e) => setVisitaId(e.target.value)}
                  value={visitaId}
                >
                  <option value="">Seleccionar Equipo</option>
                  {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="Goles"
                  className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-center text-3xl font-black text-green-500 outline-none"
                  onChange={(e) => setGolesV(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <button 
              onClick={iniciarPartido}
              className="w-full mt-10 bg-white text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-green-500 transition-all text-xs"
            >
              Confirmar Marcador e Ir a Detalles →
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Registro de Goleadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
                <h3 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-6">Goleadores Local</h3>
                {goleadoresL.map((_, i) => (
                  <select 
                    key={i}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-xl mb-3 text-sm font-bold outline-none focus:border-green-500"
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

              <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
                <h3 className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-6">Goleadores Visita</h3>
                {goleadoresV.map((_, i) => (
                  <select 
                    key={i}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-xl mb-3 text-sm font-bold outline-none focus:border-green-500"
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
            </div>

            {/* Registro de Sanciones */}
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xs font-black uppercase tracking-[0.2em]">Sanciones del Encuentro</h2>
                <button 
                  onClick={() => setSanciones([...sanciones, { jugador_id: '', tipo: 'amarilla' }])}
                  className="bg-zinc-800 hover:bg-zinc-700 text-[9px] font-black px-5 py-2 rounded-full transition-colors tracking-widest border border-zinc-700"
                >
                  + AÑADIR TARJETA
                </button>
              </div>

              <div className="space-y-4">
                {sanciones.map((s, i) => (
                  <div key={i} className="flex gap-4 items-center bg-black/60 p-4 rounded-2xl border border-zinc-800/50">
                    <select 
                      className="flex-1 bg-transparent font-bold text-sm outline-none"
                      onChange={(e) => {
                        const copy = [...sanciones];
                        copy[i].jugador_id = e.target.value;
                        setSanciones(copy);
                      }}
                    >
                      <option value="">Jugador amonestado/expulsado</option>
                      {[...jugadoresLocal, ...jugadoresVisita].map(j => (
                        <option key={j.id} value={j.id} className="bg-zinc-900">{j.nombre}</option>
                      ))}
                    </select>
                    
                    <select 
                      className={`w-36 p-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none bg-zinc-900 border border-zinc-800 ${
                        s.tipo === 'amarilla' ? 'text-yellow-500' : 'text-red-500'
                      }`}
                      onChange={(e) => {
                        const copy = [...sanciones];
                        copy[i].tipo = e.target.value as 'amarilla' | 'roja';
                        setSanciones(copy);
                      }}
                    >
                      <option value="amarilla">🟨 Amarilla</option>
                      <option value="roja">🟥 Roja</option>
                    </select>
                  </div>
                ))}
                {sanciones.length === 0 && (
                    <p className="text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest py-4">No hay sanciones registradas</p>
                )}
              </div>

              <button 
                onClick={finalizarRegistro}
                className="w-full mt-12 bg-green-600 hover:bg-green-400 text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all text-xs"
              >
                Cerrar Acta y Actualizar Torneo 🏆
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}