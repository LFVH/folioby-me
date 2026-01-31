'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NovaCategoriaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    name: '',
    descricao: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/nextsteps/categorias', {
        method: 'POST',
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
        alert(result.error || 'Erro ao criar categoria')
      }
    } catch (error) {
      alert('Erro ao criar categoria')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Nova Categoria</h1>
          <p className="text-gray-400 mt-1">Crie uma nova categoria para organizar conteúdos</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="space-y-6">
            {/* Nome em Português */}
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
              <p className="text-gray-400 text-sm mt-1">
                Nome da categoria em português
              </p>
            </div>

            {/* Name em Inglês */}
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
              <p className="text-gray-400 text-sm mt-1">
                Nome da categoria em inglês
              </p>
            </div>

            {/* Descrição */}
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

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || (!formData.nome && !formData.name)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando...' : 'Criar Categoria'}
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