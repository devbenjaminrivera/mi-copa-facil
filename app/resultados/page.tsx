'use client';

import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ResultadosCompletos() {
  const [partidos, setPartidos] = useState<any[]>([]);

  useEffect(() => {
    const fetchPartidos = async () => {
      const { data } = await supabase
        .from('partidos')
        .select(`
          id, 
          goles_local, 
          goles_visita, 
          jornada,
          fecha,
          mvp:jugadores!id_mvp(nombre),
          equipo_local:equipos!equipo_local(id, nombre), 
          equipo_visita:equipos!equipo_visita(id, nombre),
          sanciones(tipo, id_equipo, jugador:jugadores(nombre))
        `)
        .eq('estado', 'jugado')
        .order('jornada', { ascending: false })
        .order('fecha', { ascending: false });

      if (data) setPartidos(data);
    };
    fetchPartidos();
  }, []);

 // EFECTO DE NAVEGACIÓN Y BRILLO
  useEffect(() => {
    if (partidos.length > 0 && window.location.hash) {
      const hash = window.location.hash; // Ej: "#partido-110"
      const idBuscado = hash.replace('#partido-', ''); // Nos quedamos solo con "110"
      
      // 1. Le decimos a React que este partido debe brillar
      setPartidoDestacado(idBuscado);

      // 2. Intentamos hacer el scroll
      let intentos = 0;
      const buscador = setInterval(() => {
        const elemento = document.querySelector(hash);
        if (elemento) {
          clearInterval(buscador);
          // Hará scroll solo si hay espacio suficiente en la página
          elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // 3. A los 2 segundos, apagamos el brillo
          setTimeout(() => {
            setPartidoDestacado(null);
          }, 2000);
        }
        
        intentos++;
        if (intentos >= 10) clearInterval(buscador);
      }, 100);

      return () => clearInterval(buscador);
    }
  }, [partidos]);
  const [partidoDestacado, setPartidoDestacado] = useState<string | null>(null);

  const jornadas = partidos.reduce((acc: any, partido: any) => {
    const j = partido.jornada || 1;
    if (!acc[j]) acc[j] = [];
    acc[j].push(partido);
    return acc;
  }, {});

  return (
    <main className="p-4 md:p-8 bg-black text-white min-h-screen pt-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-8 md:mb-12 text-green-500 text-center md:text-left">
          Historial de Resultados
        </h1>

        <div className="space-y-12 md:space-y-20">
          {Object.keys(jornadas).sort((a, b) => Number(b) - Number(a)).map((num) => (
            <section key={num} className="relative">
              <div className="sticky top-16 md:top-20 z-10 bg-black/90 backdrop-blur-md py-3 mb-6 border-b border-zinc-800">
                <h2 className="text-lg md:text-xl font-black uppercase text-zinc-500 tracking-widest italic">
                  Jornada {num}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {jornadas[num].map((p: any) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    key={p.id}
                    id={`partido-${p.id}`}
                    className={`scroll-mt-28 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] group transition-all shadow-xl border
                      ${String(partidoDestacado) === String(p.id) 
                        ? 'bg-zinc-800/90 border-green-500 ring-4 ring-green-500/30 scale-[1.02]' 
                        : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-600'
                      }
                    `}
                  >
                    {/* 1. GRID PRINCIPAL (Solo Equipos y Marcador) */}
                    <div className="grid grid-cols-3 items-center gap-2 md:gap-8">
                      
                      {/* Equipo Local */}
                      <div className="flex flex-col md:flex-row items-center justify-end gap-2 md:gap-4 text-center md:text-right">
                        <span className="order-2 md:order-1 font-black uppercase text-[10px] md:text-base leading-tight">
                          {p.equipo_local?.nombre}
                        </span>
                        <div className="order-1 md:order-2 relative w-10 h-10 md:w-16 md:h-16 shrink-0">
                          <Image src={`/escudos/${p.equipo_local?.id}.png`} alt="" fill className="object-contain" />
                        </div>
                      </div>

                      {/* Marcador Central */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 md:gap-4 bg-white/5 px-4 py-2 md:px-8 md:py-3 rounded-2xl border border-white/5 group-hover:border-green-500/30 transition-all">
                          <span className="text-2xl md:text-5xl font-black font-mono tracking-tighter">
                            {p.goles_local}
                          </span>
                          <span className="text-zinc-700 font-black italic text-[10px] md:text-base">VS</span>
                          <span className="text-2xl md:text-5xl font-black font-mono tracking-tighter">
                            {p.goles_visita}
                          </span>
                        </div>
                      </div>

                      {/* Equipo Visita */}
                      <div className="flex flex-col md:flex-row items-center justify-start gap-2 md:gap-4 text-center md:text-left">
                        <div className="relative w-10 h-10 md:w-16 md:h-16 shrink-0">
                          <Image src={`/escudos/${p.equipo_visita?.id}.png`} alt="" fill className="object-contain" />
                        </div>
                        <span className="font-black uppercase text-[10px] md:text-base leading-tight">
                          {p.equipo_visita?.nombre}
                        </span>
                      </div>
                    </div>
                    {/* FIN GRID PRINCIPAL */}

                    {/* 2. NUEVO GRID: SANCIONES (Totalmente independiente) */}
                    {/* DESACTIVADO TEMPORALMENTE: SANCIONES */}
                    
                    {p.sanciones && p.sanciones.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 md:gap-8 mt-6 pt-4 border-t border-zinc-800/50">
                        
                        {/* Sanciones Equipo Local (Alineado a la derecha) */}
                        <div className="flex flex-col items-end gap-1.5">
                          {p.sanciones
                            .filter((s: any) => String(s.id_equipo) === String(p.equipo_local?.id)) /* <-- FIX AQUÍ */
                            .map((s: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                                {s.jugador?.nombre || 'Jugador'}
                              </span>
                              <div className={`w-[8px] h-[12px] md:w-[10px] md:h-[14px] rounded-[2px] ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'} border-[0.5px] border-black/20 shadow-[0_1px_2px_rgba(0,0,0,0.5)] rotate-[5deg]`} title={s.tipo} />
                            </div>
                          ))}
                        </div>

                        {/* Espacio Central */}
                        <div className="flex justify-center items-start pt-1">
                           <span className="text-[8px] font-black tracking-[0.3em] text-zinc-700 uppercase">Tarjetas</span>
                        </div>

                        {/* Sanciones Equipo Visita (Alineado a la izquierda) */}
                        <div className="flex flex-col items-start gap-1.5">
                          {p.sanciones
                            .filter((s: any) => String(s.id_equipo) === String(p.equipo_visita?.id)) /* <-- FIX AQUÍ */
                            .map((s: any, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className={`w-[8px] h-[12px] md:w-[10px] md:h-[14px] rounded-[2px] ${s.tipo === 'amarilla' ? 'bg-yellow-400' : 'bg-red-600'} border-[0.5px] border-black/20 shadow-[0_1px_2px_rgba(0,0,0,0.5)] rotate-[-5deg]`} title={s.tipo} />
                              <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                                {s.jugador?.nombre || 'Jugador'}
                              </span>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}
              
                    {/* FIN SANCIONES */}

                    {/* 3. FOOTER DEL PARTIDO (MVP y Fecha) */}
                    <div className="mt-6 pt-5 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-3 bg-yellow-500/5 px-4 py-1.5 rounded-full border border-yellow-500/10">
                        <span className="text-[8px] md:text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em]">MVP:</span>
                        <span className="text-[10px] md:text-xs font-black text-yellow-500 uppercase italic">
                          🌟 {p.mvp?.nombre || 'Pendiente'}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center md:items-end">
                         <span className="text-[9px] md:text-[10px] font-mono text-zinc-600 font-black uppercase tracking-tighter">
                          {new Date(p.fecha).toLocaleString('es-CL', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
      

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
    </main>
  );
}