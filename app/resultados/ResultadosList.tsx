'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Partido } from '@/lib/types';

interface Props {
  partidos: Partido[];
}

export function ResultadosList({ partidos }: Props) {
  const [partidoDestacado, setPartidoDestacado] = useState<string | null>(null);

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

  const getGoleadoresPorEquipo = (partido: any, equipoId?: number) => {
    if (!equipoId) return [];
    const goles = partido.goles?.filter((g: any) => String(g.id_equipo) === String(equipoId)) || [];
    const conteo: Record<string, number> = {};
    goles.forEach((g: any) => {
      const nombre = g.jugador?.nombre || 'Desconocido';
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });
    return Object.entries(conteo);
  };

  return (
    <div className="w-full">
      <div className="space-y-16">
        {jornadasOrdenadas.map((jornada) => (
          <motion.section 
            key={jornada}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* CABECERA JORNADA */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]" />
              <h2 className="font-outfit tracking-wide text-3xl md:text-4xl font-black uppercase text-white">
                Jornada {jornada}
              </h2>
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest shrink-0 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                {jornadas[jornada].length} partido{jornadas[jornada].length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* LISTA DE PARTIDOS DE ESTA JORNADA */}
            <div className="space-y-6">
              {jornadas[jornada].map((p: Partido) => {
                const isDestacado = String(partidoDestacado) === String(p.id);
                const goleadoresLocal = getGoleadoresPorEquipo(p, p.equipo_local?.id);
                const goleadoresVisita = getGoleadoresPorEquipo(p, p.equipo_visita?.id);
                const hayGoles = goleadoresLocal.length > 0 || goleadoresVisita.length > 0;
                const haySanciones = p.sanciones && p.sanciones.length > 0;
                const localWin = (p.goles_local ?? 0) > (p.goles_visita ?? 0);
                const visitaWin = (p.goles_visita ?? 0) > (p.goles_local ?? 0);

                return (
                  <div
                    key={p.id}
                    id={`partido-${p.id}`}
                    className={`scroll-mt-24 rounded-3xl overflow-hidden backdrop-blur-md transition-all duration-500
                      ${isDestacado
                        ? 'bg-orange-500/10 border border-orange-500/60 shadow-[0_0_30px_rgba(251, 146, 60,0.2)]'
                        : 'bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/10'
                      }
                    `}
                  >
                    {/* ── MARCADOR PRINCIPAL ─────────────────────────── */}
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center px-6 py-8">

                      {/* LOCAL */}
                      <div className="flex items-center gap-4 justify-end min-w-0">
                        <div className="text-right min-w-0">
                          <p className={`font-outfit font-black uppercase tracking-tight leading-tight text-lg md:text-xl truncate transition-colors
                            ${localWin ? 'text-white drop-shadow-md' : 'text-zinc-400'}
                          `}>
                            {p.equipo_local?.nombre}
                          </p>
                          {p.fecha && (
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest hidden md:block mt-1">
                              {new Date(p.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                            </p>
                          )}
                        </div>
                        <div className={`relative w-12 h-12 md:w-16 md:h-16 shrink-0 transition-all ${localWin ? 'drop-shadow-[0_0_16px_rgba(251, 146, 60,0.4)] scale-105' : 'opacity-60 scale-95'}`}>
                          {p.equipo_local && <Image src={`/escudos/${p.equipo_local.id}.png`} alt="" fill className="object-contain" />}
                        </div>
                      </div>

                      {/* SCORE */}
                      <div className="flex flex-col items-center gap-2 shrink-0 px-2 md:px-8">
                        <div className="flex items-center gap-3 md:gap-6 bg-black/50 px-6 py-3 rounded-2xl border border-white/10 shadow-inner">
                          <span className={`font-outfit text-4xl md:text-6xl font-black leading-none tabular-nums ${localWin ? 'text-orange-400 drop-shadow-[0_0_12px_rgba(251, 146, 60,0.5)]' : 'text-zinc-500'}`}>
                            {p.goles_local}
                          </span>
                          <span className="text-zinc-600 font-black text-sm md:text-lg opacity-50">:</span>
                          <span className={`font-outfit text-4xl md:text-6xl font-black leading-none tabular-nums ${visitaWin ? 'text-orange-400 drop-shadow-[0_0_12px_rgba(251, 146, 60,0.5)]' : 'text-zinc-500'}`}>
                            {p.goles_visita}
                          </span>
                        </div>
                        {p.fecha && (
                          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest md:hidden mt-2">
                            {new Date(p.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                          </p>
                        )}
                      </div>

                      {/* VISITA */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`relative w-12 h-12 md:w-16 md:h-16 shrink-0 transition-all ${visitaWin ? 'drop-shadow-[0_0_16px_rgba(251, 146, 60,0.4)] scale-105' : 'opacity-60 scale-95'}`}>
                          {p.equipo_visita && <Image src={`/escudos/${p.equipo_visita.id}.png`} alt="" fill className="object-contain" />}
                        </div>
                        <p className={`font-outfit font-black uppercase tracking-tight leading-tight text-lg md:text-xl truncate transition-colors
                          ${visitaWin ? 'text-white drop-shadow-md' : 'text-zinc-400'}
                        `}>
                          {p.equipo_visita?.nombre}
                        </p>
                      </div>
                    </div>

                    {/* ── SECCIÓN DE DETALLES ──────────────── */}
                    {(hayGoles || haySanciones || p.mvp?.nombre) && (
                      <div className="border-t border-white/5 bg-black/40 px-6 py-5">
                        
                        {/* MVP */}
                        {p.mvp?.nombre && (
                          <div className="flex justify-center items-center gap-3 py-3 border-b border-white/5 mb-4">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-600">MVP del Partido</span>
                            <span className="text-xs font-bold text-yellow-400 uppercase bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                              🌟 {p.mvp.nombre}
                            </span>
                          </div>
                        )}

                        <div className="space-y-5">
                          {/* GOLES */}
                          {hayGoles && (
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-start min-w-0">
                              <div className="flex flex-col items-end gap-2 w-full min-w-0">
                                {goleadoresLocal.map(([nombre, cantidad], i) => (
                                  <div key={i} className="flex items-center justify-end gap-2 w-full min-w-0">
                                    <span className="text-xs text-zinc-300 font-bold uppercase text-right leading-tight truncate">
                                      {nombre}
                                    </span>
                                    <div className="flex flex-wrap justify-end gap-[4px] shrink-0">
                                      {Array.from({ length: cantidad as number }).map((_, k) => (
                                        <div key={k} className="w-3 h-3 bg-white/20 rounded-full flex items-center justify-center text-[8px]">⚽</div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex justify-center shrink-0 pt-0.5">
                                <span className="text-[8px] font-bold tracking-widest text-zinc-600 uppercase bg-black/40 px-2 py-0.5 rounded border border-white/5">Goles</span>
                              </div>

                              <div className="flex flex-col items-start gap-2 w-full min-w-0">
                                {goleadoresVisita.map(([nombre, cantidad], i) => (
                                  <div key={i} className="flex items-center justify-start gap-2 w-full min-w-0">
                                    <div className="flex flex-wrap justify-start gap-[4px] shrink-0">
                                      {Array.from({ length: cantidad as number }).map((_, k) => (
                                        <div key={k} className="w-3 h-3 bg-white/20 rounded-full flex items-center justify-center text-[8px]">⚽</div>
                                      ))}
                                    </div>
                                    <span className="text-xs text-zinc-300 font-bold uppercase text-left leading-tight truncate">
                                      {nombre}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {hayGoles && haySanciones && (
                            <div className="w-full h-px bg-white/5" />
                          )}

                          {/* TARJETAS */}
                          {haySanciones && (
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-start min-w-0">
                              <div className="flex flex-col items-end gap-2 w-full min-w-0">
                                {p.sanciones?.filter((s:any) => String(s.id_equipo) === String(p.equipo_local?.id)).map((s:any, i:number) => (
                                  <div key={i} className="flex items-center justify-end gap-2 w-full min-w-0">
                                    <span className="text-xs text-zinc-400 font-bold uppercase text-right leading-tight truncate">
                                      {s.jugador?.nombre}
                                    </span>
                                    <div className={`w-[10px] h-[14px] rounded-[3px] shrink-0 border-[0.5px] border-black/20 shadow-sm rotate-[5deg] ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-center shrink-0 pt-0.5">
                                <span className="text-[8px] font-bold tracking-widest text-zinc-600 uppercase bg-black/40 px-2 py-0.5 rounded border border-white/5">Tarjetas</span>
                              </div>

                              <div className="flex flex-col items-start gap-2 w-full min-w-0">
                                {p.sanciones?.filter((s:any) => String(s.id_equipo) === String(p.equipo_visita?.id)).map((s:any, i:number) => (
                                  <div key={i} className="flex items-center justify-start gap-2 w-full min-w-0">
                                    <div className={`w-[10px] h-[14px] rounded-[3px] shrink-0 border-[0.5px] border-black/20 shadow-sm rotate-[-5deg] ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-500'}`} />
                                    <span className="text-xs text-zinc-400 font-bold uppercase text-left leading-tight truncate">
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
        <div className="text-center py-32 bento-card border-dashed border-white/10 mt-10">
          <p className="font-outfit text-3xl font-black text-zinc-600 uppercase tracking-wide">
            Sin resultados
          </p>
        </div>
      )}
    </div>
  );
}
