'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    
    // 1. Buscar el email asociado al username en la tabla 'perfiles'
    const { data: perfil, error: errorPerfil } = await supabase
      .from('perfiles')
      .select('email')
      .eq('username', usernameInput)
      .single();

    if (errorPerfil || !perfil) {
      alert("El nombre de usuario no existe o la base de datos no está disponible.");
      setCargando(false);
      return;
    }

    // 2. Hacer el login real usando el email encontrado y la password
    const { error: errorAuth } = await supabase.auth.signInWithPassword({
      email: perfil.email,
      password: passwordInput,
    });

    if (errorAuth) {
      alert("Contraseña incorrecta.");
    } else {
      // Redirigir al panel de administración
      router.push('/admin');
    }
    setCargando(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505] font-sans px-4 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="font-outfit text-4xl font-black tracking-tight text-white uppercase drop-shadow-md">Acceso Admin</h1>
          <p className="text-zinc-400 text-xs font-bold tracking-[0.3em] uppercase mt-2">Copa CEVI</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 bento-card p-8 md:p-10">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest ml-1">Usuario</label>
            <input 
              type="text" 
              placeholder="Nombre de usuario" 
              className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-orange-500/50 focus:bg-black/60 transition-all text-sm text-white shadow-inner"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest ml-1">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-black/40 border border-white/10 p-4 rounded-xl outline-none focus:border-orange-500/50 focus:bg-black/60 transition-all text-sm text-white shadow-inner"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={cargando}
            className="w-full bg-white text-black font-black py-4 mt-4 rounded-xl uppercase text-xs tracking-widest hover:bg-zinc-200 transition-all shadow-lg hover:shadow-white/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {cargando ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}