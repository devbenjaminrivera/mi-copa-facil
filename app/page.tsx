import { supabase } from '@/lib/supabase';
import { DashboardData, Equipo, Partido, Jugador } from '@/lib/types';
import Image from 'next/image';
import { LeaderboardCard } from '@/components/home/LeaderboardCard';
import { StandingsTable } from '@/components/home/StandingsTable';
import { MatchesTabs } from '@/components/home/MatchesTabs';
import { TopScorers } from '@/components/home/TopScorers';
import { BracketPlayoffs } from '@/components/home/BracketPlayoffs';

export const revalidate = 60;

export default async function Home() {
  const ahora = new Date().toISOString();

  // Fetching de datos en el servidor
  const [resEq, resPart, resProx, resGol, resPlayoffs, resConfig] = await Promise.all([
    supabase.from('equipos').select('*').order('puntos', { ascending: false }).order('df', { ascending: false }).order('gf', { ascending: false }),
    supabase.from('partidos').select(`id, goles_local, goles_visita, fecha, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre), sanciones(tipo, id_equipo)`)
      .eq('estado', 'jugado').eq('fase', 'regular').order('created_at', { ascending: false }).limit(6),
    supabase.from('partidos').select(`id, fecha, jornada, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre)`)
      .eq('estado', 'programado').eq('fase', 'regular').gt('fecha', ahora).order('jornada', { ascending: true }).order('fecha', { ascending: true }),
    supabase.from('jugadores').select(`nombre, goles, equipos:id_equipo(id, nombre)`).gt('goles', 0).order('goles', { ascending: false }).limit(5),
    supabase.from('partidos').select(`id, estado, fase, llave, goles_local, goles_visita, penales_local, penales_visita, fecha, equipo_local:equipos!equipo_local(id, nombre), equipo_visita:equipos!equipo_visita(id, nombre)`)
      .neq('fase', 'regular'),
    supabase.from('configuracion_torneo').select('nombre_edicion').single()
  ]);

  const data: DashboardData & { configuracion: { nombre_edicion: string } } = {
    equipos: (resEq.data as unknown as Equipo[]) || [],
    partidos: (resPart.data as unknown as Partido[]) || [],
    proximos: (resProx.data as unknown as Partido[]) || [],
    goleadores: (resGol.data as unknown as Jugador[]) || [],
    playoffs: (resPlayoffs.data as unknown as Partido[]) || [],
    configuracion: (resConfig.data as { nombre_edicion: string }) || { nombre_edicion: 'Copa CEVI' }
  };

  const isPlayoffsMode = data.playoffs.length > 0;
  const lider = data.equipos[0];
  const nombreEdicion = data.configuracion.nombre_edicion;

  return (
    <main className="min-h-screen px-4 md:px-8 max-w-7xl mx-auto pb-20">

      {/* HEADER / MASTHEAD BENTO TILE */}
      <div className="mb-6 rounded-[2rem] overflow-hidden bento-card relative h-48 md:h-64 flex flex-col justify-end p-8 md:p-12 group">
        <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 via-transparent to-blue-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative z-10 flex items-end justify-between w-full">
          <div>
            <p className="text-orange-500 text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-2">{nombreEdicion}</p>
            <h1 className="font-outfit text-5xl md:text-7xl font-black uppercase tracking-tight text-white drop-shadow-lg">
              COPA <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">CEVI</span>
            </h1>
          </div>

          <div className="hidden md:block relative w-40 h-40 md:w-56 md:h-56 group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_32px_rgba(249,115,22,0.4)] translate-y-6">
            <Image src="/logo.png" alt="Logo Copa CEVI" fill className="object-contain" priority />
          </div>
        </div>

        {/* Marca de agua gráfica */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-orange-500/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr">

        {/* LÍDER (Span 8) */}
        {!isPlayoffsMode && (
          <div className="md:col-span-8 h-full">
            <LeaderboardCard lider={lider} isPlayoffsMode={isPlayoffsMode} />
          </div>
        )}

        {/* PRÓXIMOS PARTIDOS / RESULTADOS (Span 4) */}
        <div className="md:col-span-4 bento-card p-6 h-full flex flex-col">
          <MatchesTabs partidos={data.partidos} proximos={data.proximos} />
        </div>

        {/* TABLA DE POSICIONES (Span 8) */}
        <div className="md:col-span-8 bento-card p-6 min-h-[500px]">
          <StandingsTable equipos={data.equipos} />
        </div>

        {/* GOLEADORES (Span 4) */}
        <div className="md:col-span-4 bento-card p-6 min-h-[500px]">
          <TopScorers goleadores={data.goleadores} isPlayoffsMode={isPlayoffsMode} />
        </div>

        {/* PLAYOFFS IF ANY */}
        {isPlayoffsMode && (
          <div className="md:col-span-12 bento-card p-6">
            <BracketPlayoffs partidos={data.playoffs} />
          </div>
        )}

      </div>
    </main>
  );
}