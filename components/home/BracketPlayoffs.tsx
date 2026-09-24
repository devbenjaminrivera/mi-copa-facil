'use client';

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Partido } from '@/lib/types';

interface Props {
  partidos: Partido[];
}

export function BracketPlayoffs({ partidos }: Props) {
  if (partidos.length === 0) return null;

  const semi1  = partidos.find(p => p.llave === 'semi_1');
  const semi2  = partidos.find(p => p.llave === 'semi_2');
  const final  = partidos.find(p => p.llave === 'oro');
  const bronce = partidos.find(p => p.llave === 'bronce');

  return (
    <motion.div
      id="bracket"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-14 scroll-mt-20"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1 h-6 bg-yellow-500 rounded-full shrink-0" />
        <h2 className="font-impact tracking-[-0.01em] text-2xl font-black italic uppercase text-white leading-none shrink-0">
          PLAYOFFS
        </h2>
        <div className="flex-1 border-b border-zinc-900" />
        <span className="text-[7px] font-black uppercase tracking-[0.3em] text-yellow-700 shrink-0">Fase final</span>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[680px] px-2 py-4">
          <div className="grid grid-cols-[1fr_64px_1fr] items-center gap-0">
            {/* COLUMNA SEMIFINALES */}
            <div className="flex flex-col gap-6">
              <BracketMatch partido={semi1} titulo="Semifinal 1" placeholderA="1° Fase regular" placeholderB="4° Fase regular" />
              <BracketMatch partido={semi2} titulo="Semifinal 2" placeholderA="2° Fase regular" placeholderB="3° Fase regular" />
            </div>

            {/* CONECTORES SVG */}
            <svg viewBox="0 0 64 200" preserveAspectRatio="none" className="w-full h-full" style={{ minHeight: '200px' }}>
              <path d="M 0 50 H 32 V 100" fill="none" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M 0 150 H 32 V 100" fill="none" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M 32 100 H 64" fill="none" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="32" cy="100" r="3" fill="#3f3f46"/>
            </svg>

            {/* COLUMNA FINALES */}
            <div className="flex flex-col gap-4">
              <BracketMatch partido={final}  titulo="Gran Final"    placeholderA="Ganador S1" placeholderB="Ganador S2" isFinal />
              <BracketMatch partido={bronce} titulo="3° y 4° Lugar" placeholderA="Perdedor S1" placeholderB="Perdedor S2" isBronze />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BracketMatch({ partido, titulo, placeholderA, placeholderB, isFinal = false, isBronze = false }: any) {
  const eqA = partido?.equipo_local  || { nombre: placeholderA, id: null };
  const eqB = partido?.equipo_visita || { nombre: placeholderB, id: null };
  const jugado = partido?.estado === 'jugado';
  const pendiente = !partido || partido?.estado === 'programado';

  const winnerA = jugado && (
    partido.goles_local > partido.goles_visita ||
    (partido.goles_local === partido.goles_visita && (partido.penales_local ?? 0) > (partido.penales_visita ?? 0))
  );
  const winnerB = jugado && !winnerA;

  const accentColor = isFinal ? '#eab308' : isBronze ? '#9a3412' : '#52525b';
  const accentOpacity = isFinal ? '60' : isBronze ? '40' : '30';

  const TeamRow = ({ eq, goles, penales, isWinner, isLoser }: any) => (
    <div className={`relative flex items-center justify-between gap-3 px-3 py-3 transition-all ${jugado && isWinner ? 'bg-white/[0.04]' : ''}`}>
      {jugado && isWinner && (
        <div className="absolute left-0 top-0 bottom-0 w-[2.5px] rounded-r-full" style={{ background: isFinal ? '#eab308' : '#f97316' }} />
      )}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className={`relative shrink-0 transition-all duration-300 ${eq.id ? 'w-8 h-8' : 'w-7 h-7'} ${jugado && isLoser ? 'opacity-25 grayscale' : ''}`}>
          {eq.id ? (
            <Image src={`/escudos/${eq.id}.png`} alt={eq.nombre} fill className="object-contain" />
          ) : (
            <div className="w-full h-full rounded border border-dashed border-zinc-800 flex items-center justify-center">
              <span className="text-[7px] text-zinc-800 font-black">TBD</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-black uppercase tracking-tight truncate transition-colors leading-none ${!eq.id ? 'text-zinc-800' : jugado && isWinner ? 'text-white' : jugado && isLoser ? 'text-zinc-700' : 'text-zinc-400'}`}>
            {eq.nombre}
          </p>
          {jugado && isWinner && (
            <p className="text-[7px] font-black uppercase tracking-widest mt-0.5" style={{ color: isFinal ? '#a16207' : '#166534' }}>
              {isFinal ? 'Campeón' : isBronze ? '3° lugar' : 'Clasificado'}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {jugado && penales != null && <span className="text-[8px] font-black text-zinc-700 font-mono tabular-nums">({penales})</span>}
        <span className={`font-impact text-2xl font-black italic leading-none tabular-nums w-7 text-center ${!jugado ? 'text-zinc-900' : isWinner ? 'text-white' : 'text-zinc-700'}`}>
          {jugado ? (goles ?? 0) : '–'}
        </span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${accentColor}${accentOpacity}`, boxShadow: isFinal ? `0 0 24px rgba(234, 179, 8, 0.07)` : 'none', background: '#0d0d0d' }}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-900/80">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accentColor, opacity: isFinal ? 1 : 0.5 }} />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: isFinal ? '#a16207' : isBronze ? '#7c2d12' : '#52525b' }}>{titulo}</span>
        </div>
        <span className="text-[7px] font-black text-zinc-800 uppercase tracking-wider font-mono">
          {partido?.fecha ? new Date(partido.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : pendiente ? 'Por confirmar' : ''}
        </span>
      </div>
      <div className="divide-y divide-zinc-900/60">
        <TeamRow eq={eqA} goles={partido?.goles_local}  penales={partido?.penales_local}  isWinner={winnerA} isLoser={jugado && !winnerA} />
        <TeamRow eq={eqB} goles={partido?.goles_visita} penales={partido?.penales_visita} isWinner={winnerB} isLoser={jugado && !winnerB} />
      </div>
    </motion.div>
  );
}
