'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import SearchBarNxt from '@/components/logged/SearchBarNxt'
import { ToggleStatus } from '@/components/logged/ToggleStatus'

interface Categoria {
  isTrend: boolean
  id: number
  nome: string | null
  name: string | null
  descricao: string | null
  createdAt: string
  updatedAt: string
  _count: {
    conteudos: number
  }
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

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null
  })

  const fetchCategorias = useCallback(async (page: number, search: string = '') => {
    setLoading(true)
    try {
      const url = `/api/nextsteps/categorias?page=${page}&limit=12${search ? `&search=${encodeURIComponent(search)}` : ''}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setCategorias(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchCategorias(1, searchTerm)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchCategorias, searchTerm])

  const handleSearch = (termo: string) => {
    setSearchTerm(termo)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const response = await fetch(`/api/nextsteps/categorias/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        fetchCategorias(pagination.currentPage, searchTerm)
      } else {
        alert(result.error || 'Erro ao excluir categoria')
      }
    } catch (error) {
      alert('Erro ao excluir categoria')
    }
  }

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      fetchCategorias(pagination.nextPage!, searchTerm)
    }
  }

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      fetchCategorias(pagination.prevPage!, searchTerm)
    }
  }

  const handleStatusChange = (categoriaId: number, newBool: boolean, toggle: string) => {
    setCategorias(prev => 
      prev.map(categoria => 
        categoria.id === categoriaId 
          ? { 
              ...categoria, 
              ...(toggle === 'istrend' && { isTrend: newBool })
            }
          : categoria
      )
    );
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-white">Gerenciar Categorias</h1>
            <p className="mt-1 text-gray-400">Crie, edite e remova as categorias da sua p&aacute;gina</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
            <div className="w-full sm:max-w-xs lg:w-[280px]">
              <SearchBarNxt
                onSearch={handleSearch}
                placeholder="Buscar por nome ou descrição..."
              />
            </div>

            <Link
              href="/nextsteps/categorias/novo"
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 whitespace-nowrap"
            >
              + Nova Categoria
            </Link>
          </div>
        </div>

        {/* Indicador de Busca */}
        {searchTerm && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white">
                  Resultados para: <strong>&quot;{searchTerm}&quot;</strong>
                </span>
                <span className="text-gray-400 ml-4">
                  {pagination.totalItems} categoria(s) encontrada(s)
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

        {/* Grid de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-white font-semibold text-lg">
                  {categoria.nome || categoria.name || 'Sem nome'}
                </h3>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  {categoria._count.conteudos} conteúdo(s)
                </span>
              </div>

              {categoria.descricao && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {categoria.descricao}
                </p>
              )}

              {/* Nomes em ambas as línguas */}
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                {categoria.nome && categoria.name && (
                  <>
                    <div>PT: {categoria.nome}</div>
                    <div>EN: {categoria.name}</div>
                  </>
                )}
                {categoria.nome && !categoria.name && (
                  <div>PT: {categoria.nome}</div>
                )}
                {!categoria.nome && categoria.name && (
                  <div>EN: {categoria.name}</div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                <span className={`text-xs font-medium ${
                  categoria.isTrend ? 'text-orange-400' : 'text-gray-400'
                }`}>
                  {categoria.isTrend ? '🔥 Trend' : 'Normal'}
                </span>
                <ToggleStatus
                  id={categoria.id}
                  status={categoria.isTrend}
                  type="categorias"
                  onStatusChange={(newStatus) => {
                    handleStatusChange(categoria.id, newStatus, 'istrend');
                  }}
                  toggle={'istrend'}                />
              </div>
              {/* Ações */}
              <div className="flex gap-2">
                <Link
                  href={`/nextsteps/categorias/editar/${categoria.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded transition-colors text-sm"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(categoria.id)}
                  disabled={categoria._count.conteudos > 0}
                  className={`flex-1 py-2 rounded transition-colors text-sm ${
                    categoria._count.conteudos > 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  title={
                    categoria._count.conteudos > 0
                      ? 'Não é possível excluir categoria com conteúdos'
                      : 'Excluir categoria'
                  }
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Estados Vazios */}
        {!loading && categorias.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            {searchTerm ? (
              <>
                <p className="text-xl">Nenhum resultado encontrado</p>
                <p className="mt-2">Tente alterar os termos da busca</p>
                <button
                  onClick={() => handleSearch('')}
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  Limpar busca
                </button>
              </>
            ) : (
              <>
                <p className="text-xl">Nenhuma categoria encontrada</p>
                <p className="mt-2">Crie sua primeira categoria para começar</p>
                <Link
                  href="/nextsteps/categorias/novo"
                  className="mt-4 inline-block px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Criar Primeira Categoria
                </Link>
              </>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        )}

       {pagination.totalPages > 1 && (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={handlePrevPage}
        disabled={!pagination.hasPrevPage}
        className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        Anterior
      </button>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-white">
          Página {pagination.currentPage} de {pagination.totalPages}
        </span>
        <span className="text-gray-400">
          ({pagination.totalItems} itens)
        </span>
      </div>

      <button
        onClick={handleNextPage}
        disabled={!pagination.hasNextPage}
        className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        Próxima
      </button>
    </div>
  )}

      </div>
    </div>
  )
}
