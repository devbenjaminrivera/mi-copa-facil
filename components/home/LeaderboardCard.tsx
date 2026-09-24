'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Equipo } from '@/lib/types';

interface Props {
  lider: Equipo;
  isPlayoffsMode: boolean;
}

export function LeaderboardCard({ lider, isPlayoffsMode }: Props) {
  if (!lider || isPlayoffsMode) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full h-full">
      <Link href={`/equipos/${lider.id}`} className="block h-full">
        <div className="relative overflow-hidden w-full h-full bento-card group flex flex-col justify-between p-6 md:p-8 min-h-[320px]">
          
          {/* Fondo animado estilo aurora */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-blue-500/10 opacity-30 group-hover:opacity-60 transition-opacity duration-700" />
          
          <div className="relative z-10 flex items-start justify-between mb-8">
            <div>
              <span className="inline-block bg-white/10 text-white backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 mb-4 border border-white/10 shadow-lg">
                Puntero Actual
              </span>
              <h2 className="font-outfit text-4xl md:text-5xl font-black tracking-tight text-white group-hover:text-orange-400 transition-colors uppercase drop-shadow-md">
                {lider.nombre}
              </h2>
            </div>
            <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 ml-4 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_32px_rgba(251, 146, 60,0.4)]">
              <Image src={`/escudos/${lider.id}.png`} alt={lider.nombre} fill className="object-contain" />
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-4 gap-2 md:gap-4 mt-auto">
            {[
              { label: 'Pts', value: lider.puntos, accent: true },
              { label: 'PJ', value: lider.pj },
              { label: 'G', value: lider.pg },
              { label: 'Dif', value: lider.df > 0 ? `+${lider.df}` : lider.df },
            ].map(({ label, value, accent }) => (
              <div key={label} className="bg-black/30 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/5 flex flex-col items-center justify-center transition-transform group-hover:-translate-y-2 hover:bg-white/10">
                <p className={`font-outfit text-2xl md:text-4xl font-black leading-none ${accent ? 'text-orange-400 drop-shadow-[0_0_12px_rgba(251, 146, 60,0.5)]' : 'text-white'}`}>
                  {value ?? 0}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
