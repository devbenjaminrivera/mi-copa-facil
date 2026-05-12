'use client';

import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PerfilEquipo() {
  const params = useParams();
  const id = params.id as string;

  const [equipo, setEquipo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipo = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('equipos')
        .select(`
          nombre,
          pj, puntos, pg, pe, pp, gf, gc, df,
          jugadores!id_equipo (
            id,
            nombre,
            goles,
            numero_camiseta,
            sanciones (tipo)
          )
        `)
        .eq('id', id)
        .single();

      if (data) setEquipo(data);
      setLoading(false);
    };
    fetchEquipo();
  }, [id]);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) {
    return (
      <main className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <span className="text-zinc-600 font-black tracking-widest uppercase text-xs animate-pulse">
          Cargando club...
        </span>
      </main>
    );
  }

  if (!equipo) {
    return (
      <main className="bg-[#0a0a0a] min-h-screen flex flex-col items-center justify-center">
        <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-6">Equipo no encontrado</p>
        <Link href="/equipos" className="text-green-500 font-black uppercase text-xs tracking-widest hover:text-green-400 transition-colors">
          ← Volver a equipos
        </Link>
      </main>
    );
  }

  const jugadoresOrdenados = equipo.jugadores?.sort((a: any, b: any) => b.goles - a.goles) || [];
  const goleadores = jugadoresOrdenados.filter((j: any) => j.goles > 0);
  const sinGoles = jugadoresOrdenados.filter((j: any) => !j.goles || j.goles === 0);

  return (
    <main 
      className="bg-[#0a0a0a] text-white min-h-screen pb-24"
      style={{ fontFamily: "'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif" }}
    >
      {/* ── HEADER EDITORIAL Y NAVEGACIÓN ──────────────────────── */}
      <div className="border-b border-zinc-900 pt-14 mb-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            
            <Link
              href="/equipos"
              className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 hover:text-green-500 transition-colors mb-6"
            >
              ← Volver a Clubes
            </Link>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                {/* ESCUDO HERO */}
                <div className="relative w-40 h-40 md:w-52 md:h-52 shrink-0 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <Image
                    src={`/escudos/${id}.png`}
                    alt={equipo.nombre}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 160px, 208px"
                  />
                </div>
                
                {/* TÍTULO */}
                <div className="pb-2">
                  <p className="text-green-500 text-[9px] font-black uppercase tracking-[0.4em] mb-2">
                    Plantilla Oficial
                  </p>
                  <h1 
                    style={{ fontFamily: "'Impact', 'Arial Narrow', sans-serif", fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 0.9, letterSpacing: '-0.02em' }}
                    className="uppercase font-black italic text-white"
                  >
                    {equipo.nombre}
                  </h1>
                </div>
              </div>

              {/* G - E - P (Victorias, Empates, Derrotas) */}
              <div className="flex justify-center md:justify-end gap-6 pb-2">
                 {[
                  { label: 'PG', value: equipo.pg, color: 'text-green-500' },
                  { label: 'PE', value: equipo.pe, color: 'text-yellow-500' },
                  { label: 'PP', value: equipo.pp, color: 'text-red-500' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <p style={{ fontFamily: "'Impact', sans-serif" }} className={`text-3xl font-black ${color} leading-none`}>
                      {value ?? 0}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* ── STATS GRID (DASHBOARD MODULE) ──────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="grid grid-cols-4 gap-2 md:gap-4 mb-16"
        >
          {[
            { label: 'Puntos', value: equipo.puntos, color: 'text-green-400', bg: 'bg-green-500/5', border: 'border-green-500/20' },
            { label: 'Partidos', value: equipo.pj, color: 'text-white', bg: 'bg-zinc-950/50', border: 'border-zinc-900' },
            { label: 'Goles Favor', value: equipo.gf, color: 'text-white', bg: 'bg-zinc-950/50', border: 'border-zinc-900' },
            { label: 'Dif. Goles', value: (equipo.df ?? 0) > 0 ? `+${equipo.df}` : equipo.df, color: (equipo.df ?? 0) >= 0 ? 'text-green-400' : 'text-red-400', bg: 'bg-zinc-950/50', border: 'border-zinc-900' },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-[1.5rem] flex flex-col items-center py-6 px-2 transition-all hover:bg-zinc-900/50`}>
              <span style={{ fontFamily: "'Impact', sans-serif" }} className={`text-3xl md:text-5xl font-black tabular-nums ${color} leading-none`}>
                {value ?? 0}
              </span>
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-2 text-center">
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ── PLANTILLA UNIFICADA ────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 style={{ fontFamily: "'Impact', sans-serif" }} className="text-2xl md:text-3xl font-black italic uppercase text-zinc-800 tracking-wide">
              PLANTILLA
            </h2>
            <div className="flex-1 h-px bg-zinc-900" />
            <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest shrink-0">
              {jugadoresOrdenados.length} Jugadores
            </span>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {/* Mapeo único de todos los jugadores */}
            {jugadoresOrdenados.map((jugador: any) => (
              <motion.div variants={itemVariants} key={jugador.id}>
                <JugadorRow 
                  jugador={jugador} 
                  destacado={jugador.goles > 0} 
                />
              </motion.div>
            ))}
          </motion.div>
        </section>

      </div>
    </main>
  );
}

// Componente interno para la fila del jugador
function JugadorRow({ jugador, destacado = false }: { jugador: any; destacado?: boolean }) {
  const amarillas = jugador.sanciones?.filter((s: any) => s.tipo === 'amarilla') || [];
  const rojas = jugador.sanciones?.filter((s: any) => s.tipo === 'roja') || [];

  return (
    <div className={`group flex items-center justify-between rounded-[1.5rem] px-6 py-5 transition-all duration-300 border
      ${destacado
        ? 'bg-zinc-950/40 border-zinc-800/80 hover:border-green-500/50 hover:bg-zinc-900/60 hover:shadow-[0_0_30px_rgba(74,222,128,0.05)]'
        : 'bg-transparent border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/30'
      }
    `}>
      <div className="flex items-center gap-4 md:gap-6 min-w-0">
        
        {/* NÚMERO CAMISETA */}
        <span style={{ fontFamily: "'Impact', sans-serif" }} className={`text-xl md:text-2xl italic w-8 text-center shrink-0 transition-colors
          ${destacado ? 'text-green-500/80 group-hover:text-green-400' : 'text-zinc-800 group-hover:text-zinc-600'}
        `}>
          {jugador.numero_camiseta ?? '-'}
        </span>

        {/* NOMBRE */}
        <p className={`font-black uppercase text-sm md:text-base tracking-tight truncate transition-colors
          ${destacado ? 'text-zinc-200 group-hover:text-white' : 'text-zinc-500 group-hover:text-zinc-300'}
        `}>
          {jugador.nombre}
        </p>

        {/* TARJETAS (Mismo diseño de los resultados) */}
        {(amarillas.length > 0 || rojas.length > 0) && (
          <div className="flex items-center gap-[3px] shrink-0 ml-2">
            {amarillas.map((_: any, i: number) => (
              <div key={`a${i}`} className="w-[8px] h-[12px] rounded-[2px] bg-yellow-400 border-[0.5px] border-black/20 shadow-[0_1px_2px_rgba(0,0,0,0.5)] rotate-[-5deg]" title="Amarilla" />
            ))}
            {rojas.map((_: any, i: number) => (
              <div key={`r${i}`} className="w-[8px] h-[12px] rounded-[2px] bg-red-600 border-[0.5px] border-black/20 shadow-[0_1px_2px_rgba(0,0,0,0.5)] rotate-[5deg]" title="Roja" />
            ))}
          </div>
        )}
      </div>

      {/* GOLES */}
      <div className="flex items-center gap-3 shrink-0 ml-4">
        {jugador.goles > 0 && (
          <span className="text-[10px] grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all">⚽</span>
        )}
        <span style={{ fontFamily: "'Impact', sans-serif" }} className={`text-2xl md:text-3xl italic tabular-nums transition-colors
          ${jugador.goles > 0 ? 'text-green-500 group-hover:text-green-400' : 'text-zinc-800'}
        `}>
          {jugador.goles || 0}
        </span>
      </div>
    </div>
  );
}