export interface Equipo {
  id: number;
  nombre: string;
  puntos: number;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  df: number;
  gf: number;
  created_at: string;
}

export interface Partido {
  id: number;
  jornada: number;
  fecha: string | null;
  estado: 'programado' | 'jugado';
  fase: string;
  llave: string | null;
  equipo_local_id: number | null;
  equipo_visita_id: number | null;
  goles_local: number | null;
  goles_visita: number | null;
  penales_local: number | null;
  penales_visita: number | null;
  id_mvp: number | null;
  created_at: string;
  
  // Relaciones
  equipo_local?: Equipo;
  equipo_visita?: Equipo;
  mvp?: Jugador;
  sanciones?: Sancion[];
  goles?: Gol[];
}

export interface Jugador {
  id: number;
  nombre: string;
  goles: number;
  id_equipo: number;
  created_at: string;
  
  // Relaciones
  equipos?: Equipo | Equipo[];
}

export interface Sancion {
  id: number;
  tipo: 'amarilla' | 'roja';
  id_partido: number;
  id_equipo: number;
  id_jugador: number;
  created_at: string;
  
  // Relaciones
  jugador?: Jugador;
}

export interface Gol {
  id: number;
  id_partido: number;
  id_equipo: number;
  id_jugador: number;
  created_at: string;
  
  // Relaciones
  jugador?: Jugador;
}

export interface DashboardData {
  equipos: Equipo[];
  partidos: Partido[];
  proximos: Partido[];
  goleadores: Jugador[];
  playoffs: Partido[];
}

export interface ConfiguracionTorneo {
  id: number;
  nombre_edicion: string;
  puntos_victoria: number;
  equipos_playoffs: number;
}

export interface HistorialCampeonato {
  id: number;
  edicion: string;
  campeon_nombre: string;
  subcampeon_nombre: string | null;
  goleador_nombre: string | null;
  goles_goleador: number | null;
  mvp_nombre: string | null;
  fecha_cierre: string;
}
