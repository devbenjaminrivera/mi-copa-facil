'use client';

import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';


export default function Home() {
  const [data, setData] = useState<any>({ equipos: [], partidos: [], proximos: [], goleadores: [] });
  const [tab, setTab] = useState<'resultados' | 'proximos'>('resultados');

  useEffect(() => {
    const load = async () => {
      const ahora = new Date().toISOString();
      const [resEq, resPart, resProx, resGol] = await Promise.all([
        supabase.from('equipos').select('*').order('puntos', { ascending: false }).order('df', { ascending: false }).order('gf', { ascending: false }),
        supabase.from('partidos').select(`id, goles_local, goles_visita, fecha, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre), sanciones(tipo, id_equipo)`).eq('estado', 'jugado').order('created_at', { ascending: false }).limit(6),
        supabase.from('partidos').select(`id, fecha, jornada, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre)`).eq('estado', 'programado').gt('fecha', ahora).order('jornada', { ascending: true }).order('fecha', { ascending: true }),
        supabase.from('jugadores').select(`nombre, goles, equipos:id_equipo(id, nombre)`).gt('goles', 0).order('goles', { ascending: false }).limit(5),
      ]);
      setData({ equipos: resEq.data || [], partidos: resPart.data || [], proximos: resProx.data || [], goleadores: resGol.data || [] });
    };
    load();
  }, []);

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

  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen" style={{ fontFamily: "'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif" }}>

      

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-24">

        {/* ── MASTHEAD ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12 border-b border-zinc-800 pb-6"
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-green-500 text-[9px] font-black uppercase tracking-[0.4em] mb-2">
                DASHBOARD · 2026
              </p>
              <h1 style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", fontSize: 'clamp(3rem, 10vw, 6rem)', lineHeight: 0.9, letterSpacing: '-0.02em' }}
                className="uppercase text-white font-black italic">
                COPA<br/>
                <span className="text-green-500">CEVI</span>
              </h1>
            </div>
            
          </div>
        </motion.div>

        {/* ── LAYOUT PRINCIPAL ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-6">

            {/* LÍDER CARD — PORTADA */}
            {lider && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link href={`/equipos/${lider.id}`}>
                  <div className="relative overflow-hidden rounded-xl cursor-pointer group" style={{ background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)' }}>
                    {/* LÍNEAS DECORATIVAS */}
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

                      {/* STATS HORIZONTALES */}
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
                {/* CABECERA */}
                <div className="grid grid-cols-[28px_1fr_44px_44px_44px_44px_44px_44px] bg-zinc-950 border-b border-zinc-800/60 px-3 py-2">
                  {['#', 'Equipo', 'Pts', 'PJ', 'G', 'E', 'P', 'DG'].map((h, i) => (
                    <span key={h} className={`text-[8px] font-black uppercase tracking-wider ${i === 0 ? 'text-zinc-700' : i === 2 ? 'text-green-600/70' : 'text-zinc-700'} ${i > 1 ? 'text-center' : ''}`}>
                      {h}
                    </span>
                  ))}
                </div>

                {/* FILAS */}
                {data.equipos.map((eq: any, i: number) => (
                  <Link key={eq.id} href={`/equipos/${eq.id}`}>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.04 }}
                      className={`grid grid-cols-[28px_1fr_44px_44px_44px_44px_44px_44px] px-3 py-3 border-b border-zinc-900/60 last:border-0 transition-colors hover:bg-zinc-900/50 group
                        ${i === 0 ? 'bg-green-500/5' : ''}
                      `}
                    >
                      <span className={`text-[9px] font-black font-mono self-center ${i === 0 ? 'text-green-500' : 'text-zinc-700'}`}>{i + 1}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative w-5 h-5 shrink-0">
                          <Image src={`/escudos/${eq.id}.png`} alt="" fill className="object-contain" />
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-tight truncate ${i === 0 ? 'text-white' : 'text-zinc-400 group-hover:text-white transition-colors'}`}>
                          {eq.nombre}
                        </span>
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

            {/* PARTIDOS — TABS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              {/* TAB SWITCHER */}
              <div className="flex items-center gap-0 mb-4 border border-zinc-800 rounded-lg overflow-hidden w-fit">
                {(['resultados', 'proximos'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all
                      ${tab === t ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'}
                    `}
                  >
                    {t === 'resultados' ? 'Últimos resultados' : 'Próximos'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {tab === 'resultados' ? (
                  <motion.div
                    key="resultados"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {data.partidos.map((p: any, i: number) => {
                      const localWin = p.goles_local > p.goles_visita;
                      const visitaWin = p.goles_visita > p.goles_local;
                      return (
                        <Link key={p.id} href={`/resultados#partido-${p.id}`}>
                          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center px-4 py-3.5 rounded-xl border border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all group">
                            {/* LOCAL */}
                            <div className="flex items-center gap-2 justify-end min-w-0">
                              <span className={`text-[11px] font-black uppercase tracking-tight truncate text-right ${localWin ? 'text-white' : 'text-zinc-600'}`}>
                                {p.equipo_local?.nombre}
                              </span>
                              <div className="relative w-6 h-6 shrink-0">
                                <Image src={`/escudos/${p.equipo_local?.id}.png`} alt="" fill className="object-contain" />
                              </div>
                            </div>
                            {/* SCORE */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span style={{ fontFamily: "'Impact', sans-serif" }} className={`text-xl leading-none tabular-nums ${localWin ? 'text-white' : 'text-zinc-700'}`}>
                                {p.goles_local}
                              </span>
                              <span className="text-zinc-800 text-xs font-black">–</span>
                              <span style={{ fontFamily: "'Impact', sans-serif" }} className={`text-xl leading-none tabular-nums ${visitaWin ? 'text-white' : 'text-zinc-700'}`}>
                                {p.goles_visita}
                              </span>
                            </div>
                            {/* VISITA */}
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative w-6 h-6 shrink-0">
                                <Image src={`/escudos/${p.equipo_visita?.id}.png`} alt="" fill className="object-contain" />
                              </div>
                              <span className={`text-[11px] font-black uppercase tracking-tight truncate ${visitaWin ? 'text-white' : 'text-zinc-600'}`}>
                                {p.equipo_visita?.nombre}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    <div className="text-right pt-1">
                      <Link href="/resultados" className="text-[8px] font-black uppercase tracking-widest text-zinc-700 hover:text-green-500 transition-colors">
                        Ver historial completo →
                      </Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="proximos"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {data.proximos.length === 0 ? (
                      <p className="text-center text-zinc-800 text-[9px] font-black uppercase tracking-widest py-10">
                        No hay partidos programados
                      </p>
                    ) : data.proximos.map((p: any) => (
                      <div key={p.id} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center px-4 py-3.5 rounded-xl border border-zinc-900">
                        <div className="flex items-center gap-2 justify-end min-w-0">
                          <span className="text-[11px] font-black uppercase tracking-tight truncate text-right text-zinc-400">
                            {p.equipo_local?.nombre}
                          </span>
                          <div className="relative w-6 h-6 shrink-0">
                            <Image src={`/escudos/${p.equipo_local?.id}.png`} alt="" fill className="object-contain" />
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-0.5 shrink-0">
                          <span className="text-[8px] font-black text-zinc-700 uppercase tracking-wider">
                            {new Date(p.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                          </span>
                          <span className="text-[9px] font-black text-green-600 uppercase tracking-widest border border-zinc-800 px-2 py-0.5 rounded">
                            J{p.jornada}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="relative w-6 h-6 shrink-0">
                            <Image src={`/escudos/${p.equipo_visita?.id}.png`} alt="" fill className="object-contain" />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-tight truncate text-zinc-400">
                            {p.equipo_visita?.nombre}
                          </span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-5">

            {/* ── TOP GOLEADORES ─────────────────────────────────────── */}
          <motion.section
            variants={itemVariants} initial="hidden" animate="visible"
            className="lg:col-span-4"
          >
            <div className="flex items-center gap-3 mb-3">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600">Top goleadores</span>
                <div className="flex-1 border-b border-zinc-900" />
              </div>

            {/* PODIO */}
            {data.goleadores.length > 0 && (
              <div className="flex items-end justify-center gap-3 mb-4 px-2 pt-2">
                {podioOrder.map((pos) => {
                  const g = data.goleadores[pos];
                  if (!g) return <div key={pos} className="flex-1" />;
                  const style = PODIO_STYLES[pos];
                  const equipoId = g.equipos?.[0]?.id || g.equipos?.id;

                  // NUEVA LÓGICA: Primer nombre + Inicial del apellido
                  const partesNombre = (g.nombre || '').trim().split(' ');
                  const nombreCorto = partesNombre.length > 1 
                    ? `${partesNombre[0]} ${partesNombre[1].charAt(0)}.` 
                    : partesNombre[0];

                  return (
                    <motion.div
                      variants={itemVariants}
                      key={pos}
                      className={`flex-1 flex flex-col items-center gap-2 ${pos === 0 ? '' : 'opacity-80'}`}
                    >
                      <div className={`relative ${style.size} ${style.glow} transition-all duration-500`}>
                        <Image src={`/escudos/${equipoId}.png`} alt="" fill className="object-contain" />
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${style.badge} border-2 border-black`}>
                          {pos + 1}
                        </div>
                      </div>
                      <div className="text-center">
                        {/* APLICAMOS LA NUEVA VARIABLE AQUÍ */}
                        <p 
                          className="text-[9px] font-black uppercase text-zinc-400 truncate w-full px-1" 
                          title={g.nombre} // Agregamos un tooltip nativo por si pasan el mouse
                        >
                          {nombreCorto}
                        </p>
                        <p className={`font-black italic text-green-400 leading-none ${pos === 0 ? 'text-2xl' : 'text-xl'}`}>
                          {g.goles}
                        </p>
                        <p className="text-[7px] text-zinc-700 uppercase font-black tracking-wider">goles</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* LISTA 4º Y 5º */}
            {data.goleadores.slice(3).length > 0 && (
              <div className="border border-zinc-800/60 rounded-2xl overflow-hidden">
                {data.goleadores.slice(3).map((g: any, i: number) => {
                  const equipoId = g.equipos?.[0]?.id || g.equipos?.id;
                  return (
                    <motion.div
                      variants={itemVariants}
                      key={i}
                      className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800/40 last:border-0 hover:bg-zinc-900/40 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[9px] font-mono text-zinc-700 w-4 shrink-0">{i + 4}</span>
                        <div className="relative w-6 h-6 shrink-0">
                          <Image src={`/escudos/${equipoId}.png`} alt="" fill className="object-contain" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-xs uppercase truncate text-zinc-300 group-hover:text-white transition-colors">
                            {g.nombre}
                          </p>
                          <p className="text-[8px] text-zinc-700 uppercase tracking-widest truncate">
                            {g.equipos?.[0]?.nombre || g.equipos?.nombre}
                          </p>
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
          <p className="text-zinc-800 text-[8px] uppercase tracking-[0.4em] font-black">
            Copa CEVI 2026
          </p>
          <p className="text-zinc-800 text-[8px] uppercase tracking-[0.3em] font-black">
            Benjamín Rivera Araneda
          </p>
        </footer>

      </div>
    </main>
  );
}