import HeaderWithCategories from '@/components/letsgo/HeaderWithCategories';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-black">
      <HeaderWithCategories />

      {/* Main Content Area */}
      <main className="pt-16">
        <div>
          {children}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-zinc-900 bg-black py-8 mt-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-zinc-500 text-sm text-center">
            © {new Date().getFullYear()} FolioBy. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}