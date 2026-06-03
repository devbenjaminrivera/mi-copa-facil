'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const LLAVES = [
  { id: 'semi_1', label: 'Semifinal 1', fase: 'semi', desc: '1° vs 4° lugar' },
  { id: 'semi_2', label: 'Semifinal 2', fase: 'semi', desc: '2° vs 3° lugar' },
  { id: 'oro',    label: 'Gran Final',  fase: 'final', desc: 'Ganadores S1 vs S2' },
  { id: 'bronce', label: '3° y 4° lugar', fase: 'bronce', desc: 'Perdedores S1 vs S2' },
];

const inputBase = 'w-full bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 focus:border-green-500 p-4 rounded-2xl outline-none transition-all font-bold text-sm text-white';
const selectBase = `${inputBase} cursor-pointer`;

export default function AdminPlayoffs() {
  const [equipos, setEquipos]       = useState<any[]>([]);
  const [partidos, setPartidos]     = useState<any[]>([]);
  const [jugadoresL, setJugadoresL] = useState<any[]>([]);
  const [jugadoresV, setJugadoresV] = useState<any[]>([]);

  // Crear partido
  const [llave,    setLlave]    = useState('');
  const [localId,  setLocalId]  = useState('');
  const [visitaId, setVisitaId] = useState('');
  const [fecha,    setFecha]    = useState('');
  const [creando,  setCreando]  = useState(false);

  // Registrar resultado
  const [partidoSel, setPartidoSel] = useState<any>(null);
  const [golesL,     setGolesL]     = useState(0);
  const [golesV,     setGolesV]     = useState(0);
  const [penalesL,   setPenalesL]   = useState('');
  const [penalesV,   setPenalesV]   = useState('');
  const [huboTanda,  setHuboTanda]  = useState(false);
  const [goleadoresL, setGoleadoresL] = useState<string[]>([]);
  const [goleadoresV, setGoleadoresV] = useState<string[]>([]);
  const [mvpId,      setMvpId]      = useState('');
  const [paso,       setPaso]       = useState<1|2>(1);
  const [guardando,  setGuardando]  = useState(false);

  const fetchData = async () => {
    const [{ data: eq }, { data: part }] = await Promise.all([
      supabase.from('equipos').select('*').order('puntos', { ascending: false }),
      supabase.from('partidos')
        .select(`id, llave, fase, estado, fecha, goles_local, goles_visita, penales_local, penales_visita,
          equipo_local:equipos!equipo_local(id, nombre),
          equipo_visita:equipos!equipo_visita(id, nombre)`)
        .neq('fase', 'regular')
        .order('created_at', { ascending: true }),
    ]);
    if (eq) setEquipos(eq);
    if (part) {
      // Supabase joins can return arrays — normalize to objects
      const normalized = part.map((p: any) => ({
        ...p,
        equipo_local:  Array.isArray(p.equipo_local)  ? p.equipo_local[0]  : p.equipo_local,
        equipo_visita: Array.isArray(p.equipo_visita) ? p.equipo_visita[0] : p.equipo_visita,
      }));
      setPartidos(normalized);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── CREAR PARTIDO DE PLAYOFFS ──────────────────────────────────────
  const crearPartido = async () => {
    if (!llave || !localId || !visitaId || localId === visitaId) {
      alert('Selecciona llave y dos equipos distintos');
      return;
    }
    // Verificar que esa llave no exista ya
    if (partidos.find(p => p.llave === llave)) {
      alert('Ya existe un partido para esa llave. Elimínalo primero si quieres recrearlo.');
      return;
    }
    setCreando(true);
    const meta = LLAVES.find(l => l.id === llave)!;
    const { error } = await supabase.from('partidos').insert([{
      equipo_local:  localId,
      equipo_visita: visitaId,
      estado: 'programado',
      fase:   meta.fase,
      llave:  llave,
      jornada: 99, // jornada especial para playoffs
      fecha: fecha ? new Date(fecha).toISOString() : null,
      goles_local:  0,
      goles_visita: 0,
    }]);
    if (error) alert('Error: ' + error.message);
    else {
      setLlave(''); setLocalId(''); setVisitaId(''); setFecha('');
      fetchData();
    }
    setCreando(false);
  };

  // ── SELECCIONAR PARTIDO PARA REGISTRAR RESULTADO ──────────────────
  const seleccionarPartido = async (p: any) => {
    setPartidoSel(p);
    setGolesL(0); setGolesV(0);
    setPenalesL(''); setPenalesV('');
    setHuboTanda(false);
    setMvpId('');
    setPaso(1);

    const [{ data: jl }, { data: jv }] = await Promise.all([
      supabase.from('jugadores').select('*').eq('id_equipo', p.equipo_local.id),
      supabase.from('jugadores').select('*').eq('id_equipo', p.equipo_visita.id),
    ]);
    setJugadoresL(jl || []);
    setJugadoresV(jv || []);
  };

  const confirmarMarcador = () => {
    if (huboTanda && (!penalesL || !penalesV)) {
      alert('Ingresa los penales de ambos equipos');
      return;
    }
    setGoleadoresL(new Array(golesL).fill(''));
    setGoleadoresV(new Array(golesV).fill(''));
    setPaso(2);
  };

  // ── GUARDAR RESULTADO COMPLETO ─────────────────────────────────────
  const guardarResultado = async () => {
    if (!mvpId) return alert('Selecciona el MVP');
    if (goleadoresL.some(id => id === '') || goleadoresV.some(id => id === '')) {
      return alert('Asigna todos los goles a un jugador');
    }
    setGuardando(true);
    try {
      // 1. Actualizar el partido
      const { error: errPartido } = await supabase.from('partidos').update({
        goles_local:    golesL,
        goles_visita:   golesV,
        penales_local:  huboTanda ? parseInt(penalesL) : null,
        penales_visita: huboTanda ? parseInt(penalesV) : null,
        estado:         'jugado',
        id_mvp:         parseInt(mvpId),
        fecha:          new Date().toISOString(),
      }).eq('id', partidoSel.id);
      if (errPartido) throw errPartido;

      // 2. Registrar goles
      const todosGoles = [
        ...goleadoresL.map(id => ({ partido_id: partidoSel.id, jugador_id: id, id_equipo: partidoSel.equipo_local.id })),
        ...goleadoresV.map(id => ({ partido_id: partidoSel.id, jugador_id: id, id_equipo: partidoSel.equipo_visita.id })),
      ];
      if (todosGoles.length > 0) {
        await supabase.from('goles').insert(todosGoles);
        for (const g of todosGoles) {
          await supabase.rpc('incrementar_goles', { row_id: g.jugador_id });
        }
      }

      setPartidoSel(null);
      setPaso(1);
      fetchData();
      alert('Resultado registrado correctamente.');
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
    setGuardando(false);
  };

  // ── ELIMINAR PARTIDO ───────────────────────────────────────────────
  const eliminarPartido = async (id: number) => {
    if (!confirm('¿Eliminar este partido del bracket?')) return;
    await supabase.from('partidos').delete().eq('id', id);
    fetchData();
  };

  const llavesMeta: Record<string, any> = Object.fromEntries(LLAVES.map(l => [l.id, l]));
  const ordenLlaves = ['semi_1', 'semi_2', 'oro', 'bronce'];
  const llavesTaken = new Set(partidos.map(p => p.llave));

  return (
    <div className="p-4 md:p-10 text-white font-sans">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <header className="mb-10 pt-6">
          <p className="text-yellow-600 font-mono text-[10px] uppercase tracking-[0.3em] mb-3">
            Admin / Playoffs
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
            Gestión de Bracket
          </h1>
        </header>

        {/* ── SECCIÓN 1: ESTADO DEL BRACKET ─────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">Estado del bracket</span>
            <div className="flex-1 h-px bg-zinc-900" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ordenLlaves.map((id) => {
              const meta   = llavesMeta[id];
              const partido = partidos.find(p => p.llave === id);
              const jugado  = partido?.estado === 'jugado';

              return (
                <div key={id} className={`border rounded-xl p-4 transition-all
                  ${jugado        ? 'border-green-500/30 bg-green-500/5'
                  : partido       ? 'border-yellow-500/20 bg-yellow-500/5'
                  : 'border-zinc-900 bg-zinc-950/50'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className={`text-[8px] font-black uppercase tracking-widest
                        ${jugado ? 'text-green-600' : partido ? 'text-yellow-700' : 'text-zinc-700'}`}>
                        {meta.label}
                      </p>
                      <p className="text-[7px] text-zinc-800 uppercase tracking-wider">{meta.desc}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full mt-0.5 shrink-0
                      ${jugado ? 'bg-green-500' : partido ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-800'}`} />
                  </div>

                  {partido ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="relative w-5 h-5 shrink-0">
                          <Image src={`/escudos/${partido.equipo_local?.id}.png`} alt="" fill className="object-contain" />
                        </div>
                        <span className="text-[9px] font-black text-zinc-400 truncate flex-1">{partido.equipo_local?.nombre}</span>
                        {jugado && <span className="text-[10px] font-black text-white tabular-nums">{partido.goles_local}</span>}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="relative w-5 h-5 shrink-0">
                          <Image src={`/escudos/${partido.equipo_visita?.id}.png`} alt="" fill className="object-contain" />
                        </div>
                        <span className="text-[9px] font-black text-zinc-400 truncate flex-1">{partido.equipo_visita?.nombre}</span>
                        {jugado && <span className="text-[10px] font-black text-white tabular-nums">{partido.goles_visita}</span>}
                      </div>
                      {partido.fecha && (
                        <p className="text-[7px] font-mono text-zinc-700 mb-2">
                          {new Date(partido.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {!jugado && (
                        <button
                          onClick={() => seleccionarPartido(partido)}
                          className="w-full text-[8px] font-black uppercase tracking-widest bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 py-1.5 rounded-lg transition-all"
                        >
                          Registrar resultado →
                        </button>
                      )}
                      {jugado && (
                        <p className="text-[8px] font-black text-green-600 uppercase tracking-widest text-center">✓ Completado</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[8px] text-zinc-800 font-black uppercase tracking-widest">Sin asignar</p>
                  )}

                  {partido && (
                    <button
                      onClick={() => eliminarPartido(partido.id)}
                      className="mt-2 text-[7px] font-black uppercase tracking-widest text-zinc-800 hover:text-red-500 transition-colors"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── SECCIÓN 2: CREAR PARTIDO ──────────────────────────────── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">Crear partido del bracket</span>
            <div className="flex-1 h-px bg-zinc-900" />
          </div>

          <div className="bg-zinc-900/20 border border-zinc-800/60 rounded-2xl p-6 space-y-4">
            {/* LLAVE */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 block mb-2">Llave del bracket</label>
              <select className={selectBase} value={llave} onChange={e => setLlave(e.target.value)}>
                <option value="">Seleccionar llave</option>
                {LLAVES.map(l => (
                  <option key={l.id} value={l.id} disabled={llavesTaken.has(l.id)}>
                    {l.label} — {l.desc} {llavesTaken.has(l.id) ? '(ya existe)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* EQUIPOS */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 block mb-2">Local</label>
                <select className={selectBase} value={localId} onChange={e => setLocalId(e.target.value)}>
                  <option value="">Equipo local</option>
                  {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 block mb-2">Visita</label>
                <select className={selectBase} value={visitaId} onChange={e => setVisitaId(e.target.value)}>
                  <option value="">Equipo visita</option>
                  {equipos.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* FECHA */}
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 block mb-2">
                Fecha y hora <span className="text-zinc-700">(opcional — aparece en el bracket)</span>
              </label>
              <input
                type="datetime-local"
                className={`${inputBase} color-scheme-dark`}
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <button
              onClick={crearPartido}
              disabled={creando || !llave || !localId || !visitaId}
              className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2"
            >
              {creando
                ? <><div className="w-4 h-4 border-2 border-yellow-800 border-t-yellow-400 rounded-full animate-spin" /> Creando...</>
                : 'Publicar partido en el bracket →'
              }
            </button>
          </div>
        </section>

        {/* ── SECCIÓN 3: REGISTRAR RESULTADO ────────────────────────── */}
        {partidoSel && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-yellow-600">
                Registrando resultado
              </span>
              <div className="flex-1 h-px bg-zinc-900" />
              <button onClick={() => setPartidoSel(null)} className="text-[8px] font-black uppercase tracking-widest text-zinc-700 hover:text-white transition-colors">
                Cancelar ✕
              </button>
            </div>

            {/* NOMBRE DEL PARTIDO */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 mb-6 text-center">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-yellow-700 mb-1">
                {llavesMeta[partidoSel.llave]?.label}
              </p>
              <p className="text-sm font-black uppercase tracking-tight text-white">
                {partidoSel.equipo_local.nombre}
                <span className="text-zinc-700 mx-3 font-normal text-xs">vs</span>
                {partidoSel.equipo_visita.nombre}
              </p>
            </div>

            {/* PASO 1: MARCADOR */}
            {paso === 1 && (
              <div className="space-y-5">
                <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-6">
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 block">
                        {partidoSel.equipo_local.nombre}
                      </label>
                      <input
                        type="number" min="0" placeholder="0"
                        className={`${inputBase} text-center text-4xl font-black text-white tracking-tighter py-5`}
                        value={golesL || ''} onChange={e => setGolesL(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex items-center justify-center pt-10">
                      <span className="text-xl font-black text-zinc-800 italic">–</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 block">
                        {partidoSel.equipo_visita.nombre}
                      </label>
                      <input
                        type="number" min="0" placeholder="0"
                        className={`${inputBase} text-center text-4xl font-black text-white tracking-tighter py-5`}
                        value={golesV || ''} onChange={e => setGolesV(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>

                {/* PENALES */}
                <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setHuboTanda(!huboTanda)}
                      className={`relative w-10 h-5 rounded-full transition-all shrink-0
                        ${huboTanda ? 'bg-yellow-500' : 'bg-zinc-800'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all
                        ${huboTanda ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">
                      Hubo tanda de penales
                    </span>
                  </div>
                  {huboTanda && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-zinc-700 uppercase tracking-wider block mb-1.5">
                          {partidoSel.equipo_local.nombre}
                        </label>
                        <input
                          type="number" min="0" placeholder="0"
                          className={`${inputBase} text-center text-2xl font-black`}
                          value={penalesL} onChange={e => setPenalesL(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-zinc-700 uppercase tracking-wider block mb-1.5">
                          {partidoSel.equipo_visita.nombre}
                        </label>
                        <input
                          type="number" min="0" placeholder="0"
                          className={`${inputBase} text-center text-2xl font-black`}
                          value={penalesV} onChange={e => setPenalesV(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={confirmarMarcador}
                  className="w-full bg-white text-black hover:bg-yellow-400 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all"
                >
                  Confirmar marcador →
                </button>
              </div>
            )}

            {/* PASO 2: GOLEADORES + MVP */}
            {paso === 2 && (
              <div className="space-y-5">
                {/* RESUMEN */}
                <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 flex items-center justify-center gap-4">
                  <span className="text-sm font-black uppercase text-zinc-300">{partidoSel.equipo_local.nombre}</span>
                  <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                    <span className="text-2xl font-black font-mono text-white">{golesL}</span>
                    <span className="text-zinc-700 font-black">–</span>
                    <span className="text-2xl font-black font-mono text-white">{golesV}</span>
                  </div>
                  <span className="text-sm font-black uppercase text-zinc-300">{partidoSel.equipo_visita.nombre}</span>
                  {huboTanda && (
                    <span className="text-[9px] font-black text-yellow-600 border border-yellow-500/30 px-2 py-1 rounded-lg">
                      Pen. {penalesL}–{penalesV}
                    </span>
                  )}
                </div>

                {/* GOLEADORES */}
                {(golesL > 0 || golesV > 0) && (
                  <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-6">
                    <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600 mb-4">Goleadores</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {golesL > 0 && (
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-green-600 mb-2">{partidoSel.equipo_local.nombre}</p>
                          <div className="space-y-2">
                            {goleadoresL.map((_, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-[8px] font-mono text-zinc-700 w-4 text-center">{i+1}</span>
                                <select className={`${selectBase} flex-1 text-xs`}
                                  onChange={e => { const c=[...goleadoresL]; c[i]=e.target.value; setGoleadoresL(c); }}>
                                  <option value="">Seleccionar jugador</option>
                                  {jugadoresL.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {golesV > 0 && (
                        <div>
                          <p className="text-[8px] font-black uppercase tracking-widest text-green-600 mb-2">{partidoSel.equipo_visita.nombre}</p>
                          <div className="space-y-2">
                            {goleadoresV.map((_, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-[8px] font-mono text-zinc-700 w-4 text-center">{i+1}</span>
                                <select className={`${selectBase} flex-1 text-xs`}
                                  onChange={e => { const c=[...goleadoresV]; c[i]=e.target.value; setGoleadoresV(c); }}>
                                  <option value="">Seleccionar jugador</option>
                                  {jugadoresV.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                                </select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MVP */}
                <div className="bg-zinc-900/30 border border-yellow-500/20 rounded-2xl p-5">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-yellow-600 mb-3">MVP del partido</h3>
                  <select className={`${selectBase} text-yellow-400 border-yellow-500/20 focus:border-yellow-500`}
                    value={mvpId} onChange={e => setMvpId(e.target.value)}>
                    <option value="">Seleccionar MVP</option>
                    <option disabled>── {partidoSel.equipo_local.nombre} ──</option>
                    {jugadoresL.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                    <option disabled>── {partidoSel.equipo_visita.nombre} ──</option>
                    {jugadoresV.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setPaso(1)}
                    className="flex-1 border border-zinc-800 hover:border-zinc-600 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs text-zinc-500 hover:text-white transition-all">
                    ← Volver
                  </button>
                  <button onClick={guardarResultado} disabled={guardando}
                    className="flex-[2] bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-black py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-2">
                    {guardando
                      ? <><div className="w-4 h-4 border-2 border-green-800 border-t-green-400 rounded-full animate-spin" /> Guardando...</>
                      : 'Cerrar acta playoffs →'
                    }
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}