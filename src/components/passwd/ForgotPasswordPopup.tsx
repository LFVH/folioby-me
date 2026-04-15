// components/ForgotPasswordPopup.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ForgotPasswordPopupProps {
  email: string;
}

export default function ForgotPasswordPopup({ email }: ForgotPasswordPopupProps) {
  const [showPopup, setShowPopup] = useState(false);

  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowPopup(true);
    
    // Fechar popup automaticamente após 3 segundos
    setTimeout(() => {
      setShowPopup(false);
    }, 6000);
  };

  return (
    <>
      <Link 
        className="text-sm text-red-500 hover:text-red-400 underline" 
        href="#"
        onClick={handleForgotPassword}
      >
        Forgot your password?
      </Link>

      {/* Popup de aviso */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Aviso</h3>
              <button 
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700">
               Desculpe, sessão em desenvolvimento. Envie um email breve para <strong>{email}</strong>.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
}