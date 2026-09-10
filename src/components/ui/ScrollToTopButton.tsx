'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 280)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) {
    return null
  }

  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-5 right-5 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-red-500/60 bg-red-600 text-white shadow-lg shadow-red-900/40 transition hover:scale-105 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-black"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}
