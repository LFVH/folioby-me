'use client'

import { useEffect, useState } from 'react'
import { FaTrash } from 'react-icons/fa6'
import { toast } from 'react-toastify'
import {
  normalizeProfileLink,
  PROFILE_LINK_OPTIONS,
  PROFILE_LINK_TYPE,
} from '@/lib/profile-links'

type LinkTuple = [number, string, string]

export default function LinksManager() {
  const [links, setLinks] = useState<LinkTuple[]>([])
  const [titulo, setTitulo] = useState('')
  const [url, setUrl] = useState('')
  const [rede, setRede] = useState(0)

  const isWhatsappSelected = rede === PROFILE_LINK_TYPE.WHATSAPP
  const isEmailSelected = rede === PROFILE_LINK_TYPE.EMAIL

  const fetchLinks = async () => {
    const res = await fetch('/api/nextsteps/user/links')
    const data = await res.json()
    setLinks(data.data || [])
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  const handleRedeChange = (nextRede: number) => {
    setRede((currentRede) => {
      if (nextRede === PROFILE_LINK_TYPE.WHATSAPP && currentRede !== PROFILE_LINK_TYPE.WHATSAPP) {
        setUrl('wa.me/55')
      } else if (currentRede === PROFILE_LINK_TYPE.WHATSAPP && nextRede !== PROFILE_LINK_TYPE.WHATSAPP) {
        setUrl('')
      }

      return nextRede
    })
  }

  const addLink = async () => {
    if (!url.trim()) {
      toast.error('O campo de link não pode ficar vazio.')
      return
    }

    const normalizedLink = normalizeProfileLink(url, rede)

    if (!normalizedLink.ok) {
      toast.error(normalizedLink.error)
      return
    }

    const response = await fetch('/api/nextsteps/user/links', {
      method: 'POST',
      body: JSON.stringify({
        nr_redesocial: rede,
        link: normalizedLink.value,
        titulo,
      }),
    })

    if (response.ok) {
      toast.success('Link adicionado com sucesso!')
      setTitulo('')
      setUrl('')
      setRede(0)
      fetchLinks()
      return
    }

    toast.error('Erro ao adicionar link. Tente novamente.')
  }

  const deleteLink = async (index: number) => {
    const response = await fetch('/api/nextsteps/user/links', {
      method: 'DELETE',
      body: JSON.stringify({ index }),
    })
    if (response.ok) {
      toast.success('Link excluído com sucesso!')
    } else {
      toast.error('Erro ao excluir link. Tente novamente.')
    }
    fetchLinks()
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="space-y-2 bg-zinc-900 p-4 rounded-xl">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título"
          className="w-full p-2 rounded bg-zinc-800 text-white"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type={isEmailSelected ? 'email' : 'text'}
          inputMode={isEmailSelected ? 'email' : 'url'}
          placeholder={
            isEmailSelected
              ? 'você@exemplo.com'
              : isWhatsappSelected
                ? 'wa.me/55'
                : 'https://...'
          }
          className="w-full p-2 rounded bg-zinc-800 text-white"
        />
        <select
          value={rede}
          onChange={(e) => handleRedeChange(Number(e.target.value))}
          className="w-full p-2 rounded bg-zinc-800 text-white"
        >
          {PROFILE_LINK_OPTIONS.map((nome, i) => (
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
      <div className="space-y-2">
        {links && links.map(([nr, link, itemTitulo], i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-zinc-900 p-3 rounded-lg"
          >
            <div>
              <p className="text-white text-sm">{itemTitulo}</p>
              <p className="text-gray-400 text-xs">
                {PROFILE_LINK_OPTIONS[nr]}
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
                Excluir
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
