'use client';

import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ListaEquipos() {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipos = async () => {
      const { data } = await supabase
        .from('equipos')
        .select('*')
        .order('nombre');

      if (data) setEquipos(data);
      setLoading(false);
    };
    fetchEquipos();
  }, []);

  // Animaciones de Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <main
      className="bg-[#0a00a] text-white min-h-screen pb-24"
      style={{ fontFamily: "'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif" }}
    >
      {/* ── HEADER EDITORIAL ─────────────────────────────────────── */}
      <div className="border-b border-zinc-900 pt-14 mb-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-green-500 text-[9px] font-black uppercase tracking-[0.4em] mb-3">
              Copa CEVI 2026 · Clubes Oficiales
            </p>
            <div className="flex items-end justify-between">
              <h1
                style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", fontSize: 'clamp(3rem, 10vw, 6rem)', lineHeight: 0.9, letterSpacing: '-0.02em' }}
                className="uppercase font-black italic text-white"
              >
                EQUIPOS
              </h1>
              
              {/* STATS RÁPIDAS */}
              <div className="hidden md:flex items-end gap-6 pb-1">
                <div className="text-right">
                  <p style={{ fontFamily: "'Impact', sans-serif" }} className="text-4xl font-black text-green-600 leading-none">
                    {equipos.length || '-'}
                  </p>
                  <p className="text-[7px] font-black uppercase tracking-widest text-zinc-700 mt-0.5">
                    Inscritos
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── GRID DE EQUIPOS ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="text-zinc-600 font-black tracking-widest uppercase text-xs animate-pulse">
              Cargando clubes...
            </span>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            // LA CLAVE ESTÁ AQUÍ: grid-cols-1 en móvil, 2 en tablets, 3 en PC
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {equipos.map((equipo) => (
              <motion.div variants={itemVariants} key={equipo.id} className="h-full">
                <Link
                  href={`/equipos/${equipo.id}`}
                  className="group flex flex-col items-center justify-center h-full bg-zinc-950/30 border border-zinc-900 rounded-[2rem] p-10 hover:border-green-500/50 hover:bg-zinc-900/50 hover:shadow-[0_0_30px_rgba(74,222,128,0.1)] transition-all duration-300"
                >
                  {/* ESCUDO (TAMAÑO ORIGINAL GIGANTE) */}
                  <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(74,222,128,0.25)]">
                    <Image
                      src={`/escudos/${equipo.id}.png`}
                      alt={`Escudo de ${equipo.nombre}`}
                      fill
                      className="object-contain drop-shadow-lg"
                      sizes="(max-width: 768px) 128px, 160px"
                      priority
                    />
                  </div>

                  {/* NOMBRE */}
                  <div className="text-center">
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-300 group-hover:text-white transition-colors leading-tight">
                      {equipo.nombre}
                    </h2>
                  </div>

                  {/* BOTÓN / BADGE */}
                  <div className="mt-6 flex justify-center">
                    <div className="bg-zinc-900/50 border border-zinc-800 px-5 py-2 rounded-full group-hover:border-green-500/30 group-hover:bg-green-500/10 transition-all">
                      <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-green-400 transition-colors">
                        Ver Plantilla →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ESTADO VACÍO */}
        {!loading && equipos.length === 0 && (
          <div className="text-center py-24">
            <p style={{ fontFamily: "'Impact', sans-serif" }} className="text-4xl font-black italic text-zinc-900 uppercase">
              Sin equipos
            </p>
          </div>
        )}
      </div>
    </main>
  );
}