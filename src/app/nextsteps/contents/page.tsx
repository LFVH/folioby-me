'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { handleImgError } from '@/utils/imageFallback'
import Link from 'next/link'
import SearchBarNxt from '@/components/logged/SearchBarNxt'
import { ToggleStatus } from '@/components/logged/ToggleStatus'
import { scrollToTop } from '@/lib/utils'

interface Conteudo {
  isTrend: boolean
  id: number
  name: string
  filename: string
  mimetype: string
  link?: string
  linkext?: string
  categorias: Array<{ id: number; nome: string; name: string }>
  createdAt: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number | null
  prevPage: number | null
}

export default function ConteudosPage() {
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  })

  const fetchConteudos = useCallback(async (page: number, search: string = '') => {
    setLoading(true)
    scrollToTop()
    try {
      const url = `/api/nextsteps/conteudo?page=${page}&limit=12${search ? `&search=${encodeURIComponent(search)}` : ''}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setConteudos(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchConteudos(1, searchTerm)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchConteudos, searchTerm])

  const handleSearch = (termo: string) => {
    setSearchTerm(termo)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza de que deseja excluir este conteúdo?')) return

    try {
      const response = await fetch(`/api/nextsteps/conteudo/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        fetchConteudos(pagination.currentPage, searchTerm)
      } else {
        alert(result.error || 'Erro ao excluir conteúdo')
      }
    } catch (error) {
      alert('Erro ao excluir conteúdo')
    }
  }

  const getOriginalFileName = (filename: string) => {
    return filename.replace(
      /^\d+-[a-f0-9-]+-/i,
      ''
    )
  }

  const handleStatusChange = (conteudoId: number, newBool: boolean, toggle: string) => {
    setConteudos((prev) =>
      prev.map((conteudo) =>
        conteudo.id === conteudoId
          ? {
              ...conteudo,
              ...(toggle === 'istrend' && { isTrend: newBool }),
            }
          : conteudo
      )
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-white">Gerenciar conteúdos</h1>
            <p className="mt-1 text-gray-400">Adicione, edite ou exclua os conteúdos exibidos na sua página</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
            <div className="w-full sm:max-w-xs lg:w-[280px]">
              <SearchBarNxt
                onSearch={handleSearch}
                placeholder="Buscar por nome, arquivo ou categoria..."
              />
            </div>

            <Link
              href="/nextsteps/contents/new"
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 whitespace-nowrap"
            >
              + Novo conteúdo
            </Link>
          </div>
        </div>

        {searchTerm && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white">
                  Resultados para: <strong>&quot;{searchTerm}&quot;</strong>
                </span>
                <span className="text-gray-400 ml-4">
                  {pagination.totalItems} conteúdo(s) encontrado(s)
                </span>
              </div>
              <button
                onClick={() => handleSearch('')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Limpar busca
              </button>
            </div>
          </div>
        )}
        {pagination.totalPages > 1 && (
          navPages(fetchConteudos, pagination, searchTerm)
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {conteudos.map((conteudo) => (
            <div key={conteudo.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="h-48 bg-gray-900 flex items-center justify-center">
                <Image
                  src={conteudo.link || `/api/nextsteps/conteudo/${conteudo.id}`}
                  alt={conteudo.name}
                  width={600}
                  height={300}
                  className="max-h-full max-w-full object-contain"
                  unoptimized
                  onError={(e) => handleImgError(e)}
                />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">
                      {getOriginalFileName(conteudo.name || 'Sem nome')}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                    <span className={`text-xs font-medium ${
                      conteudo.isTrend ? 'text-orange-400' : 'text-gray-400'
                    }`}>
                      {conteudo.isTrend ? 'Em alta' : 'Normal'}
                    </span>
                    <ToggleStatus
                      id={conteudo.id}
                      status={conteudo.isTrend}
                      type="conteudo"
                      onStatusChange={(newStatus) => {
                        handleStatusChange(conteudo.id, newStatus, 'istrend')
                      }}
                      toggle={'istrend'}
                    />
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-3 truncate">
                  {conteudo.filename}
                </p>

                {conteudo.linkext && (
                  <div className="mb-3">
                    <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                      Link: {conteudo.linkext}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-4">
                  {conteudo.categorias.map((categoria) => (
                    <span
                      key={categoria.id}
                      className="bg-gray-700 text-white text-xs px-2 py-1 rounded"
                    >
                      {categoria.name}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/nextsteps/contents/edit/${conteudo.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded transition-colors text-sm"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(conteudo.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && conteudos.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            {searchTerm ? (
              <>
                <p className="text-xl">Nenhum resultado encontrado</p>
                <p className="mt-2">Tente ajustar os termos da busca</p>
                <button
                  onClick={() => handleSearch('')}
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  Limpar busca
                </button>
              </>
            ) : (
              <>
                <p className="text-xl">Nenhum conteúdo encontrado</p>
                <p className="mt-2">Adicione seu primeiro conteúdo para começar</p>
                <Link
                  href="/nextsteps/contents/new"
                  className="mt-4 inline-block px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Adicionar conteúdo
                </Link>
              </>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        )}

        {pagination.totalPages > 1 && (
          navPages(fetchConteudos, pagination, searchTerm)
        )}
      </div>
    </div>
  )
}

function navPages(fetchConteudos: (page: number, search?: string) => Promise<void>, pagination: PaginationInfo, searchTerm: string) {
  return <div className="flex justify-center items-center gap-4 mt-8">
    <button
      onClick={() => fetchConteudos(pagination.prevPage!, searchTerm)}
      disabled={!pagination.hasPrevPage}
      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
    >
      Anterior
    </button>

    <div className="flex items-center gap-2 text-sm">
      <span className="text-white">
         {pagination.currentPage} / {pagination.totalPages}
      </span>
      <span className="text-gray-400">
        Total: ({pagination.totalItems} itens)
      </span>
    </div>

    <button
      onClick={() => fetchConteudos(pagination.nextPage!, searchTerm)}
      disabled={!pagination.hasNextPage}
      className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
    >
      Próxima
    </button>
  </div>
}
