'use client';

import { useEffect, useRef, useState } from 'react';

interface FeatureNoticePopupProps {
  email: string;
  triggerText: string;
  autoCloseMs?: number;
  className?: string;
}

export default function FeatureNoticePopup({
  email,
  triggerText,
  autoCloseMs = 6000,
  className = 'text-sm text-red-500 hover:text-red-400 underline',
}: FeatureNoticePopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closePopup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setShowPopup(false);
  };

  const openPopup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setShowPopup(true);
    timeoutRef.current = setTimeout(() => {
      setShowPopup(false);
      timeoutRef.current = null;
    }, autoCloseMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <button type="button" className={className} onClick={openPopup}>
        {triggerText}
      </button>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-lg bg-white p-6 shadow-xl animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Aviso</h3>
              <button
                type="button"
                onClick={closePopup}
                className="text-gray-400 transition-colors hover:text-gray-600"
                aria-label="Fechar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p className="text-gray-700">
              Desculpe, sessao em desenvolvimento. Envie um email breve para <strong>{email}</strong>.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={closePopup}
                className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
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
