'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push('/admin');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-lg border border-zinc-800 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-500">Acceso Administrador</h1>
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full p-3 mb-4 bg-zinc-800 border border-zinc-700 rounded outline-none focus:border-green-500"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-3 mb-6 bg-zinc-800 border border-zinc-700 rounded outline-none focus:border-green-500"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 p-3 rounded font-bold transition">
          Entrar
        </button>
      </form>
    </div>
  );
}