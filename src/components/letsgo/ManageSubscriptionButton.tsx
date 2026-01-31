'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface ManageSubscriptionButtonProps {
  className?: string;
  returnUrl?: string;
}

export default function ManageSubscriptionButtonWithCheck({ 
  className = '',
  returnUrl 
}: ManageSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  if(status !== 'authenticated'){
    return (
    <div className="hidden items-center space-x-4 md:flex">
     <Link
      className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700"
      href="/login"
       >
        Login
    </Link>
  </div>

    );
  }
  if(!session?.status){
  return (
    <div className="hidden items-center space-x-4 md:flex">
      <Link
      className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700"
      href="/"
        >
        Assinar
    </Link>
    </div>

    );
  }
  const handleManageSubscription = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/letsgo/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          return_url: returnUrl || `${window.location.origin}/dashboard`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Failed to access subscription management. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleManageSubscription}
      disabled={isLoading}
      className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Redirecting...
        </>
      ) : (
        <>
          <CreditCardIcon className="w-4 h-4 mr-2" />
          Gerencie sua assinatura Stripe
        </>
      )}
    </button>
  );
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}