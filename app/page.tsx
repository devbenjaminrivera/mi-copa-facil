'use client';

import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }
};

const RenderTarjetas = ({ partido, equipoId }: { partido: any; equipoId: string | number }) => {
  const tarjetasEquipo = partido.sanciones?.filter((s: any) =>
    String(s.id_equipo) === String(equipoId)
  ) || [];
  if (tarjetasEquipo.length === 0) return null;
  const huboAmarilla = tarjetasEquipo.some((s: any) => s.tipo === 'amarilla');
  const huboRoja = tarjetasEquipo.some((s: any) => s.tipo === 'roja');
  return (
    <div className="flex ml-1.5 items-center gap-[3px]">
      {huboAmarilla && (
        <div className="w-[8px] h-[11px] rounded-[2px] bg-yellow-400 rotate-[-5deg]" title="Amonestación" />
      )}
      {huboRoja && (
        <div className="w-[8px] h-[11px] rounded-[2px] bg-red-600 rotate-[5deg]" title="Expulsión" />
      )}
    </div>
  );
};

const PODIO_STYLES = [
  { glow: 'drop-shadow-[0_0_18px_rgba(234,179,8,0.7)]',  badge: 'bg-yellow-500 text-black', size: 'w-24 h-24' },
  { glow: 'drop-shadow-[0_0_12px_rgba(161,161,170,0.5)]', badge: 'bg-zinc-400 text-black',   size: 'w-16 h-16' },
  { glow: 'drop-shadow-[0_0_12px_rgba(154,52,18,0.5)]',   badge: 'bg-orange-800 text-white', size: 'w-16 h-16' },
];

export default function Home() {
  const [data, setData] = useState<any>({ equipos: [], partidos: [], proximos: [], goleadores: [] });

  useEffect(() => {
    const fetchAllData = async () => {
      const ahora = new Date().toISOString();
      const [resEq, resPart, resProx, resGol] = await Promise.all([
        supabase.from('equipos').select('*').order('puntos', { ascending: false }).order('df', { ascending: false }).order('gf', { ascending: false }),
        supabase.from('partidos').select(`id, goles_local, goles_visita, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre), sanciones(tipo, id_equipo)`).eq('estado', 'jugado').order('created_at', { ascending: false }).limit(5),
        supabase.from('partidos').select(`id, fecha, jornada, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre)`).eq('estado', 'programado').gt('fecha', ahora).order('jornada', { ascending: true }).order('fecha', { ascending: true }),
        supabase.from('jugadores').select(`nombre, goles, equipos:id_equipo (id, nombre)`).gt('goles', 0).order('goles', { ascending: false }).limit(5),
      ]);
      setData({
        equipos: resEq.data || [],
        partidos: resPart.data || [],
        proximos: resProx.data || [],
        goleadores: resGol.data || [],
      });
    };
    fetchAllData();
  }, []);

  const partidosPorJornada = data.proximos.reduce((acc: any, partido: any) => {
    const j = partido.jornada || 1;
    if (!acc[j]) acc[j] = [];
    acc[j].push(partido);
    return acc;
  }, {});

  // Posiciones del podio: 2°, 1°, 3°
  const podioOrder = [1, 0, 2];

  return (
    <main className="bg-black text-white min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 pb-20">

        {/* ── HERO HEADER ──────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 md:mb-16"
        >
          <p className="text-green-500 font-mono text-[10px] uppercase tracking-[0.35em] mb-3">
            Copa CEVI 2026 — Estadísticas Oficiales
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none text-white">
            Tabla de Posiciones
          </h1>
        </motion.header>

        {/* ── GRID PRINCIPAL ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ── CLASIFICACIÓN ──────────────────────────────────────── */}
          <motion.section
            variants={itemVariants} initial="hidden" animate="visible"
            className="lg:col-span-8"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 mb-3 ml-1">
              Clasificación general
            </p>
            <div className="border border-zinc-800/60 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs min-w-[520px]">
                  <thead>
                    <tr className="bg-zinc-900/80 text-zinc-600 uppercase text-[9px] tracking-widest border-b border-zinc-800">
                      <th className="px-4 py-3.5 text-center w-10">#</th>
                      <th className="px-4 py-3.5">Equipo</th>
                      <th className="px-4 py-3.5 text-center text-green-500/80">Pts</th>
                      <th className="px-4 py-3.5 text-center">PJ</th>
                      <th className="px-4 py-3.5 text-center text-green-600/80">G</th>
                      <th className="px-4 py-3.5 text-center text-yellow-600/80">E</th>
                      <th className="px-4 py-3.5 text-center text-red-600/80">P</th>
                      <th className="px-4 py-3.5 text-center">DG</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={containerVariants} className="divide-y divide-zinc-800/40">
                    {data.equipos.map((eq: any, index: number) => (
                      <motion.tr
                        variants={itemVariants}
                        key={eq.id}
                        className={`transition-colors hover:bg-zinc-900/50 group
                          ${index === 0 ? 'bg-green-500/5' : ''}
                        `}
                      >
                        <td className="px-4 py-4 text-center">
                          {index === 0
                            ? <span className="text-green-500 font-black text-[10px]">①</span>
                            : <span className="text-zinc-700 font-mono text-[10px]">{index + 1}</span>
                          }
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-6 h-6 shrink-0">
                              <Image src={`/escudos/${eq.id}.png`} alt="" fill className="object-contain" />
                            </div>
                            <span className={`font-black uppercase tracking-tight truncate text-xs
                              ${index === 0 ? 'text-white' : 'text-zinc-300 group-hover:text-white transition-colors'}
                            `}>
                              {eq.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center font-black text-green-400 tabular-nums text-sm">
                          {eq.puntos || 0}
                        </td>
                        <td className="px-4 py-4 text-center text-zinc-500 tabular-nums">{eq.pj || 0}</td>
                        <td className="px-4 py-4 text-center text-zinc-500 tabular-nums">{eq.pg || 0}</td>
                        <td className="px-4 py-4 text-center text-zinc-500 tabular-nums">{eq.pe || 0}</td>
                        <td className="px-4 py-4 text-center text-zinc-500 tabular-nums">{eq.pp || 0}</td>
                        <td className="px-4 py-4 text-center font-mono text-zinc-400 tabular-nums">
                          {(eq.df || 0) > 0 ? `+${eq.df}` : eq.df || 0}
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </div>
          </motion.section>

          {/* ── TOP GOLEADORES ─────────────────────────────────────── */}
          <motion.section
            variants={itemVariants} initial="hidden" animate="visible"
            className="lg:col-span-4"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 mb-3 ml-1">
              Top goleadores
            </p>

            {/* PODIO */}
            {data.goleadores.length > 0 && (
              <div className="flex items-end justify-center gap-3 mb-4 px-2 pt-2">
                {podioOrder.map((pos) => {
                  const g = data.goleadores[pos];
                  if (!g) return <div key={pos} className="flex-1" />;
                  const style = PODIO_STYLES[pos];
                  const equipoId = g.equipos?.[0]?.id || g.equipos?.id;
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
                        <p className="text-[9px] font-black uppercase text-zinc-400 truncate w-full px-1">
                          {g.nombre.split(' ')[0]}
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
                          <p className="text-[8px] text-zinc-600 uppercase tracking-widest truncate">
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

          {/* ── ÚLTIMOS RESULTADOS ─────────────────────────────────── */}
          <motion.section
            variants={itemVariants} initial="hidden" animate="visible"
            className="lg:col-span-12 mt-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 shrink-0">
                Últimos resultados
              </p>
              <div className="h-px flex-1 bg-zinc-900" />
              <Link
                href="/resultados"
                className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-green-500 transition-colors shrink-0"
              >
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.partidos.map((partido: any) => (
                <Link href={`/resultados#partido-${partido.id}`} key={partido.id}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="group border border-zinc-800/60 rounded-2xl p-4 hover:border-zinc-700 hover:bg-zinc-900/30 transition-all cursor-pointer"
                  >
                    {/* LOCAL */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative w-5 h-5 shrink-0">
                          <Image src={`/escudos/${partido.equipo_local?.id}.png`} alt="" fill className="object-contain" />
                        </div>
                        <span className="font-black text-xs uppercase tracking-tight truncate text-zinc-300">
                          {partido.equipo_local?.nombre}
                        </span>
                        <RenderTarjetas partido={partido} equipoId={partido.equipo_local?.id} />
                      </div>
                      <span className={`font-black font-mono text-base tabular-nums ml-2 shrink-0
                        ${partido.goles_local > partido.goles_visita ? 'text-white' : 'text-zinc-600'}
                      `}>
                        {partido.goles_local}
                      </span>
                    </div>

                    {/* VISITA */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="relative w-5 h-5 shrink-0">
                          <Image src={`/escudos/${partido.equipo_visita?.id}.png`} alt="" fill className="object-contain" />
                        </div>
                        <span className="font-black text-xs uppercase tracking-tight truncate text-zinc-300">
                          {partido.equipo_visita?.nombre}
                        </span>
                        <RenderTarjetas partido={partido} equipoId={partido.equipo_visita?.id} />
                      </div>
                      <span className={`font-black font-mono text-base tabular-nums ml-2 shrink-0
                        ${partido.goles_visita > partido.goles_local ? 'text-white' : 'text-zinc-600'}
                      `}>
                        {partido.goles_visita}
                      </span>
                    </div>

                    {/* FOOTER CARD */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/40 flex justify-end">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700 group-hover:text-green-500 transition-colors">
                        Ver detalle →
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.section>

          {/* ── PRÓXIMOS ENCUENTROS ────────────────────────────────── */}
          {Object.keys(partidosPorJornada).length > 0 && (
            <motion.section
              variants={itemVariants} initial="hidden" animate="visible"
              className="lg:col-span-12 mt-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 shrink-0">
                  Próximos encuentros
                </p>
                <div className="h-px flex-1 bg-zinc-900" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.keys(partidosPorJornada)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((numJornada) => (
                    <div
                      key={numJornada}
                      className="border border-zinc-800/60 rounded-2xl overflow-hidden"
                    >
                      {/* HEADER JORNADA */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 bg-zinc-900/40">
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-500">
                          Jornada {numJornada}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-700">
                          {partidosPorJornada[numJornada].length} partido{partidosPorJornada[numJornada].length !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* PARTIDOS */}
                      <div className="divide-y divide-zinc-800/40">
                        {partidosPorJornada[numJornada].map((p: any) => (
                          <div key={p.id} className="px-5 py-4 hover:bg-zinc-900/30 transition-colors">
                            {/* FECHA */}
                            <p className="text-[9px] font-mono text-green-500/70 uppercase tracking-wider mb-3">
                              {new Date(p.fecha).toLocaleString('es-CL', {
                                weekday: 'short', day: 'numeric', month: 'short',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </p>
                            {/* EQUIPOS */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                                <span className="text-[10px] font-black uppercase text-zinc-300 text-right truncate">
                                  {p.equipo_local?.nombre}
                                </span>
                                <div className="relative w-7 h-7 shrink-0">
                                  <Image src={`/escudos/${p.equipo_local?.id}.png`} alt="" fill className="object-contain" />
                                </div>
                              </div>
                              <span className="text-zinc-800 font-black italic text-[10px] shrink-0">VS</span>
                              <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                                <div className="relative w-7 h-7 shrink-0">
                                  <Image src={`/escudos/${p.equipo_visita?.id}.png`} alt="" fill className="object-contain" />
                                </div>
                                <span className="text-[10px] font-black uppercase text-zinc-300 text-left truncate">
                                  {p.equipo_visita?.nombre}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </motion.section>
          )}

        </div>

        {/* FOOTER */}
        <footer className="mt-20 text-center">
          <p className="text-zinc-800 text-[8px] uppercase tracking-[0.5em] font-black">
            2026 · Copa CEVI · Desarrollado por Benjamín Rivera Araneda
          </p>
        </footer>

      </div>
    </main>
  );
}