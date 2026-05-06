'use client';

import Image from 'next/image';
import TipTapEditor from '@/components/logged/TipTapEditor';
import LinksList from '@/components/letsgo/profile/LinksList';
import { useEffect } from "react";
import { usePathname } from 'next/navigation';
interface User {
  name: string;
  image: string | null;
  desc: any;
  links: [];
}

interface ProfileClientProps {
  user: User;
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const pathname = usePathname();
  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [pathname]);
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-16 border-b border-red-600 pb-4">
          <h1 className="text-4xl font-light tracking-[0.3em] text-white">
            PORTFOLIO
          </h1>
          <div className="mt-2 h-1 w-24 bg-red-600"></div>
        </div>

          <div className="space-y-8 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-5xl font-bold text-white">
                {user.name}
              </h2>
              <div className="h-0.5 w-32 bg-red-600"></div>
            </div>
                      {user.image && (
            <div className="flex justify-end">
              <div className="w-64 h-64 rounded-full overflow-hidden border-2 border-red-600/30">
                <Image
                  src={user.image}
                  alt={user.name}
                  width={256}
                  height={256}
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
          </div>
            <div className="space-y-6">
              <div className="prose prose-invert max-w-none">
                {user.desc && Object.keys(user.desc).length > 0 ? (
                  <div className="leading-relaxed text-gray-300">
                    <TipTapEditor
                      content={user.desc}
                      onChange={() => {}}
                      editable={false}
                    />
                  </div>
                ) : (
                  <p className="border-l-4 border-red-600 pl-4 italic text-gray-500">
                    Este usuario ainda nao adicionou uma descricao.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className= "pt-4" id="links">
            <LinksList links={user.links} />
          </div>

        
      </div>
  );
}
