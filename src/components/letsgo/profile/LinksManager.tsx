'use client'

import { useEffect, useState } from 'react'

const redes = [
  'Outros',
  'Instagram',
  'TikTok',
  'YouTube',
  'X',
  'Facebook',
  'LinkedIn',
  'WhatsApp',
  'Telegram',
  'Discord',
  'Twitch',
  'GitHub'
]

type LinkTuple = [number, string, string]

export default function LinksManager() {
  const [links, setLinks] = useState<LinkTuple[]>([])
  const [titulo, setTitulo] = useState('')
  const [url, setUrl] = useState('')
  const [rede, setRede] = useState(0)

  // carregar
  const fetchLinks = async () => {
    const res = await fetch('/api/nextsteps/user/links')
    const data = await res.json()
    setLinks(data)
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  // adicionar
  const addLink = async () => {
    await fetch('/api/nextsteps/user/links', {
      method: 'POST',
      body: JSON.stringify({
        nr_redesocial: rede,
        link: url,
        titulo
      })
    })

    setTitulo('')
    setUrl('')
    setRede(0)
    fetchLinks()
  }

  // deletar
  const deleteLink = async (index: number) => {
    await fetch('/api/nextsteps/user/links', {
      method: 'DELETE',
      body: JSON.stringify({ index })
    })

    fetchLinks()
  }

  return (
    <div className="max-w-md mx-auto space-y-4">

      {/* FORM */}
      <div className="space-y-2 bg-zinc-900 p-4 rounded-xl">
        <input
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          placeholder="Título"
          className="w-full p-2 rounded bg-zinc-800 text-white"
        />

        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full p-2 rounded bg-zinc-800 text-white"
        />

        <select
          value={rede}
          onChange={e => setRede(Number(e.target.value))}
          className="w-full p-2 rounded bg-zinc-800 text-white"
        >
          {redes.map((nome, i) => (
            <option key={i} value={i}>
              {nome}
            </option>
          ))}
        </select>

        <button
          onClick={addLink}
          className="w-full bg-red-500 hover:bg-red-600 p-2 rounded text-white font-bold"
        >
          + Adicionar
        </button>
      </div>

      {/* LISTA */}
      <div className="space-y-2">
        {links.map(([nr, link, titulo], i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-zinc-900 p-3 rounded-lg"
          >
            <div>
              <p className="text-white text-sm">{titulo}</p>
              <p className="text-gray-400 text-xs">
                {redes[nr]}
              </p>
            </div>

            <button
              onClick={() => deleteLink(i)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              deletar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}