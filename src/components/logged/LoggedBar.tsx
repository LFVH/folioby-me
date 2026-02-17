'use client'

import { signOut, useSession } from "next-auth/react"
import { UserButton } from "./UserButtons"
import Link from "next/link";
import { MenuIcon } from "../signinsignup/icons";
import { scrollToTop } from "@/lib/utils";

const links = [
  { href: '/nextsteps/contents', title: 'Manage Content' },
  { href: '/nextsteps/profile', title: 'Profile - Slug/Image' },
  { href: '/nextsteps/categories', title: 'Coming Soon...' },
];

export function LoggedBar() {
  const { data: session, status } = useSession();
  if (status === 'loading') {
      return (
      <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
      );
  }

  if (!session || !session.user.status) {
    return null; 
  }
  return (
    <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent">
    <div className="bg-black">
      {/* Netflix-style Header */}
      <div className="folio-text-pattern w-full rounded-lg overflow-hidden border border-gray-800">
          <div className="container mx-auto flex max-w-7xl items-center justify-between md:px-6">
            {/* Logo */}
            <Link href={`/${session.user?.status ? session.user?.slug : ""}`} className="flex items-center space-x-2">
              <div className="text-red-600 font-bold tracking-tight">
                FolioBy/{session.user?.status ? session.user?.slug : "yournamehere"} (access mypage)
              </div>
            </Link>

            <Link href={`/${session.user?.status ? session.user?.slug : ""}/profile`} className="flex items-center space-x-2">
              <div className="text-red-600 font-bold tracking-tight">
                {session.user?.status ? "Edit Profile Description" : ""}
              </div>
            </Link>
            {/* Desktop Navigation */}
            <nav className="hidden items-center space-x-6 text-sm md:flex">
          
              {links.map((link) => (
                <Link
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-bold"
                  href={link.href}
                  key={link.title}
                  onClick={scrollToTop}
                >
                  {link.title}
                </Link>
              ))}
            </nav>
              <UserButton />
            {/* Mobile Navigation */}
            <div className="flex items-center space-x-4 md:hidden">
              <button className="inline-flex rounded-md p-1 md:hidden" type="button">
                <MenuIcon className="h-6 w-6 text-white" />
                <span className="sr-only">Toggle Menu</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  </header>
  )
}
