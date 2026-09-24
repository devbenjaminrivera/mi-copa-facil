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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <main className="min-h-screen px-4 md:px-8 max-w-7xl mx-auto pb-24">
      
      {/* ── HEADER BENTO TILE ─────────────────────────────────────── */}
      <div className="mb-8 rounded-[2rem] overflow-hidden bento-card relative h-40 md:h-56 flex flex-col justify-end p-8 md:p-10 group">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 via-transparent to-blue-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-orange-500 text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-2">
              Copa CEVI · Clubes Oficiales
            </p>
            <h1 className="font-outfit text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-lg">
              EQUIPOS
            </h1>
          </div>
          
          {/* STATS RÁPIDAS */}
          <div className="flex gap-4 md:gap-8 pb-1">
            <div className="bg-black/30 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/5 text-center shadow-inner">
              <p className="font-outfit text-3xl md:text-4xl font-black text-orange-400 drop-shadow-[0_0_8px_rgba(251, 146, 60,0.4)] leading-none">
                {loading ? '-' : equipos.length}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">
                Inscritos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID DE EQUIPOS ──────────────────────────────────────── */}
      <div className="w-full">
        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-8 h-8 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {equipos.map((equipo) => (
              <motion.div variants={itemVariants} key={equipo.id} className="h-full">
                <Link
                  href={`/equipos/${equipo.id}`}
                  className="group flex flex-col items-center justify-center h-full bg-black/20 backdrop-blur-md border border-white/5 rounded-3xl p-8 md:p-10 hover:bg-white/5 hover:border-white/10 hover:-translate-y-1 transition-all duration-300 shadow-lg"
                >
                  {/* EFECTO AURORA DE FONDO (Hover) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />

                  {/* ESCUDO */}
                  <div className="relative w-32 h-32 md:w-36 md:h-36 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_24px_rgba(251, 146, 60,0.3)] z-10">
                    <Image
                      src={`/escudos/${equipo.id}.png`}
                      alt={`Escudo de ${equipo.nombre}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 128px, 144px"
                    />
                  </div>

                  {/* NOMBRE */}
                  <div className="text-center z-10">
                    <h2 className="font-outfit text-xl md:text-2xl font-black uppercase tracking-wide text-zinc-300 group-hover:text-white transition-colors">
                      {equipo.nombre}
                    </h2>
                  </div>

                  {/* BOTÓN / BADGE */}
                  <div className="mt-6 flex justify-center z-10">
                    <div className="bg-black/40 border border-white/5 px-5 py-2.5 rounded-full group-hover:border-orange-500/30 group-hover:bg-orange-500/10 transition-colors shadow-inner">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-orange-400 transition-colors">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 bento-card border-dashed border-white/10">
            <p className="font-outfit text-3xl md:text-4xl font-black text-zinc-600 uppercase tracking-wide">
              Sin equipos
            </p>
            <p className="text-sm font-bold text-zinc-500 mt-2 uppercase tracking-widest">
              Aún no hay clubes inscritos
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}