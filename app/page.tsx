'use client';

import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion'; //
import { useState, useEffect } from 'react';

// Variantes para animaciones de entrada
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" // Ahora TypeScript aceptará este string como un tipo de Easing válido
    }
  }
}; //

export default function Home() {
  const [data, setData] = useState<any>({ equipos: [], partidos: [], proximos: [], goleadores: [] });

  useEffect(() => {
    const fetchAllData = async () => {
      const ahora = new Date().toISOString();
      
      const [resEq, resPart, resProx, resGol] = await Promise.all([
        supabase.from('equipos').select('*').order('puntos', { ascending: false }).order('df', { ascending: false }).order('gf', { ascending: false }),
        supabase.from('partidos').select(`id, goles_local, goles_visita, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre)`).eq('estado', 'jugado').order('created_at', { ascending: false }).limit(5),
        supabase.from('partidos').select(`id, fecha, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre)`).eq('estado', 'programado').gt('fecha', ahora).order('fecha', { ascending: true }).limit(4),
        supabase.from('jugadores').select(`nombre, goles, equipos:id_equipo (id, nombre)`).gt('goles', 0).order('goles', { ascending: false }).limit(5)
      ]);

      setData({
        equipos: resEq.data || [],
        partidos: resPart.data || [],
        proximos: resProx.data || [],
        goleadores: resGol.data || []
      });
    };
    fetchAllData();
  }, []);

  return (
    <main className="p-4 md:p-8 bg-black text-white min-h-screen font-sans pt-20">
      {/* TÍTULO */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-7xl mx-auto mb-10"
      >
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          🏆 COPA CEVI
        </h1>
      </motion.div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CLASIFICACIÓN GENERAL */}
        <motion.section 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 w-full"
        >
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-2 italic">Clasificación General</h2>
          <div className="bg-zinc-900/50 rounded-2xl p-1 border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[350px] custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs min-w-[600px] lg:min-w-full">
                <thead className="sticky top-0 bg-zinc-900 z-10">
                  <tr className="text-zinc-500 uppercase text-[10px] tracking-widest border-b border-zinc-800">
                    <th className="px-4 py-4 text-center">Pos</th>
                    <th className="px-4 py-4">Equipo</th>
                    <th className="px-4 py-4 text-center">PJ</th>
                    <th className="px-4 py-4 text-center text-green-500/70">G</th>
                    <th className="px-4 py-4 text-center text-yellow-500/70">E</th>
                    <th className="px-4 py-4 text-center text-red-500/70">P</th>
                    <th className="px-4 py-4 text-center">DG</th>
                    <th className="px-4 py-4 text-right">Pts</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} className="divide-y divide-zinc-800/50">
                  {data.equipos.map((eq: any, index: number) => (
                    <motion.tr variants={itemVariants} key={eq.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-4 text-zinc-500 font-mono text-center">{index + 1}</td>
                      <td className="px-4 py-4 font-bold text-zinc-200 uppercase truncate">
                        <div className="flex items-center gap-3">
                          <Image src={`/escudos/${eq.id}.png`} alt="" width={24} height={24} className="object-contain" />
                          {eq.nombre}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-zinc-400">{eq.pj || 0}</td>
                      <td className="px-4 py-4 text-center text-zinc-500">{eq.pg || 0}</td>
                      <td className="px-4 py-4 text-center text-zinc-500">{eq.pe || 0}</td>
                      <td className="px-4 py-4 text-center text-zinc-500">{eq.pp || 0}</td>
                      <td className="px-4 py-4 text-center font-mono text-zinc-300">{(eq.df || 0) > 0 ? `+${eq.df}` : eq.df || 0}</td>
                      <td className="px-4 py-4 text-right font-black text-green-400">{eq.puntos || 0}</td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* TOP GOLEADORES CON PODIO */}
        <section className="lg:col-span-4 flex flex-col">
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-2 italic">Top Goleadores</h2>
          
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-4">
            {data.goleadores.length > 0 && (
              <div className="grid grid-cols-3 gap-2 items-end mb-2 px-1">
                {[1, 0, 2].map((pos) => {
                  const g = data.goleadores[pos];
                  if (!g) return <div key={pos} />;
                  const isFirst = pos === 0;
                  const isSecond = pos === 1;
                  const equipoId = g.equipos?.[0]?.id || g.equipos?.id;

                  return (
                    <motion.div variants={itemVariants} key={pos} className={`flex flex-col items-center ${isFirst ? 'z-10' : ''}`}>
                      <div className={`relative mb-3 flex items-center justify-center transition-all duration-500
                        ${isFirst ? 'w-24 h-24 drop-shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 
                          isSecond ? 'w-16 h-16 drop-shadow-[0_0_10px_rgba(161,161,170,0.4)]' : 
                          'w-16 h-16 drop-shadow-[0_0_10px_rgba(154,52,18,0.4)]'}`}>
                        <Image src={`/escudos/${equipoId}.png`} alt="" width={isFirst ? 90 : 60} height={isFirst ? 90 : 60} className="object-contain" />
                        <div className={`absolute -bottom-1 flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-black border border-black shadow-lg
                          ${isFirst ? 'bg-yellow-500 text-black' : isSecond ? 'bg-zinc-400 text-black' : 'bg-orange-800 text-white'}`}>
                          {pos + 1}
                        </div>
                      </div>
                      <div className="text-center w-full min-w-0">
                        <p className={`font-black uppercase truncate text-[9px] ${isFirst ? 'text-white' : 'text-zinc-500'}`}>{g.nombre.split(' ')[0]}</p>
                        <div className="flex flex-col leading-none">
                          <span className={`font-black italic text-green-500 ${isFirst ? 'text-2xl' : 'text-xl'}`}>{g.goles}</span>
                          <span className="text-[7px] text-zinc-600 uppercase font-black">Goles</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              {data.goleadores.slice(3).map((g: any, i: number) => (
                <motion.div variants={itemVariants} key={i} className="flex justify-between items-center p-4 border-b border-zinc-800/50 last:border-0 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center min-w-0 gap-3">
                    <span className="text-zinc-600 font-mono text-[10px]">0{i + 4}</span>
                    <Image src={`/escudos/${g.equipos?.[0]?.id || g.equipos?.id}.png`} alt="" width={28} height={28} className="object-contain" />
                    <div className="truncate">
                      <p className="font-bold text-xs truncate group-hover:text-green-500 transition-colors">{g.nombre}</p>
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest truncate">{g.equipos?.[0]?.nombre || g.equipos?.nombre}</p>
                    </div>
                  </div>
                  <div className="text-right ml-2 shrink-0">
                    <span className="text-green-500 font-black text-lg italic">{g.goles}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* RESULTADOS RECIENTES */}
        <motion.section variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-12 mt-4">
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-2 italic text-center lg:text-left">Resultados Recientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.partidos.map((partido: any) => (
              <motion.div whileHover={{ scale: 1.02 }} key={partido.id} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                    <span className="font-black text-[10px] uppercase truncate text-right">{partido.equipo_local?.nombre}</span>
                    <Image src={`/escudos/${partido.equipo_local?.id}.png`} alt="" width={28} height={28} className="object-contain" />
                  </div>
                  <div className="mx-3 px-3 py-1 bg-zinc-800 rounded-lg font-mono font-black text-green-500 text-sm border border-zinc-700/50 shadow-inner">
                    {partido.goles_local} - {partido.goles_visita}
                  </div>
                  <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
                    <Image src={`/escudos/${partido.equipo_visita?.id}.png`} alt="" width={28} height={28} className="object-contain" />
                    <span className="font-black text-[10px] uppercase truncate">{partido.equipo_visita?.nombre}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      <footer className="mt-20 pb-10 text-center opacity-50">
        <p className="text-zinc-700 text-[8px] uppercase tracking-[0.5em] font-black">
          {new Date().getFullYear()} • COPA CEVI • DESARROLLADO POR BENJAMÍN RIVERA ARANEDA
        </p>
      </footer>
    </main>
  );
}