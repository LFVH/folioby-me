'use client'
import LinkButton from './LinkButton'
import { ReactNode } from 'react'
import {
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
  FaTelegram,
  FaDiscord,
  FaTwitch,
  FaGithub,
  FaLink
} from 'react-icons/fa6'

type LinkItem = [number, string, string]

interface LinksListProps {
  links: LinkItem[]
}


const iconsMap: Record<number, ReactNode> = {
  1: <FaInstagram />,
  2: <FaTiktok />,
  3: <FaYoutube />,
  4: <FaXTwitter />,
  5: <FaFacebook />,
  6: <FaLinkedin />,
  7: <FaWhatsapp />,
  8: <FaTelegram />,
  9: <FaDiscord />,
  10: <FaTwitch />,
  11: <FaGithub />
}

const getIcon = (nr: number) => {
  return iconsMap[nr] ?? <FaLink /> // fallback = "outros"
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