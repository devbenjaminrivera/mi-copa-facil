'use client';

import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';

// Variantes con tipado correcto para evitar errores de TypeScript
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
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

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
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
          🏆 COPA CEVI
        </h1>
      </motion.div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TABLA DE POSICIONES */}
        <motion.section variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-8 w-full">
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-2 italic">Clasificación General</h2>
          <div className="bg-zinc-900/50 rounded-2xl p-1 border border-zinc-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[350px] custom-scrollbar">
              <table className="w-full text-left border-collapse text-xs min-w-[600px] lg:min-w-full">
                <thead className="sticky top-0 bg-zinc-900 z-10">
                  <tr className="text-zinc-500 uppercase text-[10px] tracking-widest border-b border-zinc-800">
                    <th className="px-4 py-4 text-center">Pos</th>
                    <th className="px-4 py-4">Equipo</th>
                    <th className="px-4 py-4 text-center">PJ</th>
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
                          <Image src={`/escudos/${eq.id}.png`} alt="" width={20} height={20} className="object-contain opacity-80" />
                          {eq.nombre}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-zinc-400">{eq.pj || 0}</td>
                      <td className="px-4 py-4 text-center font-mono text-zinc-300">{(eq.df || 0) > 0 ? `+${eq.df}` : eq.df || 0}</td>
                      <td className="px-4 py-4 text-right font-black text-green-400">{eq.puntos || 0}</td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* GOLEADORES (PODIO) */}
        <section className="lg:col-span-4 flex flex-col">
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 ml-2 italic">Goleadores</h2>
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-4">
            {/* ... (Tu lógica de podio que ya funciona perfecto) ... */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              {data.goleadores.map((g: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-4 border-b border-zinc-800/50 last:border-0">
                  <div className="flex items-center gap-3 truncate">
                    <Image src={`/escudos/${g.equipos?.[0]?.id || g.equipos?.id}.png`} alt="" width={24} height={24} className="object-contain" />
                    <span className="font-bold text-xs truncate">{g.nombre}</span>
                  </div>
                  <span className="text-green-500 font-black text-lg italic">{g.goles}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* RESULTADOS RECIENTES (Minimalistas) */}
        <motion.section variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-12 mt-8">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Resultados</h2>
            <div className="h-[1px] flex-1 bg-zinc-800 ml-4 opacity-30"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.partidos.map((partido: any) => (
              <div key={partido.id} className="bg-zinc-900/20 border-l-2 border-green-500 p-4 rounded-r-xl">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-tight">
                    <span className="truncate">{partido.equipo_local?.nombre}</span>
                    <span className={partido.goles_local > partido.goles_visita ? 'text-green-500' : 'text-zinc-600'}>{partido.goles_local}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-tight">
                    <span className="truncate">{partido.equipo_visita?.nombre}</span>
                    <span className={partido.goles_visita > partido.goles_local ? 'text-green-500' : 'text-zinc-600'}>{partido.goles_visita}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* PRÓXIMOS PARTIDOS (Recuperados) */}
        {data.proximos.length > 0 && (
          <motion.section variants={itemVariants} initial="hidden" animate="visible" className="lg:col-span-12 mt-8">
            <div className="flex items-center justify-between mb-6 px-2">
              <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Próximos Encuentros</h2>
              <div className="h-[1px] flex-1 bg-zinc-800 ml-4 opacity-30"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.proximos.map((p: any) => (
                <div key={p.id} className="bg-zinc-900/40 border border-zinc-800/50 p-4 rounded-2xl flex flex-col items-center gap-3">
                  <span className="text-[9px] text-green-500 font-mono uppercase font-bold tracking-tighter">
                    {new Date(p.fecha).toLocaleString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center justify-center gap-4 w-full">
                    <Image src={`/escudos/${p.equipo_local?.id}.png`} alt="" width={32} height={32} className="object-contain" />
                    <span className="text-zinc-700 font-bold italic text-[10px]">VS</span>
                    <Image src={`/escudos/${p.equipo_visita?.id}.png`} alt="" width={32} height={32} className="object-contain" />
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[8px] font-black uppercase text-zinc-400 text-center truncate w-full">{p.equipo_local?.nombre}</span>
                    <span className="text-[8px] font-black uppercase text-zinc-400 text-center truncate w-full">{p.equipo_visita?.nombre}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

      </div>

      <footer className="mt-20 pb-10 text-center opacity-30">
        <p className="text-zinc-700 text-[8px] uppercase tracking-[0.5em] font-black">
          {new Date().getFullYear()} • COPA CEVI • BENJAMÍN RIVERA ARANEDA
        </p>
      </footer>
    </main>
  );
}