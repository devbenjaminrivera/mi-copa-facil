import { supabase } from '@/lib/supabase';
import { Partido } from '@/lib/types';
import { ResultadosList } from './ResultadosList';

export const revalidate = 60; // Revalida cada 60 segundos

export default async function ResultadosCompletos() {
  const { data } = await supabase
    .from('partidos')
    .select(`
      id, goles_local, goles_visita, jornada, fecha,
      mvp:jugadores!id_mvp(nombre),
      equipo_local:equipos!equipo_local(id, nombre),
      equipo_visita:equipos!equipo_visita(id, nombre),
      sanciones(tipo, id_equipo, jugador:jugadores(nombre)),
      goles(id_equipo, jugador:jugadores(nombre))
    `)
    .eq('estado', 'jugado')
    .order('jornada', { ascending: false })
    .order('fecha', { ascending: false });

  const partidos = (data as unknown as Partido[]) || [];

  // AGRUPAR POR JORNADAS para calcular número de jornadas
  const jornadas = partidos.reduce((acc: any, p: Partido) => {
    const j = String(p.jornada || 1);
    if (!acc[j]) acc[j] = [];
    acc[j].push(p);
    return acc;
  }, {});

  const jornadasOrdenadas = Object.keys(jornadas).sort((a, b) => Number(b) - Number(a));
  const totalGoles = partidos.reduce((a, p) => a + (p.goles_local || 0) + (p.goles_visita || 0), 0);

  return (
    <main className="min-h-screen px-4 md:px-8 max-w-7xl mx-auto pb-24">
      {/* ── HEADER BENTO TILE ─────────────────────────────────────── */}
      <div className="mb-8 rounded-[2rem] overflow-hidden bento-card relative h-40 md:h-56 flex flex-col justify-end p-8 md:p-10 group mt-4">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 via-transparent to-blue-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-orange-500 text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-2">
              Copa CEVI · Actas oficiales
            </p>
            <h1 className="font-outfit text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-lg">
              RESULTADOS
            </h1>
          </div>
          
          {/* STATS RÁPIDAS */}
          <div className="flex gap-4 md:gap-6 pb-1 flex-wrap">
            <div className="bg-black/30 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/5 text-center shadow-inner">
              <p className="font-outfit text-3xl md:text-4xl font-black text-orange-400 drop-shadow-[0_0_8px_rgba(251, 146, 60,0.4)] leading-none">{partidos.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Partidos</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/5 text-center shadow-inner">
              <p className="font-outfit text-3xl md:text-4xl font-black text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] leading-none">{totalGoles}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Goles</p>
            </div>
            <div className="bg-black/30 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/5 text-center shadow-inner">
              <p className="font-outfit text-3xl md:text-4xl font-black text-zinc-400 drop-shadow-[0_0_8px_rgba(161,161,170,0.4)] leading-none">{jornadasOrdenadas.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Jornadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO (TODAS LAS JORNADAS) ────────────────────────── */}
      <ResultadosList partidos={partidos} />
    </main>
  );
}