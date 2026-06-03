'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GestionarEquipos() {
  const [nombre, setNombre] = useState('');
  const [equipos, setEquipos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const fetchEquipos = async () => {
    const { data } = await supabase.from('equipos').select('*').order('nombre');
    if (data) setEquipos(data);
  };

  useEffect(() => { fetchEquipos(); }, []);

  const crearEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setCargando(true);
    const { error } = await supabase.from('equipos').insert([{ nombre: nombre.trim(), puntos: 0, pj: 0 }]);
    if (error) alert('Error: ' + error.message);
    else { setNombre(''); fetchEquipos(); }
    setCargando(false);
  };

  const borrarEquipo = async (id: number) => {
    const { error } = await supabase.from('equipos').delete().eq('id', id);
    if (!error) { setConfirmId(null); fetchEquipos(); }
  };

  const editarNombreEquipo = async (id: number, nuevoNombre: string) => {
    if (!nuevoNombre.trim()) return;
    await supabase.from('equipos').update({ nombre: nuevoNombre.trim() }).eq('id', id);
    setEditandoId(null);
    fetchEquipos();
  };

  return (
    <div className="p-4 md:p-10 text-white font-sans">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <header className="mb-10 pt-6">
          <p className="text-green-500 font-mono text-[10px] uppercase tracking-[0.3em] mb-3">
            Admin / Equipos
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
            Gestionar Equipos
          </h1>
        </header>

        {/* FORMULARIO NUEVO EQUIPO */}
        <section className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-3">
            Añadir equipo
          </p>
          <form onSubmit={crearEquipo} className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre del equipo..."
              className="flex-1 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 focus:border-green-500 p-4 rounded-2xl outline-none transition-all text-sm font-bold placeholder:text-zinc-700 placeholder:font-normal uppercase tracking-tight"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
            <button
              type="submit"
              disabled={cargando || !nombre.trim()}
              className="shrink-0 bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 disabled:text-zinc-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            >
              {cargando ? (
                <div className="w-4 h-4 border border-green-400/30 border-t-green-400 rounded-full animate-spin" />
              ) : 'Añadir'}
            </button>
          </form>
        </section>

        {/* SEPARADOR */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 shrink-0">
            {equipos.length} equipo{equipos.length !== 1 ? 's' : ''} registrado{equipos.length !== 1 ? 's' : ''}
          </span>
          <div className="h-px flex-1 bg-zinc-800/60" />
        </div>

        {/* LISTA */}
        <div className="space-y-2">
          {equipos.map((eq) => {
            const isConfirming = confirmId === eq.id;
            const isEditing = editandoId === eq.id;

            return (
              <div
                key={eq.id}
                className={`group relative border rounded-2xl transition-all duration-200 overflow-hidden
                  ${isConfirming
                    ? 'border-red-500/40 bg-zinc-900/70'
                    : 'border-zinc-800/60 bg-zinc-900/20 hover:border-zinc-700 hover:bg-zinc-900/40'
                  }
                `}
              >
                <div className="flex items-center gap-4 p-4">

                  {/* ID BADGE */}
                  <span className="shrink-0 text-[9px] font-black font-mono text-zinc-700 w-5 text-center">
                    {eq.id}
                  </span>

                  {/* NOMBRE — inline edit */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        autoFocus
                        defaultValue={eq.nombre}
                        onBlur={(e) => editarNombreEquipo(eq.id, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                          if (e.key === 'Escape') setEditandoId(null);
                        }}
                        className="w-full bg-transparent border-b border-green-500 outline-none text-sm font-black uppercase tracking-tight pb-0.5 text-white"
                      />
                    ) : (
                      <button
                        onClick={() => setEditandoId(eq.id)}
                        className="text-left w-full"
                        title="Clic para editar nombre"
                      >
                        <p className="text-sm font-black uppercase tracking-tight text-zinc-200 group-hover:text-white transition-colors truncate">
                          {eq.nombre}
                        </p>
                      </button>
                    )}
                    <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-wider mt-0.5">
                      {eq.puntos} pts · {eq.pj} PJ · {eq.pg}G {eq.pe}E {eq.pp}P
                    </p>
                  </div>

                  {/* ACCIONES */}
                  {!isConfirming ? (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => setEditandoId(eq.id)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
                        title="Editar nombre"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmId(eq.id)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Eliminar equipo"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors px-2 py-1"
                      >
                        No
                      </button>
                      <button
                        onClick={() => borrarEquipo(eq.id)}
                        className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>

                {/* AVISO CONFIRMACIÓN */}
                {isConfirming && (
                  <div className="px-4 pb-3">
                    <p className="text-[9px] text-red-400/60 font-mono uppercase tracking-wider">
                      ⚠ Esto podría afectar a los jugadores asociados
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {equipos.length === 0 && (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-zinc-700 text-xs font-black uppercase tracking-[0.3em]">
                No hay equipos registrados
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}