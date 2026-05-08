'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string | null
  alt?: string
  className?: string
  imageClassName?: string
  fallbackClassName?: string
  priority?: boolean
  sizes?: string
}

function getAvatarInitials(name?: string | null) {
  if (!name) {
    return 'FB'
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'FB'
}

export function Avatar({
  src,
  name,
  alt,
  className,
  imageClassName,
  fallbackClassName,
  priority = false,
  sizes = '128px',
}: AvatarProps) {
  const label = alt ?? name ?? 'Avatar'

  return (
    <div
      className={cn(
        'relative isolate overflow-hidden rounded-full bg-zinc-900 ring-1 ring-white/10 shadow-[0_16px_45px_rgba(0,0,0,0.35)]',
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={label}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(
            'object-cover object-center transition-transform duration-500 ease-out',
            imageClassName
          )}
        />
      ) : (
        <div
          aria-label={label}
          className={cn(
            'flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_45%),linear-gradient(135deg,rgba(220,38,38,0.34),rgba(24,24,27,0.95))] font-semibold tracking-[0.08em] text-white',
            fallbackClassName
          )}
        >
          {getAvatarInitials(name)}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_45%)]" />
    </div>
  )
}
