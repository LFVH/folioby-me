import Link from 'next/link';
import { MenuIcon } from '@/components/signinsignup/icons';

const links = [
  { href: '/nextsteps/categorias', title: 'Categorias' },
  { href: '/nextsteps/conteudos', title: 'Conteudos' },
];

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-black">
      {/* Netflix-style Header */}
      <div className="border-b border-gray-800 bg-black/95 backdrop-blur-sm">
        <div className="container mx-auto flex max-w-7xl items-center justify-between p-4 md:px-6">
          {/* Logo */}
          <Link href="/letsgo" className="flex items-center space-x-2">
            <div className="text-red-600 font-bold text-2xl tracking-tight">
              Director's Flix (/letsgo)
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 text-sm md:flex">
            {links.map((link) => (
              <Link 
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium" 
                href={link.href} 
                key={link.title}
              >
                {link.title}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center space-x-4 md:hidden">
            <button className="inline-flex rounded-md p-1 md:hidden" type="button">
              <MenuIcon className="h-6 w-6 text-white" />
              <span className="sr-only">Toggle Menu</span>
            </button>
          </div>
        </div>
      </div>

      <main className="">
        <div className="">
          {children}
        </div>
      </main>

      <footer className="border-t border-gray-800 bg-black py-8 mt-8">

      </footer>
    </div>
  );
}