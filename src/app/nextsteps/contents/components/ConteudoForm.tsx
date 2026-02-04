'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Categoria {
  id: number
  nome: string
  name: string
}

interface ConteudoFormProps {
  conteudo?: any
  categorias: Categoria[]
}

export default function ConteudoForm({ conteudo, categorias }: ConteudoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [selectedCategorias, setSelectedCategorias] = useState<number[]>([])

  const [formData, setFormData] = useState({
    nome: conteudo?.nome || '',
    name: conteudo?.name || '',
    fonte: conteudo?.fonte || '',
    link: conteudo?.link || '',
    linkext: conteudo?.linkext || '',
    file: null as File | null
  })

  useEffect(() => {
    if (conteudo) {
      setSelectedCategorias(conteudo.categorias?.map((cat: Categoria) => cat.id) || [])
      if (conteudo.link) {
        setPreviewUrl(conteudo.link)
      } else if (conteudo.id) {
        setPreviewUrl(`/api/nextsteps/conteudo/${conteudo.id}`)
      }
    }
  }, [conteudo])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.includes('gif')) {
        alert('Por favor, selecione apenas arquivos GIF')
        return
      }
      setFormData(prev => ({ ...prev, file }))
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleCategoriaToggle = (categoriaId: number) => {
    setSelectedCategorias(prev =>
      prev.includes(categoriaId)
        ? prev.filter(id => id !== categoriaId)
        : [...prev, categoriaId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append('nome', formData.nome)
      submitData.append('name', formData.name)
      submitData.append('fonte', formData.fonte)
      submitData.append('link', formData.link)
      submitData.append('linkext', formData.linkext)
      submitData.append('categoriasIds', selectedCategorias.join(','))

      if (formData.file) {
        submitData.append('file', formData.file)
      }

      const url = conteudo 
        ? `/api/nextsteps/conteudo/${conteudo.id}`
        : '/api/nextsteps/conteudo'

      const method = conteudo ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        body: submitData
      })

      const result = await response.json()

      if (result.success) {
        router.push('/nextsteps/conteudos')
        router.refresh()
      } else {
        alert(result.error || 'Erro ao salvar conteúdo')
      }
    } catch (error) {
      alert('Erro ao salvar conteúdo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8">
        {conteudo ? 'Editar Conteúdo' : 'Novo Conteúdo'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview do GIF */}
        {previewUrl && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Preview:</h3>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-xs max-h-48 rounded-lg border border-gray-600"
            />
          </div>
        )}

        {/* Upload de Arquivo */}
        <div>
          <label className="block text-white font-semibold mb-2">
            Arquivo GIF {!conteudo && '*'}
          </label>
          <input
            type="file"
            accept=".gif,image/gif"
            onChange={handleFileChange}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
          />
          <p className="text-gray-400 text-sm mt-1">
            {conteudo ? 'Deixe em branco para manter o arquivo atual' : 'Selecione um arquivo GIF'}
          </p>
        </div>

        {/* Nome */}
        <div>
          <label className="block text-white font-semibold mb-2">Nome (PT-BR)</label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="Nome em português"
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-white font-semibold mb-2">Name (EN)</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="Name in English"
          />
        </div>

        {/* Fonte */}
        <div>
          <label className="block text-white font-semibold mb-2">Name (EN)</label>
          <input
            type="text"
            value={formData.fonte}
            onChange={(e) => setFormData(prev => ({ ...prev, fonte: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="Fonte"
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-white font-semibold mb-2">Link GIF (Opcional)</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="https://exemplo.com/gif.gif"
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-white font-semibold mb-2">Link Externo</label>
          <input
            type="url"
            value={formData.linkext}
            onChange={(e) => setFormData(prev => ({ ...prev, linkext: e.target.value }))}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="https://insta.com/video"
          />
        </div>

        {/* Seletor de Categorias */}
        <div>
          <label className="block text-white font-semibold mb-2">Categorias</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 bg-gray-800 rounded-lg border border-gray-600">
            {categorias.map((categoria) => (
              <label key={categoria.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategorias.includes(categoria.id)}
                  onChange={() => handleCategoriaToggle(categoria.id)}
                  className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                />
                <span className="text-white text-sm">
                  {categoria.nome} ({categoria.name})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : (conteudo ? 'Atualizar' : 'Criar Conteúdo')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}