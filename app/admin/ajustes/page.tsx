'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ConfiguracionTorneo } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function AjustesTorneo() {
  const [config, setConfig] = useState<ConfiguracionTorneo>({
    id: 1,
    nombre_edicion: 'Copa Fácil',
    puntos_victoria: 3,
    equipos_playoffs: 4
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // Formulario de cierre manual
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [campeon, setCampeon] = useState('');
  const [subcampeon, setSubcampeon] = useState('');
  const [goleador, setGoleador] = useState('');
  const [golesGoleador, setGolesGoleador] = useState<number | ''>('');
  const [mvp, setMvp] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    const { data: conf } = await supabase.from('configuracion_torneo').select('*').single();
    if (conf) setConfig(conf);

    const { data: eq } = await supabase.from('equipos').select('*');
    const { data: jug } = await supabase.from('jugadores').select('*').order('goles', { ascending: false }).limit(1);
    const { data: final } = await supabase.from('partidos')
      .select('*, equipo_local:equipos!equipo_local(nombre), equipo_visita:equipos!equipo_visita(nombre), mvp:jugadores!id_mvp(nombre)')
      .eq('llave', 'oro')
      .single();

    if (jug && jug.length > 0) {
      setGoleador(jug[0].nombre);
      setGolesGoleador(jug[0].goles);
    }

    if (final && final.estado === 'jugado') {
      const gL = final.goles_local || 0;
      const gV = final.goles_visita || 0;
      const pL = final.penales_local || 0;
      const pV = final.penales_visita || 0;
      const localWin = gL > gV || (gL === gV && pL > pV);
      
      const c = localWin ? final.equipo_local?.nombre : final.equipo_visita?.nombre;
      const sc = localWin ? final.equipo_visita?.nombre : final.equipo_local?.nombre;
      
      if (c) setCampeon(c);
      if (sc) setSubcampeon(sc);
      if (final.mvp) setMvp(final.mvp.nombre);
    } else if (eq && eq.length > 0) {
      const ordenados = [...eq].sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        if (b.df !== a.df) return b.df - a.df;
        return b.gf - a.gf;
      });
      setCampeon(ordenados[0].nombre);
      if (ordenados[1]) setSubcampeon(ordenados[1].nombre);
    }

    setCargando(false);
  };

  const guardarConfiguracion = async () => {
    setGuardando(true);
    const { error } = await supabase.from('configuracion_torneo').upsert(config);
    setGuardando(false);
    if (error) alert('Error guardando configuración: ' + error.message);
  };

  const generarPlayoffs = async () => {
    if (!confirm('¿Seguro que deseas generar los playoffs usando el Top 4 actual de la tabla? Esto sobrescribirá semifinales pendientes.')) return;
    
    const { data: equipos, error: errEq } = await supabase
      .from('equipos')
      .select('*')
      .order('puntos', { ascending: false })
      .order('df', { ascending: false })
      .order('gf', { ascending: false })
      .limit(4);

    if (errEq || !equipos || equipos.length < 4) {
      return alert('No hay suficientes equipos (se necesitan 4) para generar playoffs.');
    }

    await supabase.from('partidos').delete().in('llave', ['semi_1', 'semi_2']).eq('estado', 'programado');

    const nuevosPartidos = [
      {
        fase: 'playoffs',
        llave: 'semi_1',
        equipo_local: equipos[0].id,
        equipo_visita: equipos[3].id,
        estado: 'programado',
        jornada: 99
      },
      {
        fase: 'playoffs',
        llave: 'semi_2',
        equipo_local: equipos[1].id,
        equipo_visita: equipos[2].id,
        estado: 'programado',
        jornada: 99
      }
    ];

    const { error } = await supabase.from('partidos').insert(nuevosPartidos);
    if (error) {
      alert('Error al generar playoffs: ' + error.message);
    } else {
      alert('Playoffs generados correctamente! 1º vs 4º y 2º vs 3º');
    }
  };

  const cerrarCampeonato = async () => {
    if (!campeon || !subcampeon) {
      return alert('Debes especificar al campeón y subcampeón.');
    }

    setGuardando(true);
    
    const { error } = await supabase.rpc('cerrar_campeonato', {
      p_edicion: config.nombre_edicion,
      p_campeon: campeon,
      p_subcampeon: subcampeon,
      p_goleador: goleador || null,
      p_goles_goleador: typeof golesGoleador === 'number' ? golesGoleador : 0,
      p_mvp: mvp || null
    });

    setGuardando(false);
    setShowCloseModal(false);

    if (error) {
      alert('Hubo un error al cerrar el campeonato: ' + error.message);
    } else {
      window.location.reload();
    }
  };

  const inputBase = 'w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-orange-500/50 focus:bg-black/60 px-5 py-4 rounded-xl outline-none transition-all font-geist text-sm text-white shadow-inner';
  const labelBase = 'font-bold text-[10px] tracking-widest text-zinc-400 uppercase block mb-2 ml-1';

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 font-sans pb-20 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <header className="mb-12 pt-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
            Panel de Administración
          </span>
          <h1 className="font-outfit text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
            Ajustes Globales
          </h1>
        </motion.div>
      </header>

      <div className="space-y-6">
        
        {/* 1. CONFIGURACIÓN DEL TORNEO */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bento-card p-8">
          <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
            <h2 className="font-outfit text-xl font-black uppercase text-white tracking-wide">
              Datos de la Edición
            </h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className={labelBase}>Nombre de la Edición Actual</label>
              <input 
                type="text" 
                value={config.nombre_edicion} 
                onChange={e => setConfig({...config, nombre_edicion: e.target.value})}
                className={inputBase}
                placeholder="Ej. Copa Verano 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={labelBase}>Puntos por Victoria</label>
                <input 
                  type="number" 
                  value={config.puntos_victoria} 
                  onChange={e => setConfig({...config, puntos_victoria: parseInt(e.target.value) || 0})}
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelBase}>Equipos en Playoffs</label>
                <input 
                  type="number" 
                  value={config.equipos_playoffs} 
                  onChange={e => setConfig({...config, equipos_playoffs: parseInt(e.target.value) || 0})}
                  className={`${inputBase} opacity-50 cursor-not-allowed`}
                  disabled
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                onClick={guardarConfiguracion}
                disabled={guardando}
                className="bg-white text-black font-bold uppercase text-[10px] tracking-widest px-8 py-3.5 rounded-full hover:bg-zinc-200 transition-colors shadow-lg hover:shadow-white/20 active:scale-95"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </motion.section>

        {/* 2. GENERADOR DE PLAYOFFS */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bento-card p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_#eab308]" />
            <h2 className="font-outfit text-xl font-black uppercase text-white tracking-wide">
              Automatización de Playoffs
            </h2>
          </div>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-2xl font-geist">
            Genera automáticamente los cruces de Semifinales (1º vs 4º y 2º vs 3º) en base al Top 4 actual de la tabla de posiciones de la Fase Regular.
          </p>
          <button 
            onClick={generarPlayoffs}
            className="w-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-bold uppercase text-[10px] tracking-widest px-6 py-4 rounded-xl hover:bg-yellow-500 hover:text-black transition-all active:scale-[0.98]"
          >
            Generar Llaves Automáticamente
          </button>
        </motion.section>

        {/* 3. PELIGRO: CERRAR CAMPEONATO */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bento-card p-8 border-red-900/30 bg-red-950/10">
          <div className="flex items-center gap-3 mb-6 border-b border-red-900/30 pb-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
            <h2 className="font-outfit text-xl font-black uppercase text-red-500 tracking-wide">
              Zona Crítica
            </h2>
          </div>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-2xl font-geist">
            Finaliza el campeonato actual. El sistema guardará a los ganadores en el Historial y eliminará la fase regular y los playoffs para dar comienzo a una nueva temporada desde cero.
          </p>
          
          <button 
            onClick={() => setShowCloseModal(true)}
            className="w-full bg-red-500/10 border border-red-500/30 text-red-500 font-bold uppercase text-[10px] tracking-widest px-6 py-4 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]"
          >
            Finalizar Edición
          </button>
        </motion.section>

      </div>

      {/* MODAL CERRAR CAMPEONATO */}
      <AnimatePresence>
        {showCloseModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900/90 border border-white/10 shadow-2xl shadow-black rounded-3xl p-8 max-w-md w-full backdrop-blur-xl"
            >
              <h3 className="font-outfit text-2xl font-black uppercase tracking-wide text-white mb-2">
                Registro del Palmarés
              </h3>
              <p className="text-xs text-zinc-400 mb-8 font-geist leading-relaxed">
                Revisa y confirma los premios de temporada. Una vez confirmado, los datos regulares serán reiniciados irremediablemente.
              </p>

              <div className="space-y-5 mb-10">
                <div>
                  <label className={labelBase}>Campeón</label>
                  <input type="text" className={`${inputBase} border-yellow-500/30 focus:border-yellow-500`} value={campeon} onChange={e => setCampeon(e.target.value)} />
                </div>
                <div>
                  <label className={labelBase}>Subcampeón</label>
                  <input type="text" className={inputBase} value={subcampeon} onChange={e => setSubcampeon(e.target.value)} />
                </div>
                <div className="grid grid-cols-[1fr_100px] gap-4">
                  <div>
                    <label className={labelBase}>Bota de Oro</label>
                    <input type="text" className={inputBase} value={goleador} onChange={e => setGoleador(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelBase}>Goles</label>
                    <input type="number" className={`${inputBase} text-center font-bold text-orange-400`} value={golesGoleador} onChange={e => setGolesGoleador(parseInt(e.target.value) || '')} />
                  </div>
                </div>
                <div>
                  <label className={labelBase}>MVP del Torneo (Opcional)</label>
                  <input type="text" className={inputBase} value={mvp} onChange={e => setMvp(e.target.value)} />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowCloseModal(false)}
                  className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl"
                >
                  Cancelar
                </button>
                <button 
                  onClick={cerrarCampeonato}
                  disabled={guardando}
                  className="flex-1 bg-red-600 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 active:scale-95"
                >
                  {guardando ? 'Procesando...' : 'Confirmar Fin'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
