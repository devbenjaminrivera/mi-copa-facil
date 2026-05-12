'use client';

import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ResultadosCompletos() {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [partidoDestacado, setPartidoDestacado] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartidos = async () => {
      const { data } = await supabase
        .from('partidos')
        .select(`
          id, goles_local, goles_visita, jornada, fecha,
          mvp:jugadores!id_mvp(nombre),
          equipo_local:equipos!equipo_local(id, nombre),
          equipo_visita:equipos!equipo_visita(id, nombre),
          sanciones(tipo, id_equipo, jugador:jugadores(nombre)),
          goles(id_equipo, jugador:jugadores(nombre))
        `)
        .eq('estado', 'jugado')
        .order('jornada', { ascending: false })
        .order('fecha', { ascending: false });

      if (data) {
        setPartidos(data);
      }
    };
    fetchPartidos();
  }, []);

  // EFECTO DE SCROLL
  useEffect(() => {
    if (partidos.length > 0 && window.location.hash) {
      const hash = window.location.hash;
      const idBuscado = hash.replace('#partido-', '');
      setPartidoDestacado(idBuscado);

      let intentos = 0;
      const buscador = setInterval(() => {
        const elemento = document.querySelector(hash);
        if (elemento) {
          clearInterval(buscador);
          elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => setPartidoDestacado(null), 2000);
        }
        intentos++;
        if (intentos >= 10) clearInterval(buscador);
      }, 100);
      return () => clearInterval(buscador);
    }
  }, [partidos]);

  // AGRUPAR POR JORNADAS
  const jornadas = partidos.reduce((acc: any, p: any) => {
    const j = String(p.jornada || 1);
    if (!acc[j]) acc[j] = [];
    acc[j].push(p);
    return acc;
  }, {});

  const jornadasOrdenadas = Object.keys(jornadas).sort((a, b) => Number(b) - Number(a));

  const getGoleadoresPorEquipo = (partido: any, equipoId: number) => {
    const goles = partido.goles?.filter((g: any) => String(g.id_equipo) === String(equipoId)) || [];
    const conteo: Record<string, number> = {};
    goles.forEach((g: any) => {
      const nombre = g.jugador?.nombre || 'Desconocido';
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });
    return Object.entries(conteo);
  };

  const totalGoles = partidos.reduce((a, p) => a + (p.goles_local || 0) + (p.goles_visita || 0), 0);

  return (
    <main
      className="bg-[#0a0a0a] text-white min-h-screen pb-24"
      style={{ fontFamily: "'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif" }}
    >
      {/* ── HEADER EDITORIAL ─────────────────────────────────────── */}
      <div className="border-b border-zinc-900 pt-14 mb-10">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-green-500 text-[9px] font-black uppercase tracking-[0.4em] mb-3">
              Copa CEVI 2026 · Actas oficiales
            </p>
            <div className="flex items-end justify-between">
              <h1
                style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: 0.9, letterSpacing: '-0.02em' }}
                className="uppercase font-black italic text-white"
              >
                RESULTADOS
              </h1>
              {/* STATS RÁPIDAS */}
              <div className="hidden md:flex items-end gap-6 pb-1">
                <div className="text-right">
                  <p style={{ fontFamily: "'Impact', sans-serif" }} className="text-3xl font-black text-zinc-700 leading-none">{partidos.length}</p>
                  <p className="text-[7px] font-black uppercase tracking-widest text-zinc-800 mt-0.5">partidos</p>
                </div>
                <div className="text-right">
                  <p style={{ fontFamily: "'Impact', sans-serif" }} className="text-3xl font-black text-green-600 leading-none">{totalGoles}</p>
                  <p className="text-[7px] font-black uppercase tracking-widest text-zinc-800 mt-0.5">goles</p>
                </div>
                <div className="text-right">
                  <p style={{ fontFamily: "'Impact', sans-serif" }} className="text-3xl font-black text-zinc-700 leading-none">{jornadasOrdenadas.length}</p>
                  <p className="text-[7px] font-black uppercase tracking-widest text-zinc-800 mt-0.5">jornadas</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── CONTENIDO (TODAS LAS JORNADAS) ────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="space-y-20">
          {jornadasOrdenadas.map((jornada) => (
            <motion.section 
              key={jornada}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {/* CABECERA JORNADA */}
              <div className="flex items-baseline gap-4 mb-6">
                <h2
                  style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", letterSpacing: '-0.01em' }}
                  className="text-4xl md:text-5xl font-black italic uppercase text-zinc-800"
                >
                  JORNADA {jornada}
                </h2>
                <div className="flex-1 h-px bg-zinc-900" />
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest shrink-0">
                  {jornadas[jornada].length} partido{jornadas[jornada].length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* LISTA DE PARTIDOS DE ESTA JORNADA */}
              <div className="space-y-4">
                {jornadas[jornada].map((p: any) => {
                  const isDestacado = String(partidoDestacado) === String(p.id);
                  const goleadoresLocal = getGoleadoresPorEquipo(p, p.equipo_local?.id);
                  const goleadoresVisita = getGoleadoresPorEquipo(p, p.equipo_visita?.id);
                  const hayGoles = goleadoresLocal.length > 0 || goleadoresVisita.length > 0;
                  const haySanciones = p.sanciones?.length > 0;
                  const localWin = p.goles_local > p.goles_visita;
                  const visitaWin = p.goles_visita > p.goles_local;

                  return (
                    <div
                      key={p.id}
                      id={`partido-${p.id}`}
                      className={`scroll-mt-24 rounded-[1.5rem] overflow-hidden border transition-all duration-300
                        ${isDestacado
                          ? 'border-green-500/60 ring-1 ring-green-500/20 shadow-[0_0_30px_rgba(74,222,128,0.1)]'
                          : 'border-zinc-900 bg-zinc-950/30'
                        }
                      `}
                    >
                      {/* ── MARCADOR PRINCIPAL ─────────────────────────── */}
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center px-5 py-6">

                        {/* LOCAL */}
                        <div className="flex items-center gap-3 justify-end min-w-0">
                          <div className="text-right min-w-0">
                            <p className={`font-black uppercase tracking-tight leading-tight text-sm md:text-base truncate
                              ${localWin ? 'text-white' : 'text-zinc-600'}
                            `}>
                              {p.equipo_local?.nombre}
                            </p>
                            {p.fecha && (
                              <p className="text-[8px] font-black text-zinc-800 uppercase tracking-widest hidden md:block mt-0.5">
                                {new Date(p.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                              </p>
                            )}
                          </div>
                          <div className={`relative w-10 h-10 md:w-14 md:h-14 shrink-0 transition-all ${localWin ? 'drop-shadow-[0_0_12px_rgba(74,222,128,0.25)]' : 'opacity-40'}`}>
                            <Image src={`/escudos/${p.equipo_local?.id}.png`} alt="" fill className="object-contain" />
                          </div>
                        </div>

                        {/* SCORE */}
                        <div className="flex flex-col items-center gap-1 shrink-0 px-2 md:px-6">
                          <div className="flex items-center gap-2 md:gap-4 bg-black/50 px-4 py-2 rounded-2xl border border-white/5">
                            <span style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif" }} className={`text-3xl md:text-5xl font-black leading-none tabular-nums ${localWin ? 'text-white' : 'text-zinc-500'}`}>
                              {p.goles_local}
                            </span>
                            <span className="text-zinc-700 font-black text-xs md:text-base italic">VS</span>
                            <span style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif" }} className={`text-3xl md:text-5xl font-black leading-none tabular-nums ${visitaWin ? 'text-white' : 'text-zinc-500'}`}>
                              {p.goles_visita}
                            </span>
                          </div>
                          {p.fecha && (
                            <p className="text-[7px] font-black text-zinc-800 uppercase tracking-widest md:hidden mt-1">
                              {new Date(p.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                            </p>
                          )}
                        </div>

                        {/* VISITA */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`relative w-10 h-10 md:w-14 md:h-14 shrink-0 transition-all ${visitaWin ? 'drop-shadow-[0_0_12px_rgba(74,222,128,0.25)]' : 'opacity-40'}`}>
                            <Image src={`/escudos/${p.equipo_visita?.id}.png`} alt="" fill className="object-contain" />
                          </div>
                          <p className={`font-black uppercase tracking-tight leading-tight text-sm md:text-base truncate
                            ${visitaWin ? 'text-white' : 'text-zinc-600'}
                          `}>
                            {p.equipo_visita?.nombre}
                          </p>
                        </div>
                      </div>

                      {/* ── SECCIÓN DE DETALLES (ORDENADA) ──────────────── */}
                      {(hayGoles || haySanciones || p.mvp?.nombre) && (
                        <div className="border-t border-zinc-900 bg-black/40">
                          
                          {/* MVP (Barra superior destacada) */}
                          {p.mvp?.nombre && (
                            <div className="flex justify-center items-center gap-2 py-3 border-b border-zinc-900/50 bg-yellow-500/5">
                              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-yellow-700">MVP</span>
                              <span className="text-[10px] md:text-xs font-black text-yellow-500 uppercase italic">
                                🌟 {p.mvp.nombre}
                              </span>
                            </div>
                          )}

                          <div className="px-5 py-4 space-y-4">
                            {/* GOLES (Estructura de 3 columnas) */}
                            {hayGoles && (
                              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start min-w-0">
                                {/* Local Goles */}
                                <div className="flex flex-col items-end gap-1.5 w-full min-w-0">
                                  {goleadoresLocal.map(([nombre, cantidad], i) => (
                                    <div key={i} className="flex items-center justify-end gap-1.5 md:gap-2 w-full min-w-0">
                                      <span className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase text-right leading-tight truncate max-w-[80px] min-[400px]:max-w-[100px] md:max-w-[150px]">
                                        {nombre}
                                      </span>
                                      <div className="flex flex-wrap justify-end gap-[2px] shrink-0 w-fit max-w-[40px] md:max-w-none">
                                        {Array.from({ length: cantidad as number }).map((_, k) => (
                                          <span key={k} className="text-[10px] leading-none">⚽</span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Label Goles */}
                                <div className="flex justify-center shrink-0 pt-0.5">
                                  <span className="text-[7px] font-black tracking-[0.3em] text-zinc-700 uppercase">Goles</span>
                                </div>

                                {/* Visita Goles */}
                                <div className="flex flex-col items-start gap-1.5 w-full min-w-0">
                                  {goleadoresVisita.map(([nombre, cantidad], i) => (
                                    <div key={i} className="flex items-center justify-start gap-1.5 md:gap-2 w-full min-w-0">
                                      <div className="flex flex-wrap justify-start gap-[2px] shrink-0 w-fit max-w-[40px] md:max-w-none">
                                        {Array.from({ length: cantidad as number }).map((_, k) => (
                                          <span key={k} className="text-[10px] leading-none">⚽</span>
                                        ))}
                                      </div>
                                      <span className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase text-left leading-tight truncate max-w-[80px] min-[400px]:max-w-[100px] md:max-w-[150px]">
                                        {nombre}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Separador sutil si hay ambos */}
                            {hayGoles && haySanciones && (
                              <div className="w-full h-px bg-zinc-900/50" />
                            )}

                            {/* TARJETAS (Estructura de 3 columnas) */}
                            {haySanciones && (
                              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start min-w-0">
                                {/* Local Tarjetas */}
                                <div className="flex flex-col items-end gap-1.5 w-full min-w-0">
                                  {p.sanciones.filter((s:any) => String(s.id_equipo) === String(p.equipo_local?.id)).map((s:any, i:number) => (
                                    <div key={i} className="flex items-center justify-end gap-1.5 md:gap-2 w-full min-w-0">
                                      <span className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase text-right leading-tight truncate max-w-[80px] min-[400px]:max-w-[100px] md:max-w-[150px]">
                                        {s.jugador?.nombre}
                                      </span>
                                      <div className={`w-[8px] h-[12px] rounded-[2px] shrink-0 border-[0.5px] border-black/20 rotate-[5deg] ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'}`} />
                                    </div>
                                  ))}
                                </div>

                                {/* Label Tarjetas */}
                                <div className="flex justify-center shrink-0 pt-0.5">
                                  <span className="text-[7px] font-black tracking-[0.3em] text-zinc-700 uppercase">Tarjetas</span>
                                </div>

                                {/* Visita Tarjetas */}
                                <div className="flex flex-col items-start gap-1.5 w-full min-w-0">
                                  {p.sanciones.filter((s:any) => String(s.id_equipo) === String(p.equipo_visita?.id)).map((s:any, i:number) => (
                                    <div key={i} className="flex items-center justify-start gap-1.5 md:gap-2 w-full min-w-0">
                                      <div className={`w-[8px] h-[12px] rounded-[2px] shrink-0 border-[0.5px] border-black/20 rotate-[-5deg] ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'}`} />
                                      <span className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase text-left leading-tight truncate max-w-[80px] min-[400px]:max-w-[100px] md:max-w-[150px]">
                                        {s.jugador?.nombre}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {partidos.length === 0 && (
          <div className="text-center py-24">
            <p
              style={{ fontFamily: "'Impact', sans-serif" }}
              className="text-4xl font-black italic text-zinc-900 uppercase"
            >
              Sin resultados aún
            </p>
          </div>
        )}
      </div>
    </main>
  );
}