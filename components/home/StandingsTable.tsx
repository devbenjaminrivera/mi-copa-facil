'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Equipo } from '@/lib/types';

interface Props {
  equipos: Equipo[];
}

export function StandingsTable({ equipos }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-outfit text-2xl font-black uppercase text-white">Tabla de Posiciones</h3>
        <span className="text-xs font-bold text-zinc-400 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">Fase Regular</span>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="grid grid-cols-[30px_1fr_40px_40px_40px_60px] text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 px-2 border-b border-white/10 pb-3">
          <span>#</span>
          <span>Equipo</span>
          <span className="text-center text-orange-500">Pts</span>
          <span className="text-center">PJ</span>
          <span className="text-center">Dif</span>
          <span className="text-center">Forma</span>
        </div>
        
        <div className="flex-1 space-y-2">
          {equipos.map((eq, i) => (
            <Link key={eq.id} href={`/equipos/${eq.id}`}>
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.04 }}
                className={`grid grid-cols-[30px_1fr_40px_40px_40px_60px] items-center px-4 py-3.5 rounded-2xl border transition-all duration-300 group
                  ${i === 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-black/20 border-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 hover:shadow-lg'}`}
              >
                <span className={`text-xs font-bold ${i === 0 ? 'text-orange-500' : 'text-zinc-500'}`}>{i + 1}</span>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-7 h-7 shrink-0">
                    <Image src={`/escudos/${eq.id}.png`} alt="" fill className="object-contain drop-shadow-md" />
                  </div>
                  <span className={`font-outfit text-sm font-bold uppercase truncate transition-colors ${i === 0 ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>{eq.nombre}</span>
                </div>
                <span className="text-center text-sm font-bold text-orange-400 drop-shadow-[0_0_8px_rgba(251, 146, 60,0.3)] tabular-nums">{eq.puntos || 0}</span>
                <span className="text-center text-xs text-zinc-400 tabular-nums">{eq.pj || 0}</span>
                <span className={`text-center text-xs font-bold tabular-nums ${(eq.df || 0) >= 0 ? 'text-zinc-300' : 'text-red-400'}`}>
                  {(eq.df || 0) > 0 ? `+${eq.df}` : eq.df || 0}
                </span>
                
                {/* Indicadores visuales de racha (Mockeado para diseño) */}
                <div className="flex items-center justify-center gap-1.5">
                  {[...Array(5)].map((_, idx) => {
                    const isWin = Math.random() > 0.4;
                    return (
                      <div 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full ${isWin ? 'bg-orange-500 shadow-[0_0_6px_#f97316]' : 'bg-zinc-700'}`} 
                        title={isWin ? 'Victoria' : 'Pérdida/Empate'}
                      />
                    );
                  })}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
