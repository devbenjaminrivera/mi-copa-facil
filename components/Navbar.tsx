'use client';
import Link from 'next/link';
import AdminButton from '@/components/AdminButton';
import { usePathname } from 'next/navigation';
import Image from 'next/image'; // Importamos el componente Image

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/' },
    { name: 'Equipos', href: '/equipos' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          
          {/* Contenedor del Logo y Texto */}
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" // Asegúrate de que el archivo logo.jpg esté en la carpeta /public
              alt="Copa CEVI Logo"
              width={32}      // Ajusta el tamaño según prefieras
              height={32}
              className="object-contain"
            />
            <span className="text-white font-black tracking-tighter uppercase italic text-lg">
              CEVI
            </span>
          </div>

          <div className="flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                  pathname === link.href ? 'text-green-500' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <AdminButton />
        </div>
      </div>
    </nav>
  );
}