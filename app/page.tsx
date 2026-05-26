'use client';

import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [data, setData] = useState<any>({ equipos: [], partidos: [], proximos: [], goleadores: [], playoffs: [] });
  const [tab, setTab] = useState<'resultados' | 'proximos'>('resultados');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const load = async () => {
      const ahora = new Date().toISOString();
      const [resEq, resPart, resProx, resGol, resPlayoffs] = await Promise.all([
        supabase.from('equipos').select('*').order('puntos', { ascending: false }).order('df', { ascending: false }).order('gf', { ascending: false }),
        supabase.from('partidos').select(`id, goles_local, goles_visita, fecha, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre), sanciones(tipo, id_equipo)`)
          .eq('estado', 'jugado').eq('fase', 'regular').order('created_at', { ascending: false }).limit(6),
        supabase.from('partidos').select(`id, fecha, jornada, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre)`)
          .eq('estado', 'programado').eq('fase', 'regular').gt('fecha', ahora).order('jornada', { ascending: true }).order('fecha', { ascending: true }),
        supabase.from('jugadores').select(`nombre, goles, equipos:id_equipo(id, nombre)`).gt('goles', 0).order('goles', { ascending: false }).limit(5),
        supabase.from('partidos').select(`id, estado, fase, llave, goles_local, goles_visita, penales_local, penales_visita, fecha, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre)`)
          .neq('fase', 'regular')
      ]);
      setData({
        equipos: resEq.data || [],
        partidos: resPart.data || [],
        proximos: resProx.data || [],
        goleadores: resGol.data || [],
        playoffs: resPlayoffs.data || []
      });
      setCargando(false);
    };
    load();
  }, []);

  const isPlayoffsMode = data.playoffs.length > 0;
  const lider = data.equipos[0];
  const podioOrder = [1, 0, 2];

  const itemVariants: Variants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  const PODIO_STYLES = [
    { glow: 'drop-shadow-[0_0_18px_rgba(234,179,8,0.7)]',  badge: 'bg-yellow-500 text-black', size: 'w-24 h-24' },
    { glow: 'drop-shadow-[0_0_12px_rgba(161,161,170,0.5)]', badge: 'bg-zinc-400 text-black',   size: 'w-16 h-16' },
    { glow: 'drop-shadow-[0_0_12px_rgba(154,52,18,0.5)]',   badge: 'bg-orange-800 text-white', size: 'w-16 h-16' },
  ];

  if (cargando) return (
    <div className="bg-[#0a0a0a] min-h-screen text-white flex items-center justify-center font-black uppercase tracking-widest text-xs">
      Cargando la arena...
    </div>
  );

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen" style={{ fontFamily: "'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-24">

        {/* MASTHEAD */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12 border-b border-zinc-800 pb-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-green-500 text-[9px] font-black uppercase tracking-[0.4em] mb-2">
                Copa CEVI · 2026
              </p>
              <h1 style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", fontSize: 'clamp(3rem, 10vw, 6rem)', lineHeight: 0.9, letterSpacing: '-0.02em' }}
                className="uppercase text-white font-black italic">
                COPA<br/><span className="text-green-500">CEVI</span>
              </h1>
            </div>

          </div>
        </motion.div>

        {/* BRACKET PLAYOFFS — siempre visible cuando existe, arriba de todo */}
        {isPlayoffsMode && (
          <motion.div
            id="bracket"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-14 scroll-mt-20"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1 h-6 bg-yellow-500 rounded-full shrink-0" />
              <h2 style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", letterSpacing: '-0.01em' }}
                className="text-2xl font-black italic uppercase text-white leading-none shrink-0">
                PLAYOFFS
              </h2>
              <div className="flex-1 border-b border-zinc-900" />
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-yellow-700 shrink-0">Fase final</span>
            </div>
            <BracketPlayoffs partidos={data.playoffs} />
          </motion.div>
        )}

        {/* LAYOUT PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* COLUMNA IZQUIERDA — order-2 en móvil para que goleadores aparezca primero */}
          <div className="space-y-6 order-2 lg:order-1">

            {/* LÍDER CARD — oculto en playoffs */}
            {lider && !isPlayoffsMode && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Link href={`/equipos/${lider.id}`}>
                  <div className="relative overflow-hidden rounded-xl cursor-pointer group" style={{ background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)' }}>
                    <div className="absolute inset-0 opacity-5">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="absolute border-t border-white" style={{ top: `${i * 14}%`, left: 0, right: 0, transform: `rotate(${i % 2 === 0 ? '-1deg' : '1deg'})` }} />
                      ))}
                    </div>
                    <div className="relative p-6 md:p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <span className="inline-block bg-green-500 text-black text-[8px] font-black uppercase tracking-[0.3em] px-2 py-0.5 mb-3">
                            Líder del torneo
                          </span>
                          <h2 style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", fontSize: 'clamp(1.8rem, 6vw, 3.5rem)', lineHeight: 0.9, letterSpacing: '-0.01em' }}
                            className="uppercase text-white group-hover:text-green-400 transition-colors font-black italic">
                            {lider.nombre}
                          </h2>
                        </div>
                        <div className="relative w-20 h-20 md:w-28 md:h-28 shrink-0 ml-4" style={{ filter: 'drop-shadow(0 0 24px rgba(74,222,128,0.4))' }}>
                          <Image src={`/escudos/${lider.id}.png`} alt="" fill className="object-contain" />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 md:gap-4">
                        {[
                          { label: 'Puntos', value: lider.puntos, accent: true },
                          { label: 'Jugados', value: lider.pj },
                          { label: 'Ganados', value: lider.pg },
                          { label: 'Dif. goles', value: lider.df > 0 ? `+${lider.df}` : lider.df },
                        ].map(({ label, value, accent }) => (
                          <div key={label} className="border-t-2 border-zinc-800 pt-3 group-hover:[&:first-child]:border-green-500 transition-colors">
                            <p style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif" }}
                              className={`text-3xl md:text-4xl font-black leading-none ${accent ? 'text-green-400' : 'text-white'}`}>
                              {value ?? 0}
                            </p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mt-1">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* TABLA DE POSICIONES */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600">Tabla de posiciones</span>
                <div className="flex-1 border-b border-zinc-900" />
              </div>
              <div className="rounded-xl overflow-hidden border border-zinc-900">
                <div className="grid grid-cols-[28px_1fr_44px_44px_44px_44px_44px_44px] bg-zinc-950 border-b border-zinc-800/60 px-3 py-2">
                  {['#', 'Equipo', 'Pts', 'PJ', 'G', 'E', 'P', 'DG'].map((h, i) => (
                    <span key={h} className={`text-[8px] font-black uppercase tracking-wider ${i === 2 ? 'text-green-600/70' : 'text-zinc-700'} ${i > 1 ? 'text-center' : ''}`}>{h}</span>
                  ))}
                </div>
                {data.equipos.map((eq: any, i: number) => (
                  <Link key={eq.id} href={`/equipos/${eq.id}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.04 }}
                      className={`grid grid-cols-[28px_1fr_44px_44px_44px_44px_44px_44px] px-3 py-3 border-b border-zinc-900/60 last:border-0 transition-colors hover:bg-zinc-900/50 group ${i === 0 ? 'bg-green-500/5' : ''}`}
                    >
                      <span className={`text-[9px] font-black font-mono self-center ${i === 0 ? 'text-green-500' : 'text-zinc-700'}`}>{i + 1}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative w-5 h-5 shrink-0">
                          <Image src={`/escudos/${eq.id}.png`} alt="" fill className="object-contain" />
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-tight truncate ${i === 0 ? 'text-white' : 'text-zinc-400 group-hover:text-white transition-colors'}`}>{eq.nombre}</span>
                      </div>
                      <span className="text-center text-sm font-black text-green-400 tabular-nums self-center">{eq.puntos || 0}</span>
                      <span className="text-center text-[11px] text-zinc-600 tabular-nums self-center">{eq.pj || 0}</span>
                      <span className="text-center text-[11px] text-zinc-600 tabular-nums self-center">{eq.pg || 0}</span>
                      <span className="text-center text-[11px] text-zinc-600 tabular-nums self-center">{eq.pe || 0}</span>
                      <span className="text-center text-[11px] text-zinc-600 tabular-nums self-center">{eq.pp || 0}</span>
                      <span className={`text-center text-[11px] font-mono tabular-nums self-center ${(eq.df || 0) >= 0 ? 'text-zinc-500' : 'text-red-700'}`}>
                        {(eq.df || 0) > 0 ? `+${eq.df}` : eq.df || 0}
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* PARTIDOS TABS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center gap-0 mb-4 border border-zinc-800 rounded-lg overflow-hidden w-fit">
                {(['resultados', 'proximos'] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>
                    {t === 'resultados' ? 'Últimos resultados' : 'Próximos'}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {tab === 'resultados' ? (
                  <motion.div key="resultados" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="space-y-2">
                    {data.partidos.map((p: any) => {
                      const lW = p.goles_local > p.goles_visita;
                      const vW = p.goles_visita > p.goles_local;
                      return (
                        <Link key={p.id} href={`/resultados#partido-${p.id}`}>
                          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center px-4 py-3.5 rounded-xl border border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all group">
                            <div className="flex items-center gap-2 justify-end min-w-0">
                              <span className={`text-[11px] font-black uppercase tracking-tight truncate text-right ${lW ? 'text-white' : 'text-zinc-600'}`}>{p.equipo_local?.nombre}</span>
                              <div className="relative w-6 h-6 shrink-0"><Image src={`/escudos/${p.equipo_local?.id}.png`} alt="" fill className="object-contain" /></div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span style={{ fontFamily: "'Impact', sans-serif" }} className={`text-xl leading-none tabular-nums ${lW ? 'text-white' : 'text-zinc-700'}`}>{p.goles_local}</span>
                              <span className="text-zinc-800 text-xs font-black">–</span>
                              <span style={{ fontFamily: "'Impact', sans-serif" }} className={`text-xl leading-none tabular-nums ${vW ? 'text-white' : 'text-zinc-700'}`}>{p.goles_visita}</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative w-6 h-6 shrink-0"><Image src={`/escudos/${p.equipo_visita?.id}.png`} alt="" fill className="object-contain" /></div>
                              <span className={`text-[11px] font-black uppercase tracking-tight truncate ${vW ? 'text-white' : 'text-zinc-600'}`}>{p.equipo_visita?.nombre}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    <div className="text-right pt-1">
                      <Link href="/resultados" className="text-[8px] font-black uppercase tracking-widest text-zinc-700 hover:text-green-500 transition-colors">Ver historial completo →</Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="proximos" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="space-y-2">
                    {data.proximos.length === 0 ? (
                      <p className="text-center text-zinc-800 text-[9px] font-black uppercase tracking-widest py-10">No hay partidos programados</p>
                    ) : data.proximos.map((p: any) => (
                      <div key={p.id} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center px-4 py-3.5 rounded-xl border border-zinc-900">
                        <div className="flex items-center gap-2 justify-end min-w-0">
                          <span className="text-[11px] font-black uppercase tracking-tight truncate text-right text-zinc-400">{p.equipo_local?.nombre}</span>
                          <div className="relative w-6 h-6 shrink-0"><Image src={`/escudos/${p.equipo_local?.id}.png`} alt="" fill className="object-contain" /></div>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 shrink-0">
                          <span className="text-[8px] font-black text-zinc-700 uppercase tracking-wider">{new Date(p.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}</span>
                          <span className="text-[9px] font-black text-green-600 uppercase tracking-widest border border-zinc-800 px-2 py-0.5 rounded">J{p.jornada}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative w-6 h-6 shrink-0"><Image src={`/escudos/${p.equipo_visita?.id}.png`} alt="" fill className="object-contain" /></div>
                          <span className="text-[11px] font-black uppercase tracking-tight truncate text-zinc-400">{p.equipo_visita?.nombre}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* COLUMNA DERECHA — GOLEADORES — order-1 en móvil para aparecer primero */}
          <div className="space-y-5 order-1 lg:order-2">
            <motion.section variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 bg-green-500 rounded-full shrink-0" />
                <span style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", letterSpacing: '-0.01em' }}
                  className="text-xl font-black italic uppercase text-white leading-none shrink-0">
                  {isPlayoffsMode ? 'GOLEADORES' : 'Top goleadores'}
                </span>
                <div className="flex-1 border-b border-zinc-900" />
              </div>

              {data.goleadores.length > 0 && (
                <div className="flex items-end justify-center gap-3 mb-4 px-2 pt-2">
                  {podioOrder.map((pos) => {
                    const g = data.goleadores[pos];
                    if (!g) return <div key={pos} className="flex-1" />;
                    const style = PODIO_STYLES[pos];
                    const equipoId = g.equipos?.[0]?.id || g.equipos?.id;
                    const partes = (g.nombre || '').trim().split(' ');
                    const nombreCorto = partes.length > 1 ? `${partes[0]} ${partes[1].charAt(0)}.` : partes[0];
                    return (
                      <motion.div variants={itemVariants} key={pos} className={`flex-1 flex flex-col items-center gap-2 ${pos === 0 ? '' : 'opacity-80'}`}>
                        <div className={`relative ${style.size} ${style.glow} transition-all duration-500`}>
                          <Image src={`/escudos/${equipoId}.png`} alt="" fill className="object-contain" />
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${style.badge} border-2 border-black`}>{pos + 1}</div>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] font-black uppercase text-zinc-400 truncate w-full px-1" title={g.nombre}>{nombreCorto}</p>
                          <p className={`font-black italic text-green-400 leading-none ${pos === 0 ? 'text-2xl' : 'text-xl'}`}>{g.goles}</p>
                          <p className="text-[7px] text-zinc-700 uppercase font-black tracking-wider">goles</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {data.goleadores.slice(3).length > 0 && (
                <div className="border border-zinc-800/60 rounded-2xl overflow-hidden">
                  {data.goleadores.slice(3).map((g: any, i: number) => {
                    const equipoId = g.equipos?.[0]?.id || g.equipos?.id;
                    return (
                      <motion.div variants={itemVariants} key={i}
                        className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800/40 last:border-0 hover:bg-zinc-900/40 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[9px] font-mono text-zinc-700 w-4 shrink-0">{i + 4}</span>
                          <div className="relative w-6 h-6 shrink-0"><Image src={`/escudos/${equipoId}.png`} alt="" fill className="object-contain" /></div>
                          <div className="min-w-0">
                            <p className="font-black text-xs uppercase truncate text-zinc-300 group-hover:text-white transition-colors">{g.nombre}</p>
                            <p className="text-[8px] text-zinc-700 uppercase tracking-widest truncate">{g.equipos?.[0]?.nombre || g.equipos?.nombre}</p>
                          </div>
                        </div>
                        <span className="text-green-400 font-black text-base italic ml-3 shrink-0">{g.goles}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.section>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-20 pt-6 border-t border-zinc-900 flex items-center justify-between">
          <p className="text-zinc-800 text-[8px] uppercase tracking-[0.4em] font-black">Copa CEVI 2026</p>
          <p className="text-zinc-800 text-[8px] uppercase tracking-[0.3em] font-black">Benjamín Rivera Araneda</p>
        </footer>

      </div>
    </main>
  );
}

/* ============================================================================
   BRACKET DE PLAYOFFS — REDISEÑO PROFESIONAL
   ============================================================================ */

function BracketPlayoffs({ partidos }: { partidos: any[] }) {
  const semi1  = partidos.find(p => p.llave === 'semi_1');
  const semi2  = partidos.find(p => p.llave === 'semi_2');
  const final  = partidos.find(p => p.llave === 'oro');
  const bronce = partidos.find(p => p.llave === 'bronce');

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[680px] px-2 py-4">

        {/* BRACKET LAYOUT */}
        <div className="grid grid-cols-[1fr_64px_1fr] items-center gap-0">

          {/* COLUMNA SEMIFINALES */}
          <div className="flex flex-col gap-6">
            <BracketMatch partido={semi1} titulo="Semifinal 1" placeholderA="1° Fase regular" placeholderB="4° Fase regular" />
            <BracketMatch partido={semi2} titulo="Semifinal 2" placeholderA="2° Fase regular" placeholderB="3° Fase regular" />
          </div>

          {/* CONECTORES SVG */}
          <svg viewBox="0 0 64 200" preserveAspectRatio="none" className="w-full h-full" style={{ minHeight: '200px' }}>
            {/* Línea desde semi1 hacia el centro */}
            <path d="M 0 50 H 32 V 100" fill="none" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Línea desde semi2 hacia el centro */}
            <path d="M 0 150 H 32 V 100" fill="none" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Línea del centro hacia las finales */}
            <path d="M 32 100 H 64" fill="none" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Nodo central */}
            <circle cx="32" cy="100" r="3" fill="#3f3f46"/>
          </svg>

          {/* COLUMNA FINALES */}
          <div className="flex flex-col gap-4">
            <BracketMatch partido={final}  titulo="Gran Final"    placeholderA="Ganador S1" placeholderB="Ganador S2" isFinal />
            <BracketMatch partido={bronce} titulo="3° y 4° Lugar" placeholderA="Perdedor S1" placeholderB="Perdedor S2" isBronze />
          </div>
        </div>
      </div>
    </div>
  );
}

function BracketMatch({ partido, titulo, placeholderA, placeholderB, isFinal = false, isBronze = false }: any) {
  const eqA = partido?.equipo_local  || { nombre: placeholderA, id: null };
  const eqB = partido?.equipo_visita || { nombre: placeholderB, id: null };
  const jugado = partido?.estado === 'jugado';
  const pendiente = !partido || partido?.estado === 'programado';

  const winnerA = jugado && (
    partido.goles_local > partido.goles_visita ||
    (partido.goles_local === partido.goles_visita && (partido.penales_local ?? 0) > (partido.penales_visita ?? 0))
  );
  const winnerB = jugado && !winnerA;

  const accentColor = isFinal ? '#eab308' : isBronze ? '#9a3412' : '#52525b';
  const accentOpacity = isFinal ? '60' : isBronze ? '40' : '30';

  const TeamRow = ({ eq, goles, penales, isWinner, isLoser }: any) => (
    <div className={`relative flex items-center justify-between gap-3 px-3 py-3 transition-all
      ${jugado && isWinner ? 'bg-white/[0.04]' : ''}
    `}>
      {/* BARRA LATERAL GANADOR */}
      {jugado && isWinner && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[2.5px] rounded-r-full"
          style={{ background: isFinal ? '#eab308' : '#22c55e' }}
        />
      )}

      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* ESCUDO */}
        <div className={`relative shrink-0 transition-all duration-300
          ${eq.id ? 'w-8 h-8' : 'w-7 h-7'}
          ${jugado && isLoser ? 'opacity-25 grayscale' : ''}
        `}>
          {eq.id ? (
            <Image src={`/escudos/${eq.id}.png`} alt={eq.nombre} fill className="object-contain" />
          ) : (
            <div className="w-full h-full rounded border border-dashed border-zinc-800 flex items-center justify-center">
              <span className="text-[7px] text-zinc-800 font-black">TBD</span>
            </div>
          )}
        </div>

        {/* NOMBRE */}
        <div className="min-w-0">
          <p className={`text-xs font-black uppercase tracking-tight truncate transition-colors leading-none
            ${!eq.id
              ? 'text-zinc-800'
              : jugado && isWinner
                ? 'text-white'
                : jugado && isLoser
                  ? 'text-zinc-700'
                  : 'text-zinc-400'
            }
          `}>
            {eq.nombre}
          </p>
          {jugado && isWinner && (
            <p className="text-[7px] font-black uppercase tracking-widest mt-0.5"
              style={{ color: isFinal ? '#a16207' : '#166534' }}>
              {isFinal ? 'Campeón' : isBronze ? '3° lugar' : 'Clasificado'}
            </p>
          )}
        </div>
      </div>

      {/* SCORE */}
      <div className="flex items-center gap-1.5 shrink-0">
        {jugado && penales != null && (
          <span className="text-[8px] font-black text-zinc-700 font-mono tabular-nums">({penales})</span>
        )}
        <span
          style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif" }}
          className={`text-2xl font-black italic leading-none tabular-nums w-7 text-center
            ${!jugado
              ? 'text-zinc-900'
              : isWinner
                ? 'text-white'
                : 'text-zinc-700'
            }
          `}
        >
          {jugado ? (goles ?? 0) : '–'}
        </span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        border: `1px solid ${accentColor}${accentOpacity}`,
        boxShadow: isFinal ? `0 0 24px rgba(234, 179, 8, 0.07)` : 'none',
        background: '#0d0d0d',
      }}
    >
      {/* HEADER RONDA */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-900/80">
        <div className="flex items-center gap-2">
          {/* DOT DE COLOR */}
          <div className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: accentColor, opacity: isFinal ? 1 : 0.5 }} />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]"
            style={{ color: isFinal ? '#a16207' : isBronze ? '#7c2d12' : '#52525b' }}>
            {titulo}
          </span>
        </div>
        <span className="text-[7px] font-black text-zinc-800 uppercase tracking-wider font-mono">
          {partido?.fecha
            ? new Date(partido.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })
            : pendiente ? 'Por confirmar' : ''}
        </span>
      </div>

      {/* EQUIPOS */}
      <div className="divide-y divide-zinc-900/60">
        <TeamRow eq={eqA} goles={partido?.goles_local}  penales={partido?.penales_local}  isWinner={winnerA} isLoser={jugado && !winnerA} />
        <TeamRow eq={eqB} goles={partido?.goles_visita} penales={partido?.penales_visita} isWinner={winnerB} isLoser={jugado && !winnerB} />
      </div>
    </motion.div>
  );
}