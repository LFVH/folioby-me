'use client'
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-black">
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent p-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <h1 className="text-red-600 text-xl sm:text-2xl font-bold truncate">Director's Flix</h1>
          <Link href="/letsgo" className="">
            <div className="text-gray-300 hover:text-white
              transition-colors whitespace-nowrap text-sm px-2 py-1">
              ⇐Voltar
            </div>
          </Link>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 px-3 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium text-sm whitespace-nowrap flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
      </header>
      <main className="container mx-auto flex max-w-7xl justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-lg rounded-lg bg-gray-900/70 p-6 backdrop-blur-sm md:p-8 lg:max-w-xl">
          {children}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-gray-800 bg-black py-8 mt-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-400 text-center">
            © {new Date().getFullYear()} Director's Flix. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}