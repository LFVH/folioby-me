'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MoreDotsIcon } from '../signinsignup/icons'
import { scrollToTop } from '@/lib/utils'
import { UserButton } from './UserButtons'

const links = [
  { href: '/nextsteps/contents', title: 'Page Contents' },
  { href: '/nextsteps/categorias', title: 'Categories' },
  { href: '/nextsteps/user/profile', title: 'Profile' },
  { href: '/nextsteps/profile', title: 'Account Settings' },
]

export function LoggedBar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (status === 'loading') {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300" />
  }

  if (!session || !session.user.status) {
    return null
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)
  const activeLinkClass = (href: string) =>
    isActive(href)
      ? 'text-white underline decoration-2 decoration-red-600 underline-offset-4'
      : 'text-gray-300 hover:text-white'

  return (
    <header className="fixed top-0 z-50 w-full bg-gradient-to-b from-black to-transparent">
      <div className="bg-black">
        <div className="relative z-50 w-full overflow-visible rounded-lg border border-gray-800 bg-gray-900">
          <div className="container mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-none">
              <Link
                href={`/${session.user?.status ? session.user?.slug : ''}`}
                className="min-w-0 flex-1 truncate text-sm font-bold tracking-tight text-red-600 sm:text-base"
              >
                <span>FolioBy/{session.user?.status ? session.user?.slug : 'yournamehere'} (access mypage)</span>
              </Link>

              <Link
                href={`/${session.user?.status ? session.user?.slug : ''}/profile`}
                className="shrink-0"
              >
                <div
                  className={`${pathname === `/${session.user?.slug}/profile` ? 'text-white underline decoration-2 decoration-red-600 underline-offset-4' : 'text-red-600'} text-sm font-bold tracking-tight sm:text-base`}
                >
                  {session.user?.status ? '/Profile' : ''}
                </div>
              </Link>
            </div>

            <nav className="hidden items-center gap-4 text-sm md:flex md:items-center">
              {links.map((link) => (
                <Link
                  className={`${activeLinkClass(link.href)} transition-colors duration-200 font-bold`}
                  href={link.href}
                  key={link.title}
                  onClick={scrollToTop}
                >
                  {link.title}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2 md:ml-0">
              <UserButton />

              <div className="relative md:hidden">
                <button
                  type="button"
                  aria-label="Abrir menu de gerenciamento"
                  aria-expanded={mobileMenuOpen}
                  onClick={() => setMobileMenuOpen((value) => !value)}
                  className="inline-flex items-center justify-center rounded-md p-2 text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <MoreDotsIcon className="h-6 w-6" />
                </button>

                {mobileMenuOpen && (
                  <div className="absolute right-0 top-full z-[60] mt-2 w-56 rounded-lg border border-gray-700 bg-gray-950 p-2 shadow-2xl shadow-black/50">
                    {links.map((link) => (
                      <Link
                        key={link.title}
                        href={link.href}
                        onClick={() => {
                          setMobileMenuOpen(false)
                          scrollToTop()
                        }}
                        className={`${activeLinkClass(link.href)} flex w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-800`}
                      >
                        {link.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

