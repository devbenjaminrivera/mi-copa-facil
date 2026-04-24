import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Es fundamental que esto esté fuera para que se evalúe una sola vez
const isBrowser = typeof window !== 'undefined';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Usamos sessionStorage para que se borre al cerrar la pestaña/navegador
    storage: isBrowser ? window.sessionStorage : undefined, 
    autoRefreshToken: true,
    persistSession: true, // Debe ser true para que Supabase use el storage que definimos arriba
    detectSessionInUrl: true
  }
});