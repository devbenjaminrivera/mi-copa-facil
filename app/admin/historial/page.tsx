'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function HistorialPartidos() {
  const [partidos, setPartidos] = useState<any[]>([]);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const fetchPartidos = async () => {
    const { data } = await supabase
      .from('partidos')
      .select(`
        id, goles_local, goles_visita, created_at, jornada,
        equipo_local:equipos!equipo_local(id, nombre),
        equipo_visita:equipos!equipo_visita(id, nombre)
      `)
      .order('created_at', { ascending: false });
    if (data) setPartidos(data);
  };

  useEffect(() => { fetchPartidos(); }, []);

  const eliminarPartido = async (partido: any) => {
    setEliminando(partido.id);
    setConfirmId(null);

    let puntosL = 0; let puntosV = 0;
    if (partido.goles_local > partido.goles_visita) puntosL = 3;
    else if (partido.goles_visita > partido.goles_local) puntosV = 3;
    else { puntosL = 1; puntosV = 1; }

    await ajustarStatsEquipo(partido.equipo_local.id, -puntosL);
    await ajustarStatsEquipo(partido.equipo_visita.id, -puntosV);

    const { error } = await supabase.from('partidos').delete().eq('id', partido.id);

    if (error) alert('Error al eliminar');
    else fetchPartidos();

    setEliminando(null);
  };

  const ajustarStatsEquipo = async (id: number, puntos: number) => {
    const { data } = await supabase.from('equipos').select('puntos, pj').eq('id', id).single();
    if (data) {
      await supabase.from('equipos').update({
        puntos: data.puntos + puntos,
        pj: data.pj - 1
      }).eq('id', id);
    }
  };

  // Agrupar por jornada
  const porJornada = partidos.reduce((acc: any, p: any) => {
    const j = p.jornada || '—';
    if (!acc[j]) acc[j] = [];
    acc[j].push(p);
    return acc;
  }, {});

  const getResultado = (p: any) => {
    if (p.goles_local > p.goles_visita) return 'local';
    if (p.goles_visita > p.goles_local) return 'visita';
    return 'empate';
  };

  return (
    <div className="p-4 md:p-10 bg-black min-h-screen text-white font-sans pt-8">
      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-12 border-b border-zinc-800 pb-8">
          <div>
            <p className="text-green-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-1">
              Admin / Historial
            </p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">
              Historial de Partidos
            </h1>
          </div>
          <Link
            href="/admin"
            className="hidden md:flex items-center gap-2 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            ← Panel
          </Link>
        </div>

        {/* CONTADOR */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-zinc-600 text-xs font-mono uppercase tracking-widest">
            {partidos.length} registros en total
          </span>
          <div className="h-px flex-1 bg-zinc-900" />
        </div>

        {/* PARTIDOS POR JORNADA */}
        <div className="space-y-10">
          {Object.keys(porJornada)
            .sort((a, b) => Number(b) - Number(a))
            .map((jornada) => (
              <section key={jornada}>

                {/* SEPARADOR DE JORNADA */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 italic shrink-0">
                    Jornada {jornada}
                  </span>
                  <div className="h-px flex-1 bg-zinc-800/60" />
                  <span className="text-[9px] font-mono text-zinc-700 shrink-0">
                    {porJornada[jornada].length} partido{porJornada[jornada].length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2">
                  {porJornada[jornada].map((p: any) => {
                    const res = getResultado(p);
                    const isConfirming = confirmId === p.id;
                    const isDeleting = eliminando === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`group relative bg-zinc-900/30 border rounded-2xl transition-all duration-200 overflow-hidden
                          ${isConfirming
                            ? 'border-red-500/50 bg-zinc-900/70'
                            : 'border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/50'
                          }
                        `}
                      >
                        {/* FILA PRINCIPAL */}
                        <div className="flex items-center gap-3 p-4">

                          {/* FECHA */}
                          <div className="shrink-0 w-16 text-center">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-wider font-mono">
                              {new Date(p.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                            </p>
                          </div>

                          {/* EQUIPO LOCAL */}
                          <div className="flex-1 min-w-0 text-right">
                            <span className={`text-xs md:text-sm font-black uppercase tracking-tight truncate block
                              ${res === 'local' ? 'text-white' : 'text-zinc-500'}
                            `}>
                              {p.equipo_local?.nombre}
                            </span>
                          </div>

                          {/* MARCADOR */}
                          <div className="shrink-0 flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 min-w-[72px] justify-center">
                            <span className={`text-base md:text-lg font-black font-mono tabular-nums
                              ${res === 'local' ? 'text-green-400' : 'text-zinc-300'}
                            `}>
                              {p.goles_local}
                            </span>
                            <span className="text-zinc-700 text-xs font-black">–</span>
                            <span className={`text-base md:text-lg font-black font-mono tabular-nums
                              ${res === 'visita' ? 'text-green-400' : 'text-zinc-300'}
                            `}>
                              {p.goles_visita}
                            </span>
                          </div>

                          {/* EQUIPO VISITA */}
                          <div className="flex-1 min-w-0 text-left">
                            <span className={`text-xs md:text-sm font-black uppercase tracking-tight truncate block
                              ${res === 'visita' ? 'text-white' : 'text-zinc-500'}
                            `}>
                              {p.equipo_visita?.nombre}
                            </span>
                          </div>

                          {/* BOTÓN ELIMINAR */}
                          <div className="shrink-0 ml-2">
                            {isDeleting ? (
                              <div className="w-7 h-7 flex items-center justify-center">
                                <div className="w-3.5 h-3.5 border border-zinc-600 border-t-red-500 rounded-full animate-spin" />
                              </div>
                            ) : isConfirming ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setConfirmId(null)}
                                  className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors px-2 py-1"
                                >
                                  No
                                </button>
                                <button
                                  onClick={() => eliminarPartido(p)}
                                  className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  Sí, eliminar
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmId(p.id)}
                                className="w-7 h-7 flex items-center justify-center text-zinc-800 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-500/10"
                                title="Eliminar partido"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* AVISO DE CONFIRMACIÓN */}
                        {isConfirming && (
                          <div className="px-4 pb-3 pt-0">
                            <p className="text-[9px] text-red-400/70 font-mono uppercase tracking-wider">
                              ⚠ Se restarán puntos y estadísticas de ambos equipos
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>

        {/* EMPTY STATE */}
        {partidos.length === 0 && (
          <div className="text-center py-24 border border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-700 text-xs font-black uppercase tracking-[0.3em]">
              No hay partidos registrados
            </p>
          </div>
        )}

        {/* FOOTER MÓVIL */}
        <div className="mt-12 md:hidden">
          <Link
            href="/admin"
            className="block w-full text-center border border-zinc-800 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-900 transition-all"
          >
            ← Volver al panel
          </Link>
        </div>

      </div>
    </div>
  );
}