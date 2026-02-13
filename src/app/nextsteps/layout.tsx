'use client'
import { useSession } from 'next-auth/react';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();
  if (status === 'loading') {
      return (
      <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
      );
  }

  if (!session) {
    return null; 
  }  
  return (
    <div className="bg-black"> 
      <main className="">
        <div className="pt-10" >
          {children}
        </div>
      </main>

      <footer className="border-t border-gray-800 bg-black">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-400 text-center">
            © {new Date().getFullYear()} FolioBy. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}