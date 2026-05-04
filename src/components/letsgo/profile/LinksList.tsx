'use client'
import LinkButton from './LinkButton'

type LinkItem = [number, string, string]

interface LinksListProps {
  links: LinkItem[]
}

// 🎯 Ícones (simples, você pode trocar por lucide/react-icons depois)
const getIcon = (nr: number) => {
  switch (nr) {
    case 1: // Instagram
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm5 5a5 5 0 110 10 5 5 0 010-10zm6.5-.8a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
        </svg>
      )

    case 2: // TikTok
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 3c.4 2.2 2 3.8 4 4v3c-1.5 0-3-.5-4-1.3V16a5 5 0 11-5-5c.3 0 .7 0 1 .1v3a2 2 0 10 2 2V3h2z"/>
        </svg>
      )

    case 3: // YouTube
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16 5 12 5 12 5s-4 0-6.9.1c-.4 0-1.3.1-2.1.9C2.4 6.6 2.2 8 2.2 8S2 9.6 2 11.2v1.6C2 14.4 2.2 16 2.2 16s.2 1.4.8 2c.8.8 1.9.8 2.4.9 1.7.2 6.6.1 6.6.1s4 0 6.9-.1c.4 0 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.6C22 9.6 21.8 8 21.8 8zM10 14V9l5 2.5L10 14z"/>
        </svg>
      )

    case 4: // X (Twitter)
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2h3l-7.5 8.6L22 22h-6l-4.7-6.2L6 22H3l8-9.2L2 2h6l4.3 5.7L18 2z"/>
        </svg>
      )

    case 5: // Facebook
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 22v-8h3l1-4h-4V8c0-1.2.3-2 2-2h2V2.1C16.7 2 15.6 2 14.4 2 11.6 2 10 3.6 10 6.6V10H7v4h3v8h3z"/>
        </svg>
      )

    case 6: // LinkedIn
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 3a2 2 0 110 4 2 2 0 010-4zm1 6H3v12h2V9zm4 0h-2v12h2v-6c0-3 4-3.2 4 0v6h2v-7c0-5-6-4.8-6-2.3V9z"/>
        </svg>
      )

    case 7: // WhatsApp
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 00-8.7 15l-1.3 5 5-1.3A10 10 0 1012 2zm5.2 14.3c-.2.6-1.2 1.1-1.6 1.2-.4.1-.9.1-1.5-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4.1-4.7-4.3-.1-.2-1.1-1.4-1.1-2.6 0-1.2.6-1.8.8-2 .2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.8 2 .9 2.2.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.3.4-.5.5-.2.2-.4.4-.2.8.2.4 1 1.6 2.2 2.6 1.5 1.3 2.7 1.7 3.1 1.9.4.2.6.2.8 0 .2-.2.8-.9 1-1.2.2-.3.4-.3.6-.2.2.1 1.5.7 1.8.8.3.1.5.2.6.3.1.1.1.6-.1 1.2z"/>
        </svg>
      )

    case 8: // Telegram
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 3L3 10l5 2 2 6 3-4 5 4 3-15z"/>
        </svg>
      )

    case 9: // Discord
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4a16 16 0 00-4-1l-.2.4a14 14 0 00-7.6 0L8 3a16 16 0 00-4 1C2 9 2 15 2 15a16 16 0 004 2c.3-.4.6-.8.8-1.2a10 10 0 006.4 0c.2.4.5.8.8 1.2a16 16 0 004-2s0-6-2-11z"/>
        </svg>
      )

    case 10: // Twitch
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 2l-2 4v14h5v2h3l2-2h3l5-5V2H4zm14 11l-3 3h-3l-2 2v-2H6V4h12v9z"/>
        </svg>
      )

    case 11: // GitHub
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 .5A12 12 0 000 12.7c0 5.5 3.6 10.2 8.6 11.8.6.1.8-.3.8-.6v-2.2c-3.5.8-4.2-1.7-4.2-1.7-.6-1.5-1.4-1.9-1.4-1.9-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1 .1-.8.4-1.4.7-1.7-2.8-.3-5.7-1.5-5.7-6.5 0-1.4.5-2.5 1.3-3.4-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.4 1.3a11.5 11.5 0 016.2 0c2.4-1.6 3.4-1.3 3.4-1.3.7 1.7.2 3 .1 3.3.8.9 1.3 2 1.3 3.4 0 5-2.9 6.2-5.7 6.5.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12.2 12.2 0 0024 12.7 12 12 0 0012 .5z"/>
        </svg>
      )

      
    default: // outros
      return (
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 117-7l1-1 2 2-1 1a5 5 0 11-7 7l-1 1-2-2 1-1z"/>
        </svg>
      )
  }
}

export default function LinksList({ links }: LinksListProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
      {links && links.map(([nr, link, titulo], index) => (
        <LinkButton
          key={index}
          titulo={titulo}
          link={link}
          icon={getIcon(nr)}
        />
      ))}
    </div>
  )
}