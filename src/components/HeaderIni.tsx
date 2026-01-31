'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-red-700">
          DIRECTOR'S FLIX
        </div>
        
        <div className="flex gap-4">
          {!session ? (
            <>
              <Link 
                href="/login" 
                className="px-5 py-2 text-white bg-transparent border border-white/30 hover:bg-white/10 rounded-lg transition-colors font-medium backdrop-blur-sm"
              >
                Entrar
              </Link>
            </>
          ) : (
            <div className="flex" >
              <div className="text-pretty text-white px-5 py-2 ">
                Seja bem-vindo <span className="text-green-500 font-bold"> {session.user.name}</span>
              </div>
                          
            <button 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}