'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ConteudoForm from '../../components/ConteudoForm'

interface Categoria {
  id: number
  nome: string
  name: string
}

export default function EditarConteudoPage() {
  const params = useParams()
  const [conteudo, setConteudo] = useState<any>(null)
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      const [conteudoResponse, categoriasResponse] = await Promise.all([
        fetch(`/api/nextsteps/conteudos/${params.id}`),
        fetch('/api/nextsteps/categorias')
      ])

      const conteudoResult = await conteudoResponse.json()
      const categoriasResult = await categoriasResponse.json()

      if (conteudoResult.success) {
        setConteudo(conteudoResult.data)
      }

      if (categoriasResult.success) {
        setCategorias(categoriasResult.data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  if (!conteudo) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return <ConteudoForm conteudo={conteudo} categorias={categorias} />
}