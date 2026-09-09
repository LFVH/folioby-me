'use client'

import { useState, useEffect } from 'react'
import ConteudoForm from '../components/ConteudoForm'

interface Categoria {
  id: number
  nome: string
  name: string
}

export default function NovoConteudoPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/nextsteps/categorias')
      const result = await response.json()

      if (result.success) {
        setCategorias(result.data)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  useEffect(() => {
    const loadCategorias = async () => {
      await fetchCategorias()
    }

    void loadCategorias()
  }, [])

  return <ConteudoForm categorias={categorias} />
}