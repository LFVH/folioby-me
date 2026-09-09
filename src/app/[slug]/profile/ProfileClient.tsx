'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import TipTapEditor from '@/components/logged/TipTapEditor'
import LinksList from '@/components/letsgo/profile/LinksList'
import { Avatar } from '@/components/ui/Avatar'

export type LinkItem = [number, string, string]

export interface User {
  name: string
  image: string | null
  desc: any
  links: LinkItem[]
}

interface ProfileClientProps {
  user: User
}

function ProfileAvatar({ image, name, sizeClass }: { image: string | null; name: string; sizeClass: string }) {
  return (
    <Avatar
      src={image}
      name={name}
      priority
      sizes="(max-width: 1024px) 10rem, 22rem"
      className={`border border-red-600/40 bg-zinc-950 shadow-[0_0_50px_rgba(220,38,38,0.15)] ${sizeClass}`}
      imageClassName="scale-[1.01]"
      fallbackClassName="text-3xl"
    />
  )
}

function ProfileDescription({ desc }: { desc: User['desc'] }) {
  return (
    <div className="prose prose-invert max-w-none">
      {desc && Object.keys(desc).length > 0 ? (
        <div className="leading-relaxed text-gray-300">
          <TipTapEditor
            content={desc}
            onChange={() => {}}
            editable={false}
          />
        </div>
      ) : (
        <p className="border-l-4 border-red-600 pl-4 italic text-gray-500">
          Este usuário ainda não adicionou uma descrição.
        </p>
      )}
    </div>
  )
}

function ProfileLinksCard({ links }: { links: LinkItem[] }) {
  return (
    <section
      id="links"
      className="scroll-mt-32 rounded-[28px] border border-zinc-800 bg-zinc-950/80 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-6"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-red-500">Contato</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Links</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-red-600/70 to-transparent" />
      </div>
      <LinksList links={links} />
    </section>
  )
}

function MobileProfileLayout({ user }: { user: User }) {
  return (
    <div className="space-y-6 lg:hidden">
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-950 px-5 py-8 shadow-2xl shadow-black/30">
        <div className="absolute inset-x-8 top-0 h-24 rounded-full bg-red-600/10 blur-3xl" />
        <div className="relative flex flex-col items-center text-center">
          <ProfileAvatar
            image={user.image}
            name={user.name}
            sizeClass="h-36 w-36"
          />
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-red-500">Perfil</p>
          <h1 className="mt-3 text-4xl font-bold text-white">{user.name}</h1>
          <div className="mt-4 h-1 w-20 rounded-full bg-red-600" />
        </div>

        <div className="relative mt-8 rounded-[24px] border border-zinc-800 bg-black/40 p-5 text-left">
          <ProfileDescription desc={user.desc} />
        </div>
      </section>

      <ProfileLinksCard links={user.links} />
    </div>
  )
}

function DesktopProfileLayout({ user }: { user: User }) {
  return (
    <div className="hidden gap-10 lg:grid lg:grid-cols-[minmax(0,1.2fr)_22rem] lg:items-start">
      <section className="relative overflow-hidden rounded-[36px] border border-zinc-800 bg-zinc-950 px-10 py-12 shadow-2xl shadow-black/30">
        <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-red-600/10 blur-3xl" />
        <div className="relative">
          <p className="text-sm uppercase tracking-[0.45em] text-red-500">Perfil</p>
          <h1 className="mt-5 max-w-3xl text-6xl font-bold leading-tight text-white">
            {user.name}
          </h1>
          <div className="mt-6 h-1 w-28 rounded-full bg-red-600" />

          <div className="mt-10 rounded-[28px] border border-zinc-800 bg-black/30 p-8">
            <ProfileDescription desc={user.desc} />
          </div>
        </div>
      </section>

      <aside className="sticky top-28 space-y-6">
        <section className="rounded-[32px] border border-zinc-800 bg-zinc-950/90 p-8 text-center shadow-2xl shadow-black/30">
          <div className="flex justify-center">
            <ProfileAvatar
              image={user.image}
              name={user.name}
              sizeClass="h-72 w-72"
            />
          </div>
        </section>

        <ProfileLinksCard links={user.links} />
      </aside>
    </div>
  )
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const pathname = usePathname()

  useEffect(() => {
    const hash = window.location.hash

    if (!hash) {
      return
    }

    const el = document.querySelector(hash)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <MobileProfileLayout user={user} />
        <DesktopProfileLayout user={user} />
      </div>
    </div>
  )
}
