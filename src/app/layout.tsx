import './globals.css';
import React, { Suspense } from 'react';
import ClientProviders from "@/components/Providers"
import { Inter, Poppins, Bebas_Neue } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins'
});

// Configuração da fonte para títulos (opcional)
const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas'
});

export const metadata = {
  title: 'DirectFlix - Sua Plataforma de referências',
  description: 'As melhores referências em uma experiência incrível',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 text-gray-800`}>
        <div className="min-h-screen flex flex-col">
          <ClientProviders>
            <main className="flex-grow">
            <Suspense fallback={<div>Carregando página...</div>}>
                {children}
            </Suspense>
            </main>        
          </ClientProviders>
        </div>
      </body>
    </html>
  );
}