'use client'
import { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'

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
      aria-label={isEmailLink ? titulo : `${titulo} (abre em nova aba)`}
      className="
        flex items-center gap-3
        w-full px-4 py-3
        bg-zinc-900 hover:bg-zinc-800
        border border-zinc-700
        rounded-xl
        transition-colors duration-300
        hover:border-zinc-500
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500
        group
      "
    >
      <div aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center text-lg text-white opacity-80 group-hover:opacity-100">
        {icon}
      </div>

      <span className="text-white text-sm font-medium truncate">
        {titulo}
      </span>

      {!isEmailLink && (
        <ExternalLink aria-hidden="true" className="ml-auto size-4 shrink-0 text-zinc-500 group-hover:text-white" />
      )}
    </a>
  )
}
