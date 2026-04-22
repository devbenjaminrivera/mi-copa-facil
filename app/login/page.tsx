'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  // DEFINICIÓN DE ESTADOS (Esto es lo que faltaba en tu imagen)
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
      alert("El nombre de usuario no existe.");
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
    <div className="flex items-center justify-center min-h-screen bg-black font-sans px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Acceso Admin</h1>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.3em] uppercase mt-2">Copa CEVI 2026</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase font-black ml-1">Usuario</label>
            <input 
              type="text" 
              placeholder="Usuario" 
              className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-green-500 transition-all text-sm text-white"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase font-black ml-1">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl outline-none focus:border-green-500 transition-all text-sm text-white"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={cargando}
            className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-green-400 transition-all shadow-lg shadow-white/5 active:scale-95"
          >
            {cargando ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}