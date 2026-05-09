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
          id,
          goles_local,
          goles_visita,
          jornada,
          fecha,
          mvp:jugadores!id_mvp(nombre),
          equipo_local:equipos!equipo_local(id, nombre),
          equipo_visita:equipos!equipo_visita(id, nombre),
          sanciones(tipo, id_equipo, jugador:jugadores(nombre)),
          goles(id_equipo, jugador:jugadores(nombre))
        `)
        .eq('estado', 'jugado')
        .order('jornada', { ascending: false })
        .order('fecha', { ascending: false });

      if (data) setPartidos(data);
    };
    fetchPartidos();
  }, []);

  // SCROLL + HIGHLIGHT al navegar desde el dashboard
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

  const jornadas = partidos.reduce((acc: any, partido: any) => {
    const j = partido.jornada || 1;
    if (!acc[j]) acc[j] = [];
    acc[j].push(partido);
    return acc;
  }, {});

  // Agrupa los goles de un partido por equipo y cuenta repeticiones
  const getGoleadoresPorEquipo = (partido: any, equipoId: number) => {
    const goles = partido.goles?.filter(
      (g: any) => String(g.id_equipo) === String(equipoId)
    ) || [];

    // Contar cuántos goles hizo cada jugador
    const conteo: Record<string, number> = {};
    goles.forEach((g: any) => {
      const nombre = g.jugador?.nombre || 'Desconocido';
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });

    return Object.entries(conteo); // [['Nombre', cantidad], ...]
  };

  return (
    <main className="p-4 md:p-8 bg-black text-white min-h-screen pt-20">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 md:mb-14"
        >
          <p className="text-green-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-3">
            Copa CEVI 2026
          </p>
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
            Resultados
          </h1>
        </motion.div>

        <div className="space-y-14 md:space-y-20">
          {Object.keys(jornadas)
            .sort((a, b) => Number(b) - Number(a))
            .map((num) => (
              <section key={num} className="relative">

                {/* STICKY JORNADA HEADER */}
                <div className="sticky top-16 md:top-20 z-10 bg-black/90 backdrop-blur-md py-3 mb-5 border-b border-zinc-800/60">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 italic">
                      Jornada {num}
                    </h2>
                    <div className="h-px flex-1 bg-zinc-900" />
                    <span className="text-[9px] font-mono text-zinc-700">
                      {jornadas[num].length} partido{jornadas[num].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {jornadas[num].map((p: any) => {
                    const isDestacado = String(partidoDestacado) === String(p.id);
                    const goleadoresLocal = getGoleadoresPorEquipo(p, p.equipo_local?.id);
                    const goleadoresVisita = getGoleadoresPorEquipo(p, p.equipo_visita?.id);
                    const hayGoles = goleadoresLocal.length > 0 || goleadoresVisita.length > 0;
                    const haySanciones = p.sanciones && p.sanciones.length > 0;

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={p.id}
                        id={`partido-${p.id}`}
                        className={`scroll-mt-28 rounded-2xl md:rounded-3xl border transition-all duration-300
                          ${isDestacado
                            ? 'bg-zinc-800/80 border-green-500 ring-2 ring-green-500/20'
                            : 'bg-zinc-900/20 border-zinc-800/60 hover:border-zinc-700/80 hover:bg-zinc-900/30'
                          }
                        `}
                      >
                        {/* ── MARCADOR PRINCIPAL ───────────────────────── */}
                        <div className="p-5 md:p-6">
                          <div className="grid grid-cols-3 items-center gap-3 md:gap-6">

                            {/* EQUIPO LOCAL */}
                            <div className="flex flex-col md:flex-row items-center justify-end gap-2 md:gap-3 text-center md:text-right">
                              <span className="order-2 md:order-1 font-black uppercase text-[11px] md:text-sm leading-tight text-zinc-200">
                                {p.equipo_local?.nombre}
                              </span>
                              <div className="order-1 md:order-2 relative w-9 h-9 md:w-14 md:h-14 shrink-0">
                                <Image
                                  src={`/escudos/${p.equipo_local?.id}.png`}
                                  alt=""
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            </div>

                            {/* MARCADOR CENTRAL */}
                            <div className="flex flex-col items-center gap-1.5">
                              <div className="flex items-center gap-2 md:gap-3 bg-black/40 border border-zinc-800/80 px-4 py-2 md:px-6 md:py-3 rounded-xl">
                                <span className={`text-2xl md:text-4xl font-black font-mono tabular-nums
                                  ${p.goles_local > p.goles_visita ? 'text-white' : 'text-zinc-600'}
                                `}>
                                  {p.goles_local}
                                </span>
                                <span className="text-zinc-700 font-black text-xs italic">–</span>
                                <span className={`text-2xl md:text-4xl font-black font-mono tabular-nums
                                  ${p.goles_visita > p.goles_local ? 'text-white' : 'text-zinc-600'}
                                `}>
                                  {p.goles_visita}
                                </span>
                              </div>
                              {p.fecha && (
                                <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-wider">
                                  {new Date(p.fecha).toLocaleDateString('es-CL', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                  })}
                                </span>
                              )}
                            </div>

                            {/* EQUIPO VISITA */}
                            <div className="flex flex-col md:flex-row items-center justify-start gap-2 md:gap-3 text-center md:text-left">
                              <div className="relative w-9 h-9 md:w-14 md:h-14 shrink-0">
                                <Image
                                  src={`/escudos/${p.equipo_visita?.id}.png`}
                                  alt=""
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <span className="font-black uppercase text-[11px] md:text-sm leading-tight text-zinc-200">
                                {p.equipo_visita?.nombre}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ── GOLEADORES ──────────────────────────────── */}
                        {hayGoles && (
                          <div className="border-t border-zinc-800/50 px-5 md:px-6 py-4">
                            <div className="grid grid-cols-3 gap-3 items-start min-w-0">

                              {/* GOLES LOCAL */}
                              <div className="flex flex-col items-end gap-1 w-full min-w-0">
                                {goleadoresLocal.map(([nombre, cantidad], i) => (
                                  <div key={i} className="flex items-center justify-end gap-1.5 md:gap-2 w-full min-w-0">
                                    <span className="text-[9px] md:text-[10px] text-zinc-400 font-medium uppercase text-right leading-tight truncate max-w-[65px] min-[400px]:max-w-[90px] md:max-w-[150px]">
                                      {nombre}
                                    </span>
                                    {/* Contenedor de balones blindado */}
                                    <div className="flex flex-wrap justify-end gap-[2px] shrink-0 w-fit max-w-[40px] md:max-w-none">
                                      {Array.from({ length: cantidad as number }).map((_, k) => (
                                        <span key={k} className="text-[10px] leading-none">⚽</span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* ETIQUETA CENTRAL */}
                              <div className="flex justify-center pt-0.5 shrink-0">
                                <span className="text-[8px] font-black tracking-[0.25em] text-zinc-700 uppercase">
                                  Goles
                                </span>
                              </div>

                              {/* GOLES VISITA */}
                              <div className="flex flex-col items-start gap-1 w-full min-w-0">
                                {goleadoresVisita.map(([nombre, cantidad], i) => (
                                  <div key={i} className="flex items-center justify-start gap-1.5 md:gap-2 w-full min-w-0">
                                    {/* Contenedor de balones blindado */}
                                    <div className="flex flex-wrap justify-start gap-[2px] shrink-0 w-fit max-w-[40px] md:max-w-none">
                                      {Array.from({ length: cantidad as number }).map((_, k) => (
                                        <span key={k} className="text-[10px] leading-none">⚽</span>
                                      ))}
                                    </div>
                                    <span className="text-[9px] md:text-[10px] text-zinc-400 font-medium uppercase text-left leading-tight truncate max-w-[65px] min-[400px]:max-w-[90px] md:max-w-[150px]">
                                      {nombre}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              
                            </div>
                          </div>
                        )}

                        {/* ── SANCIONES ───────────────────────────────── */}
                        {haySanciones && (
                          <div className="border-t border-zinc-800/50 px-5 md:px-6 py-4">
                            <div className="grid grid-cols-3 gap-3 items-start">

                              {/* SANCIONES LOCAL */}
                              <div className="flex flex-col items-end gap-1.5">
                                {p.sanciones
                                  .filter((s: any) => String(s.id_equipo) === String(p.equipo_local?.id))
                                  .map((s: any, i: number) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                      <span className="text-[10px] text-zinc-500 text-right leading-tight">
                                        {s.jugador?.nombre}
                                      </span>
                                      <div className={`w-2.5 h-3.5 rounded-[2px] shrink-0
                                        ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'}
                                      `} />
                                    </div>
                                  ))}
                              </div>

                              {/* ETIQUETA CENTRAL */}
                              <div className="flex justify-center pt-0.5">
                                <span className="text-[8px] font-black tracking-[0.25em] text-zinc-700 uppercase">
                                  Tarjetas
                                </span>
                              </div>

                              {/* SANCIONES VISITA */}
                              <div className="flex flex-col items-start gap-1.5">
                                {p.sanciones
                                  .filter((s: any) => String(s.id_equipo) === String(p.equipo_visita?.id))
                                  .map((s: any, i: number) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                      <div className={`w-2.5 h-3.5 rounded-[2px] shrink-0
                                        ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'}
                                      `} />
                                      <span className="text-[10px] text-zinc-500 text-left leading-tight">
                                        {s.jugador?.nombre}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ── FOOTER MVP ───────────────────────────────── */}
                        <div className={`px-5 md:px-6 py-3 flex items-center justify-between border-t border-zinc-800/40
                          ${hayGoles || haySanciones ? '' : 'border-t'}
                        `}>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black text-yellow-600/70 uppercase tracking-[0.2em]">MVP</span>
                            <span className="text-[10px] font-black text-yellow-500 uppercase italic">
                              {p.mvp?.nombre ? `⭐ ${p.mvp.nombre}` : '—'}
                            </span>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </main>
  );
}