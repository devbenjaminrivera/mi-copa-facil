'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

  const [sanciones, setSanciones] = useState<{ jugador_id: string; tipo: 'amarilla' | 'roja' }[]>([]);
  const [mvpId, setMvpId] = useState('');
  const [jornada, setJornada] = useState('');
  const [guardando, setGuardando] = useState(false);

  const equipoLocalNombre = equipos.find(e => String(e.id) === String(localId))?.nombre || 'Local';
  const equipoVisitaNombre = equipos.find(e => String(e.id) === String(visitaId))?.nombre || 'Visita';

  useEffect(() => {
    supabase.from('equipos').select('*').order('nombre').then(({ data }) => {
      if (data) setEquipos(data);
    });
  }, []);

  const iniciarPartido = async () => {
    if (!localId || !visitaId || localId === visitaId || !jornada) {
      alert('Selecciona equipos distintos y define la jornada');
      return;
    }

    setGuardando(true);
    const [resLocal, resVisita] = await Promise.all([
      supabase.from('jugadores').select('*').eq('id_equipo', localId),
      supabase.from('jugadores').select('*').eq('id_equipo', visitaId),
    ]);

    if (resLocal.error || resVisita.error) {
      alert('Error al cargar las plantillas de los jugadores.');
      setGuardando(false);
      return;
    }

    setJugadoresLocal(resLocal.data || []);
    setJugadoresVisita(resVisita.data || []);

    const { data, error } = await supabase
      .from('partidos')
      .insert([{
        equipo_local: localId,
        equipo_visita: visitaId,
        goles_local: golesL,
        goles_visita: golesV,
        jornada: parseInt(jornada),
        estado: 'jugado',
        fecha: new Date().toISOString(),
      }])
      .select();

    if (error) {
      alert('Error en Supabase: ' + error.message);
    } else {
      setPartidoId(data[0].id);
      setGoleadoresL(new Array(golesL).fill(''));
      setGoleadoresV(new Array(golesV).fill(''));
      setPaso(2);
    }
    setGuardando(false);
  };

  const finalizarRegistro = async () => {
    if (!mvpId) return alert('Debes seleccionar al MVP del encuentro');
    if (goleadoresL.some(id => id === '') || goleadoresV.some(id => id === '')) {
      return alert('Debes asignar todos los goles a un jugador antes de cerrar el acta.');
    }

    setGuardando(true);
    try {
      const { error: errorMvp } = await supabase
        .from('partidos')
        .update({ id_mvp: parseInt(mvpId) })
        .eq('id', partidoId);
      if (errorMvp) throw errorMvp;

      const todosLosGoles = [
        ...goleadoresL.map(id => ({ partido_id: partidoId, jugador_id: id, id_equipo: localId })),
        ...goleadoresV.map(id => ({ partido_id: partidoId, jugador_id: id, id_equipo: visitaId })),
      ];

      if (todosLosGoles.length > 0) {
        await supabase.from('goles').insert(todosLosGoles);
        for (const g of todosLosGoles) {
          await supabase.rpc('incrementar_goles', { row_id: g.jugador_id });
        }
      }

      const todasLasSanciones = sanciones
        .filter(s => s.jugador_id !== '')
        .map(s => {
          const esLocal = jugadoresLocal.some(j => String(j.id) === String(s.jugador_id));
          return {
            partido_id: partidoId,
            jugador_id: s.jugador_id,
            tipo: s.tipo,
            id_equipo: esLocal ? localId : visitaId,
          };
        });

      if (todasLasSanciones.length > 0) {
        await supabase.from('sanciones').insert(todasLasSanciones);
      }

      await supabase.rpc('actualizar_tabla_posiciones', {
        id_local: localId,
        id_visita: visitaId,
        g_local: golesL,
        g_visita: golesV,
      });

      alert('Acta cerrada, goleadores y MVP actualizados.');
      window.location.href = '/admin';
    } catch (err) {
      console.error('Error crítico:', err);
      alert('Error al procesar el acta. Revisa la consola.');
    }
    setGuardando(false);
  };

  // ─── CLASES REUTILIZABLES ───────────────────────────────────────────
  const inputBase = 'w-full bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 focus:border-green-500 p-4 rounded-2xl outline-none transition-all font-bold text-sm';
  const selectBase = `${inputBase} cursor-pointer`;

  return (
    <div className="p-4 md:p-10 text-white font-sans">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <header className="mb-10 pt-6">
          <p className="text-green-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-3">
            Admin / Partidos
          </p>
          <div className="flex items-end justify-between">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
              Cerrar Acta
            </h1>
            {/* INDICADOR DE PASO */}
            <div className="flex items-center gap-2 mb-1">
              {[1, 2].map(n => (
                <div key={n} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all
                    ${paso >= n ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-600'}
                  `}>
                    {n}
                  </div>
                  {n < 2 && <div className={`w-8 h-px transition-all ${paso > n ? 'bg-green-500' : 'bg-zinc-800'}`} />}
                </div>
              ))}
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-2">
                {paso === 1 ? 'Marcador' : 'Detalles'}
              </span>
            </div>
          </div>
        </header>

        {/* ── PASO 1: MARCADOR ─────────────────────────────────────────── */}
        {paso === 1 && (
          <div className="space-y-6">

            {/* JORNADA */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-6">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] block mb-3">
                Jornada
              </label>
              <input
                type="number"
                placeholder="Ej: 1"
                className={`${inputBase} max-w-[160px] text-center text-lg`}
                onChange={e => setJornada(e.target.value)}
                value={jornada}
              />
            </div>

            {/* EQUIPOS Y MARCADOR */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">

                {/* LOCAL */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] block">
                    Local
                  </label>
                  <select className={selectBase} onChange={e => setLocalId(e.target.value)} value={localId}>
                    <option value="">Seleccionar equipo</option>
                    {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className={`${inputBase} text-center text-4xl font-black text-green-400 tracking-tighter py-6`}
                    onChange={e => setGolesL(parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* VS */}
                <div className="hidden md:flex items-center justify-center pt-14">
                  <span className="text-2xl font-black text-zinc-800 italic">VS</span>
                </div>

                {/* VISITA */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] block">
                    Visita
                  </label>
                  <select className={selectBase} onChange={e => setVisitaId(e.target.value)} value={visitaId}>
                    <option value="">Seleccionar equipo</option>
                    {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                  </select>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className={`${inputBase} text-center text-4xl font-black text-green-400 tracking-tighter py-6`}
                    onChange={e => setGolesV(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={iniciarPartido}
              disabled={guardando}
              className="w-full bg-white text-black hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-xs flex items-center justify-center gap-2"
            >
              {guardando
                ? <><div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" /> Procesando...</>
                : 'Confirmar marcador e ir a detalles →'
              }
            </button>
          </div>
        )}

        {/* ── PASO 2: DETALLES ─────────────────────────────────────────── */}
        {paso === 2 && (
          <div className="space-y-6">

            {/* RESUMEN DEL MARCADOR */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-black uppercase tracking-tight text-zinc-300">{equipoLocalNombre}</span>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                  <span className="text-2xl font-black font-mono text-green-400">{golesL}</span>
                  <span className="text-zinc-700 font-black text-sm">–</span>
                  <span className="text-2xl font-black font-mono text-green-400">{golesV}</span>
                </div>
                <span className="text-sm font-black uppercase tracking-tight text-zinc-300">{equipoVisitaNombre}</span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 border border-zinc-800 px-2 py-1 rounded-lg">
                J{jornada}
              </span>
            </div>

            {/* GOLEADORES */}
            {(golesL > 0 || golesV > 0) && (
              <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-5">
                  Goleadores
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* LOCAL */}
                  {golesL > 0 && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-green-500 mb-3">
                        {equipoLocalNombre}
                      </p>
                      <div className="space-y-2">
                        {goleadoresL.map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-zinc-700 w-4 text-center font-mono">{i + 1}</span>
                            <select
                              className={`${selectBase} flex-1 text-xs`}
                              onChange={e => {
                                const copy = [...goleadoresL];
                                copy[i] = e.target.value;
                                setGoleadoresL(copy);
                              }}
                            >
                              <option value="">Seleccionar jugador</option>
                              {jugadoresLocal.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VISITA */}
                  {golesV > 0 && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-green-500 mb-3">
                        {equipoVisitaNombre}
                      </p>
                      <div className="space-y-2">
                        {goleadoresV.map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-zinc-700 w-4 text-center font-mono">{i + 1}</span>
                            <select
                              className={`${selectBase} flex-1 text-xs`}
                              onChange={e => {
                                const copy = [...goleadoresV];
                                copy[i] = e.target.value;
                                setGoleadoresV(copy);
                              }}
                            >
                              <option value="">Seleccionar jugador</option>
                              {jugadoresVisita.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SANCIONES */}
            <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                  Sanciones
                </h2>
                <button
                  onClick={() => setSanciones([...sanciones, { jugador_id: '', tipo: 'amarilla' }])}
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Añadir tarjeta
                </button>
              </div>

              {sanciones.length === 0 ? (
                <p className="text-center text-zinc-700 text-[10px] font-black uppercase tracking-widest py-6">
                  Sin sanciones en este partido
                </p>
              ) : (
                <div className="space-y-2">
                  {sanciones.map((s, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      {/* TARJETA VISUAL */}
                      <div className={`shrink-0 w-4 h-5 rounded-[3px] shadow ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'}`} />

                      {/* SELECT JUGADOR */}
                      <select
                        className={`${selectBase} flex-1 text-xs`}
                        value={s.jugador_id}
                        onChange={e => {
                          const copy = [...sanciones];
                          copy[i].jugador_id = e.target.value;
                          setSanciones(copy);
                        }}
                      >
                        <option value="">Jugador</option>
                        <option disabled>── {equipoLocalNombre} ──</option>
                        {jugadoresLocal.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                        <option disabled>── {equipoVisitaNombre} ──</option>
                        {jugadoresVisita.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                      </select>

                      {/* SELECT TIPO */}
                      <select
                        className={`shrink-0 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 focus:border-green-500 p-3 rounded-2xl outline-none transition-all font-black text-[10px] uppercase tracking-wider cursor-pointer
                          ${s.tipo === 'amarilla' ? 'text-yellow-400' : 'text-red-500'}
                        `}
                        value={s.tipo}
                        onChange={e => {
                          const copy = [...sanciones];
                          copy[i].tipo = e.target.value as 'amarilla' | 'roja';
                          setSanciones(copy);
                        }}
                      >
                        <option value="amarilla">Amarilla</option>
                        <option value="roja">Roja</option>
                      </select>

                      {/* ELIMINAR */}
                      <button
                        onClick={() => setSanciones(sanciones.filter((_, j) => j !== i))}
                        className="shrink-0 w-8 h-8 flex items-center justify-center text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MVP */}
            <div className="bg-zinc-900/30 border border-yellow-500/20 rounded-2xl p-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-500/80 mb-4">
                Jugador destacado — MVP
              </h2>
              <select
                className={`${selectBase} text-yellow-400 border-yellow-500/20 focus:border-yellow-500`}
                onChange={e => setMvpId(e.target.value)}
                value={mvpId}
              >
                <option value="">Seleccionar el mejor de la cancha</option>
                <option disabled>── {equipoLocalNombre} ──</option>
                {jugadoresLocal.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                <option disabled>── {equipoVisitaNombre} ──</option>
                {jugadoresVisita.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
              </select>
            </div>

            {/* CTA CERRAR ACTA */}
            <button
              onClick={finalizarRegistro}
              disabled={guardando}
              className="w-full bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all text-xs flex items-center justify-center gap-2"
            >
              {guardando
                ? <><div className="w-4 h-4 border-2 border-green-800 border-t-green-400 rounded-full animate-spin" /> Guardando acta...</>
                : 'Cerrar acta y actualizar torneo →'
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}