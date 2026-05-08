'use client'
import { ReactNode } from 'react'

interface LinkButtonProps {
  titulo: string
  link: string
  icon: ReactNode
}

export default function LinkButton({ titulo, link, icon }: LinkButtonProps) {
  const isEmailLink = link.startsWith('mailto:')

  return (
    <a
      href={link}
      target={isEmailLink ? undefined : '_blank'}
      rel={isEmailLink ? undefined : 'noopener noreferrer'}
      className="
        flex items-center gap-3
        w-full px-4 py-3
        bg-zinc-900 hover:bg-zinc-800
        border border-zinc-700
        rounded-xl
        transition-all duration-300
        hover:scale-[1.02]
        hover:shadow-lg hover:shadow-black/40
        group
      "
    >
      <div className="w-6 h-6 text-white opacity-80 group-hover:opacity-100">
        {icon}
      </div>

      <span className="text-white text-sm font-medium truncate">
        {titulo}
      </span>
    </a>
  )
}
