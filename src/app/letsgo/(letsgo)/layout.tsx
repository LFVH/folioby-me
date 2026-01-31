import HeaderWithCategories from '@/components/letsgo/HeaderWithCategories';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-black">
      <HeaderWithCategories />

      {/* Main Content Area - Corrigido */}
      <main className="pt-20">
        <div>
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