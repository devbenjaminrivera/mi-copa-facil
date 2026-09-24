'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Partido } from '@/lib/types';

interface Props {
  partidos: Partido[];
  proximos: Partido[];
}

export function MatchesTabs({ partidos, proximos }: Props) {
  const [tab, setTab] = useState<'resultados' | 'proximos'>('resultados');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="h-full flex flex-col">
      <div className="flex items-center gap-1 mb-6 bg-black/40 p-1 rounded-full border border-white/10 w-fit shadow-inner">
        {(['resultados', 'proximos'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full ${tab === t ? 'bg-white/10 text-white shadow-md' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
            {t === 'resultados' ? 'Resultados Recientes' : 'Próximos Encuentros'}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {tab === 'resultados' ? (
            <motion.div key="resultados" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-3">
              {partidos.map((p) => {
                const lW = (p.goles_local ?? 0) > (p.goles_visita ?? 0);
                const vW = (p.goles_visita ?? 0) > (p.goles_local ?? 0);
                return (
                  <Link key={p.id} href={`/resultados#partido-${p.id}`}>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center px-4 py-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 group shadow-lg">
                      <div className="flex items-center gap-3 justify-end min-w-0">
                        <span className={`font-outfit text-sm font-bold uppercase truncate text-right transition-colors ${lW ? 'text-white drop-shadow-md' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{p.equipo_local?.nombre}</span>
                        <div className="relative w-8 h-8 shrink-0"><Image src={`/escudos/${p.equipo_local?.id}.png`} alt="" fill className="object-contain drop-shadow-md" /></div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                        <span className={`font-outfit text-2xl leading-none font-black tabular-nums transition-colors ${lW ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251, 146, 60,0.4)]' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{p.goles_local}</span>
                        <span className="text-zinc-700 text-[10px] font-black">:</span>
                        <span className={`font-outfit text-2xl leading-none font-black tabular-nums transition-colors ${vW ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251, 146, 60,0.4)]' : 'text-zinc-500 group-hover:text-zinc-300'}`}>{p.goles_visita}</span>
                      </div>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-8 h-8 shrink-0"><Image src={`/escudos/${p.equipo_visita?.id}.png`} alt="" fill className="object-contain drop-shadow-md" /></div>
                        <span className={`font-outfit text-sm font-bold uppercase truncate transition-colors ${vW ? 'text-white drop-shadow-md' : 'text-zinc-400 group-hover:text-zinc-300'}`}>{p.equipo_visita?.nombre}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
              <div className="text-center pt-4">
                <Link href="/resultados" className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1">Ir al historial completo →</Link>
              </div>
            </motion.div>
          ) : (
            <motion.div key="proximos" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-3">
              {proximos.length === 0 ? (
                <p className="text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest py-10">No hay partidos programados en este momento</p>
              ) : proximos.map((p) => (
                <div key={p.id} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center px-4 py-4 rounded-2xl bg-black/20 border border-white/5 shadow-lg">
                  <div className="flex items-center gap-3 justify-end min-w-0">
                    <span className="font-outfit text-sm font-bold uppercase truncate text-right text-zinc-400">{p.equipo_local?.nombre}</span>
                    <div className="relative w-8 h-8 shrink-0"><Image src={`/escudos/${p.equipo_local?.id}.png`} alt="" fill className="object-contain drop-shadow-md" /></div>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0 bg-black/40 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{p.fecha ? new Date(p.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : 'TBD'}</span>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Jornada {p.jornada}</span>
                  </div>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-8 h-8 shrink-0"><Image src={`/escudos/${p.equipo_visita?.id}.png`} alt="" fill className="object-contain drop-shadow-md" /></div>
                    <span className="font-outfit text-sm font-bold uppercase truncate text-zinc-400">{p.equipo_visita?.nombre}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
