import { supabase } from '@/lib/supabase';
import { HistorialCampeonato } from '@/lib/types';
import { motion } from 'framer-motion';

export const revalidate = 60;

export default async function HistorialPage() {
  const { data } = await supabase
    .from('historial_campeonatos')
    .select('*')
    .order('fecha_cierre', { ascending: false });

  const historial = (data as HistorialCampeonato[]) || [];

  return (
    <main className="min-h-screen px-4 md:px-8 max-w-7xl mx-auto pb-24">
      {/* ── HEADER BENTO TILE ─────────────────────────────────────── */}
      <div className="mb-8 rounded-[2rem] overflow-hidden bento-card relative h-40 md:h-56 flex flex-col justify-end p-8 md:p-10 group mt-4">
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-600/10 via-transparent to-orange-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-yellow-500 text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-2">
              Salón de la Fama
            </p>
            <h1 className="font-outfit text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-lg">
              PALMARÉS
            </h1>
          </div>
          
          <div className="flex gap-4 md:gap-6 pb-1">
            <div className="bg-black/30 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/5 text-center shadow-inner">
              <p className="font-outfit text-3xl md:text-4xl font-black text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)] leading-none">{historial.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Ediciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── LISTA DE CAMPEONATOS ────────────────────────── */}
      <div className="w-full space-y-6">
        {historial.length === 0 ? (
          <div className="text-center py-32 bento-card border-dashed border-white/10">
            <p className="font-outfit text-3xl font-black text-zinc-600 uppercase tracking-wide">
              No hay campeones aún
            </p>
            <p className="text-sm font-bold text-zinc-500 mt-2 uppercase tracking-widest">
              El historial se actualizará al finalizar la primera edición.
            </p>
          </div>
        ) : (
          historial.map((torneo) => (
            <div key={torneo.id} className="bento-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group hover:bg-white/5 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* Info Edición */}
              <div className="flex flex-col items-center md:items-start shrink-0 relative z-10 w-full md:w-48">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Edición</span>
                <h2 className="font-outfit text-2xl font-black uppercase text-white tracking-wide text-center md:text-left">{torneo.edicion}</h2>
                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mt-2">
                  {new Date(torneo.fecha_cierre).toLocaleDateString('es-CL', { year: 'numeric', month: 'long' })}
                </span>
              </div>

              {/* Divisor */}
              <div className="hidden md:block w-px h-16 bg-white/10" />

              {/* Premios */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full relative z-10">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-600">🏆 Campeón</span>
                  <span className="font-outfit text-xl font-black text-yellow-400 uppercase drop-shadow-md">{torneo.campeon_nombre}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">🥈 Subcampeón</span>
                  <span className="font-outfit text-base font-bold text-zinc-300 uppercase">{torneo.subcampeon_nombre || '-'}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-orange-500">⚽ Bota de Oro</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-outfit text-base font-bold text-zinc-200 uppercase truncate" title={torneo.goleador_nombre || ''}>{torneo.goleador_nombre || '-'}</span>
                    {torneo.goles_goleador && <span className="text-[10px] font-black text-orange-400">{torneo.goles_goleador} G</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-blue-500">🌟 MVP</span>
                  <span className="font-outfit text-base font-bold text-zinc-200 uppercase truncate">{torneo.mvp_nombre || '-'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
