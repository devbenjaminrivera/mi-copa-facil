'use client';

import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { Jugador } from '@/lib/types';

interface Props {
  goleadores: Jugador[];
  isPlayoffsMode: boolean;
}

const PODIO_STYLES = [
  { glow: 'drop-shadow-[0_0_32px_rgba(234,179,8,0.4)]',  badge: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black', size: 'w-24 h-24 md:w-28 md:h-28', ring: 'ring-2 ring-yellow-500/50 ring-offset-4 ring-offset-black' },
  { glow: 'drop-shadow-[0_0_24px_rgba(161,161,170,0.3)]', badge: 'bg-gradient-to-br from-zinc-300 to-zinc-500 text-black',   size: 'w-16 h-16 md:w-20 md:h-20', ring: 'ring-1 ring-zinc-400/30 ring-offset-4 ring-offset-black' },
  { glow: 'drop-shadow-[0_0_24px_rgba(154,52,18,0.3)]',   badge: 'bg-gradient-to-br from-orange-700 to-orange-900 text-white', size: 'w-16 h-16 md:w-20 md:h-20', ring: 'ring-1 ring-orange-800/30 ring-offset-4 ring-offset-black' },
];

export function TopScorers({ goleadores, isPlayoffsMode }: Props) {
  const itemVariants: Variants = {
    hidden: { y: 16, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  const podioOrder = [1, 0, 2];

  return (
    <motion.section variants={itemVariants} initial="hidden" animate="visible" className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-outfit text-2xl font-black uppercase text-white">
          {isPlayoffsMode ? 'Goleadores' : 'Top Goleadores'}
        </h3>
      </div>

      {goleadores.length > 0 && (
        <div className="flex items-end justify-center gap-4 mb-8 px-2 pt-4 relative">
          {/* Glass podium backdrop */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/5 to-transparent rounded-t-3xl -z-10" />
          
          {podioOrder.map((pos) => {
            const g = goleadores[pos];
            if (!g) return <div key={pos} className="flex-1" />;
            const style = PODIO_STYLES[pos];
            
            const equiposArray = Array.isArray(g.equipos) ? g.equipos : (g.equipos ? [g.equipos] : []);
            const equipoId = equiposArray[0]?.id;
            
            const partes = (g.nombre || '').trim().split(' ');
            const nombreCorto = partes.length > 1 ? `${partes[0]} ${partes[1].charAt(0)}.` : partes[0];
            return (
              <motion.div variants={itemVariants} key={pos} className={`flex-1 flex flex-col items-center gap-3 ${pos === 0 ? 'z-10' : 'opacity-80 hover:opacity-100 transition-opacity'}`}>
                <div className={`relative ${style.size} ${style.glow} ${style.ring} rounded-full bg-black/40 backdrop-blur-sm transition-transform duration-500 hover:scale-110 flex items-center justify-center p-2`}>
                  {equipoId && <Image src={`/escudos/${equipoId}.png`} alt="" fill className="object-contain p-3" />}
                  <div className={`absolute -bottom-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${style.badge} shadow-xl`}>{pos + 1}</div>
                </div>
                <div className="text-center mt-2">
                  <p className="text-[10px] font-bold uppercase text-zinc-300 truncate w-full px-1" title={g.nombre}>{nombreCorto}</p>
                  <p className={`font-outfit font-black text-orange-400 leading-none mt-1 ${pos === 0 ? 'text-4xl drop-shadow-[0_0_12px_rgba(251, 146, 60,0.5)]' : 'text-2xl'}`}>{g.goles}</p>
                  <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest mt-1">goles</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {goleadores.slice(3).length > 0 && (
        <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden flex-1">
          {goleadores.slice(3).map((g, i) => {
            const equiposArray = Array.isArray(g.equipos) ? g.equipos : (g.equipos ? [g.equipos] : []);
            const equipoId = equiposArray[0]?.id;
            const equipoNombre = equiposArray[0]?.nombre;
            return (
              <motion.div variants={itemVariants} key={i}
                className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group cursor-default">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-[10px] font-bold text-zinc-500 w-4 shrink-0">{i + 4}</span>
                  {equipoId && <div className="relative w-8 h-8 shrink-0"><Image src={`/escudos/${equipoId}.png`} alt="" fill className="object-contain drop-shadow-md" /></div>}
                  <div className="min-w-0">
                    <p className="font-outfit font-bold text-sm uppercase truncate text-zinc-300 group-hover:text-white transition-colors">{g.nombre}</p>
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest truncate mt-0.5">{equipoNombre}</p>
                  </div>
                </div>
                <span className="text-orange-400 font-outfit font-black text-xl ml-3 shrink-0 drop-shadow-[0_0_8px_rgba(251, 146, 60,0.2)]">{g.goles}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
