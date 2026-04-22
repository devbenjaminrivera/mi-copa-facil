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

    const { data: pLocal } = await supabase.from('jugadores').select('*').eq('equipo_id', localId);
    const { data: pVisita } = await supabase.from('jugadores').select('*').eq('equipo_id', visitaId);
    
    if (pLocal) setJugadoresLocal(pLocal);
    if (pVisita) setJugadoresVisita(pVisita);

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

    if (error) alert(error.message);
    else {
      setPartidoId(data[0].id);
      setGoleadoresL(new Array(golesL).fill(''));
      setGoleadoresV(new Array(golesV).fill(''));
      setPaso(2);
    }
  };

  const finalizarRegistro = async () => {
    // --- VALIDACIÓN OBLIGATORIA DE GOLEADORES ---
    // Verifica que no haya campos vacíos en las listas de goleadores local y visita
    const faltaGoleadorLocal = goleadoresL.some(id => id === '');
    const faltaGoleadorVisita = goleadoresV.some(id => id === '');

    if (faltaGoleadorLocal || faltaGoleadorVisita) {
      alert("Error: Debes asignar obligatoriamente todos los goles a un jugador antes de cerrar el acta.");
      return;
    }
    // --------------------------------------------

    try {
      // 1. Registrar Goles
      const todosLosGoles = [
        ...goleadoresL.map(id => ({ partido_id: partidoId, jugador_id: id, equipo_id: localId })),
        ...goleadoresV.map(id => ({ partido_id: partidoId, jugador_id: id, equipo_id: visitaId }))
      ]; // Eliminamos el .filter ya que la validación superior asegura que no habrá IDs vacíos

      if (todosLosGoles.length > 0) {
        await supabase.from('goles').insert(todosLosGoles);
        for (const g of todosLosGoles) {
          await supabase.rpc('incrementar_goles', { row_id: g.jugador_id });
        }
      }

      // 2. Registrar Sanciones (Tu lógica actual de equipo_id se mantiene igual)
      const todasLasSanciones = sanciones
        .filter(s => s.jugador_id !== '')
        .map(s => {
          const esLocal = jugadoresLocal.some(j => j.id === s.jugador_id);
          return { 
            partido_id: partidoId, 
            jugador_id: s.jugador_id, 
            tipo: s.tipo,
            equipo_id: esLocal ? localId : visitaId 
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

      alert("Acta cerrada y tabla actualizada correctamente.");
      window.location.href = '/admin';

    } catch (err) {
      console.error(err);
      alert("Error al procesar el acta.");
    }
  };

  return (
    <div className="p-4 md:p-12 bg-black min-h-screen text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <Link href="/admin" className="text-zinc-500 hover:text-white text-xs font-bold tracking-widest transition-colors">
            ← VOLVER AL PANEL
          </Link>
          <h1 className="text-3xl font-black uppercase italic mt-4 tracking-tighter">Registrar Resultados</h1>
        </header>

        {paso === 1 ? (
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Local</label>
                <select 
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl font-bold outline-none focus:border-green-500"
                  onChange={(e) => setLocalId(e.target.value)}
                >
                  <option value="">Seleccionar Equipo</option>
                  {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-center text-2xl font-black text-green-500"
                  onChange={(e) => setGolesL(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="text-center text-zinc-700 font-black italic text-4xl">VS</div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Visita</label>
                <select 
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl font-bold outline-none focus:border-green-500"
                  onChange={(e) => setVisitaId(e.target.value)}
                >
                  <option value="">Seleccionar Equipo</option>
                  {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-center text-2xl font-black text-green-500"
                  onChange={(e) => setGolesV(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <button 
              onClick={iniciarPartido}
              className="w-full mt-10 bg-white text-black py-4 rounded-xl font-black uppercase tracking-[0.2em] hover:bg-green-500 transition-all"
            >
              Siguiente Paso: Detalles →
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Registro de Goleadores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="text-xs font-black text-green-500 uppercase tracking-widest mb-6">Goleadores Local</h3>
                {goleadoresL.map((_, i) => (
                  <select 
                    key={i}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-lg mb-3 text-sm font-bold"
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

              <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
                <h3 className="text-xs font-black text-green-500 uppercase tracking-widest mb-6">Goleadores Visita</h3>
                {goleadoresV.map((_, i) => (
                  <select 
                    key={i}
                    className="w-full bg-black border border-zinc-800 p-3 rounded-lg mb-3 text-sm font-bold"
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

            {/* Sección de Tarjetas */}
            <div className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Registro de Sanciones</h2>
                <button 
                  onClick={() => setSanciones([...sanciones, { jugador_id: '', tipo: 'amarilla' }])}
                  className="bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black px-4 py-2 rounded-full transition-colors"
                >
                  + AÑADIR TARJETA
                </button>
              </div>

              <div className="space-y-4">
                {sanciones.map((s, i) => (
                  <div key={i} className="flex gap-4 items-center bg-black/40 p-4 rounded-xl border border-zinc-800/50">
                    <select 
                      className="flex-1 bg-transparent font-bold text-sm outline-none"
                      onChange={(e) => {
                        const copy = [...sanciones];
                        copy[i].jugador_id = e.target.value;
                        setSanciones(copy);
                      }}
                    >
                      <option value="">Seleccionar Jugador</option>
                      {[...jugadoresLocal, ...jugadoresVisita].map(j => (
                        <option key={j.id} value={j.id} className="bg-zinc-900">{j.nombre}</option>
                      ))}
                    </select>
                    
                    <select 
                      className={`w-32 p-2 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none bg-zinc-900 ${
                        s.tipo === 'amarilla' ? 'text-yellow-500' : 'text-red-500'
                      }`}
                      onChange={(e) => {
                        const copy = [...sanciones];
                        copy[i].tipo = e.target.value as 'amarilla' | 'roja';
                        setSanciones(copy);
                      }}
                    >
                      <option value="amarilla">🟨 AMARILLA</option>
                      <option value="roja">🟥 ROJA</option>
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