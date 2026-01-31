'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SearchBarNxt from '@/components/SearchBarNxt'
import { ToggleStatus } from '@/components/ToggleStatus'

interface Conteudo {
  isTrend: boolean
  id: number
  nome: string
  name: string
  filename: string
  mimetype: string
  link?: string
  linkext?: string
  isFree: boolean
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
    prevPage: null
  })

  useEffect(() => {
    fetchConteudos(1, searchTerm)
  }, [searchTerm])

  const fetchConteudos = async (page: number, search: string = '') => {
    setLoading(true)
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
  }

  const handleSearch = (termo: string) => {
    setSearchTerm(termo)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este conteúdo?')) return

    try {
      const response = await fetch(`/api/nextsteps/conteudo/${id}`, {
        method: 'DELETE'
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

  const handleStatusChange = (conteudoId: number, newBool: boolean, toggle: string) => {
    setConteudos(prev => 
      prev.map(conteudo => 
        conteudo.id === conteudoId 
          ? { 
              ...conteudo, 
              ...(toggle === 'isfree' && { isFree: newBool }),
              ...(toggle === 'istrend' && { isTrend: newBool })
            }
          : conteudo
      )
    );
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Gerenciar Conteúdos</h1>
            <p className="text-gray-400 mt-1">Painel administrativo</p>
          </div>
          
          <div className="flex items-center gap-4">
            <SearchBarNxt 
              onSearch={handleSearch}
              placeholder="Buscar por nome, arquivo ou categoria..."
            />
            
            <Link
              href="/nextsteps/conteudos/novo"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
            >
              + Novo Conteúdo
            </Link>
          </div>
        </div>

        {searchTerm && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white">
                  Resultados para: <strong>"{searchTerm}"</strong>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {conteudos.map((conteudo) => (
            <div key={conteudo.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="h-48 bg-gray-900 flex items-center justify-center">
                <img
                  src={conteudo.link || `/api/nextsteps/conteudo/${conteudo.id}`}
                  alt={conteudo.nome}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">
                      {conteudo.nome || conteudo.name || 'Sem nome'}
                    </h3>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                    <span className={`text-xs font-medium ${
                      conteudo.isFree ? 'text-green-400' : 'text-purple-400'
                    }`}>
                      {conteudo.isFree ? '🎁 Gratuito' : '💎 Pago'}
                    </span>
                    <ToggleStatus
                      id={conteudo.id}
                      status={conteudo.isFree}
                      type="conteudo"
                      onStatusChange={(newStatus) => {
                        handleStatusChange(conteudo.id, newStatus, 'isfree');
                      }}
                      toggle={'isfree'}                    />
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                    <span className={`text-xs font-medium ${
                      conteudo.isTrend ? 'text-orange-400' : 'text-gray-400'
                    }`}>
                      {conteudo.isTrend ? '🔥 Trend' : 'Normal'}
                    </span>
                    <ToggleStatus
                      id={conteudo.id}
                      status={conteudo.isTrend}
                      type="conteudo"
                      onStatusChange={(newStatus) => {
                        handleStatusChange(conteudo.id, newStatus, 'istrend');
                      }}
                      toggle={'istrend'}                    />
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-3 truncate">
                  {conteudo.filename}
                </p>

                {/* Link externo */}
                {conteudo.linkext && (
                  <div className="mb-3">
                    <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                      Link: {conteudo.linkext}
                    </span>
                  </div>
                )}
    
                {/* Categorias */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {conteudo.categorias.map((categoria) => (
                    <span
                      key={categoria.id}
                      className="bg-gray-700 text-white text-xs px-2 py-1 rounded"
                    >
                      {categoria.nome}
                    </span>
                  ))}
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Link
                    href={`/nextsteps/conteudos/editar/${conteudo.id}`}
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

        {/* ESTADOS VAZIOS */}
        {!loading && conteudos.length === 0 && (
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
                <p className="text-xl">Nenhum conteúdo encontrado</p>
                <p className="mt-2">Crie seu primeiro conteúdo para começar</p>
                <Link
                  href="/nextsteps/conteudos/novo"
                  className="mt-4 inline-block px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Criar Primeiro Conteúdo
                </Link>
              </>
            )}
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        )}

         {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => fetchConteudos(pagination.prevPage!, searchTerm)}
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
            onClick={() => fetchConteudos(pagination.nextPage!, searchTerm)}
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