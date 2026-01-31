'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function UserButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleClick = () => {
    router.push('/letsgo/user');
  };

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
    );
  }

  if (!session) {
    return null; 
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      title="Gerencie sua assinatura"
    >
      {session.user?.image ? (
      <img
        src={session.user.image}
        alt={session.user.name || 'User'}
        className="w-8 h-8 rounded-full object-cover"
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
        <span className="text-white text-xs font-bold">
          {session.user?.name
            ?.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </span>
      </div>
    )}
    </button>
  );
}

function UserIcon() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      className="w-4 h-4"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}