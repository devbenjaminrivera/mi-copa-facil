'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminButton() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLogged(!!session);
    };
    checkUser();
  }, []);

  return (
    <Link 
      href={isLogged ? "/admin" : "/login"} 
      className="text-xs font-mono text-zinc-500 hover:text-green-400 border border-zinc-800 px-3 py-1 rounded-full transition-all bg-zinc-900/30"
    >
      {isLogged ? "IR_AL_PANEL >" : "ADMIN_LOGIN >"}
    </Link>
  );
}