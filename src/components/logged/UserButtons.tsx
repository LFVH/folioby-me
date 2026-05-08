'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';

export function UserButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleClick = () => {
    router.push('/nextsteps/profile');
  };

  if (status === 'loading') {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
    );
  }

  if (!session) {
    return null; 
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 p-0.5 text-white transition duration-200 hover:border-white/20 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black"
        title="Manage Profile"
        aria-label="Abrir configuracoes do perfil"
      >
        <Avatar
          src={session.user?.image}
          name={session.user?.name}
          className="h-full w-full ring-0 shadow-none"
          imageClassName="group-hover:scale-[1.04]"
          fallbackClassName="text-xs font-bold"
          sizes="40px"
        />
      </button>
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
  );
}
