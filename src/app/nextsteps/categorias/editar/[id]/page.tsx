'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Categoria {
  id: number
  nome: string | null
  name: string | null
  descricao: string | null
}

export default function EditarCategoriaPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    name: '',
    descricao: ''
  })

  useEffect(() => {
    fetchCategoria()
  }, [params.id])

  const fetchCategoria = async () => {
    try {
      const response = await fetch(`/api/nextsteps/categorias/${params.id}`)
      const result = await response.json()

      if (result.success) {
        const categoria = result.data
        setFormData({
          nome: categoria.nome || '',
          name: categoria.name || '',
          descricao: categoria.descricao || ''
        })
      } else {
        alert('Categoria não encontrada')
        router.push('/nextsteps/categorias')
      }
    } catch (error) {
      alert('Erro ao carregar categoria')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/nextsteps/categorias/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        router.push('/nextsteps/categorias')
        router.refresh()
      } else {
        alert(result.error || 'Erro ao atualizar categoria')
      }
    } catch (error) {
      alert('Erro ao atualizar categoria')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Editar Categoria</h1>
          <p className="text-gray-400 mt-1">Atualize os dados da categoria</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Nome (Português)
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Ex: Ação, Comédia, Drama..."
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Name (English)
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
                placeholder="Ex: Action, Comedy, Drama..."
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors resize-none"
                placeholder="Descreva a categoria..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving || (!formData.nome && !formData.name)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}