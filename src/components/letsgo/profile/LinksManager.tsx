'use client'
import { useEffect, useState } from 'react'
import { FaTrash } from 'react-icons/fa6'
import { toast } from 'react-toastify'
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
  const fetchLinks = async () => {
    const res = await fetch('/api/nextsteps/user/links')
    const data = await res.json()
    setLinks(data.data || [])
  }
  useEffect(() => {
    fetchLinks()
  }, [])
  const addLink = async () => {
    if(!url){
      toast.error("O campo de URL não pode estar vazio.")
      return;
    }
    let urlToParse = url.trim();
    if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://')) {
      urlToParse = 'https://' + urlToParse;
    }
    const response = await fetch('/api/nextsteps/user/links', {
      method: 'POST',
      body: JSON.stringify({
        nr_redesocial: rede,
        link: url,
        titulo
      })
    })
    if (response.ok) {
      toast.success('Link adicionado com sucesso!')
    } else {
      toast.error('Erro ao adicionar link. Tente novamente.')
    }
    setTitulo('')
    setUrl('')
    setRede(0)
    fetchLinks()
  }
  const deleteLink = async (index: number) => {
    const response = await fetch('/api/nextsteps/user/links', {
      method: 'DELETE',
      body: JSON.stringify({ index })
    })
    if (response.ok) {
      toast.success('Link deletado com sucesso!')
    } else {
      toast.error('Erro ao deletar link. Tente novamente.')
    }
    fetchLinks()
  }
  return (
    <div className="max-w-md mx-auto space-y-4">
      {}
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
      {}
      <div className="space-y-2">
        {links && links.map(([nr, link, titulo], i) => (
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
              className="
                p-2 rounded-lg
                text-red-400 hover:text-white
                hover:bg-red-500/20
                transition-all duration-200
                group
              "
            >
              <FaTrash className="w-4 h-4" />

              <span className="
                absolute ml-2 px-2 py-1 text-xs
                bg-black text-white rounded
                opacity-0 group-hover:opacity-100
                transition
              ">
                Deletar
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}