'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import SearchBarNxt from '@/components/SearchBarNxt'
import { ToggleStatus } from '@/components/ToggleStatus'
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
    prevPage: null
  })

  useEffect(() => {
    fetchConteudos(1, searchTerm)
  }, [searchTerm])

  const fetchConteudos = async (page: number, search: string = '') => {
    setLoading(true)
    scrollToTop();
    try {
      const url = `/api/nextsteps/conteudo?page=${page}&limit=12${search ? `&search=${encodeURIComponent(search)}` : ''}`
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        setConteudos(result.data)
        setPagination(result.pagination)
      }
    } catch (error) {
      console.error('Error loading contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (termo: string) => {
    setSearchTerm(termo)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete?')) return

    try {
      const response = await fetch(`/api/nextsteps/conteudo/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        fetchConteudos(pagination.currentPage, searchTerm)
      } else {
        alert(result.error || 'Error on delete')
      }
    } catch (error) {
      alert('Error on delete')
    }
  }

  const handleStatusChange = (conteudoId: number, newBool: boolean, toggle: string) => {
    setConteudos(prev => 
      prev.map(conteudo => 
        conteudo.id === conteudoId 
          ? { 
              ...conteudo, 
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
            <h1 className="text-3xl font-bold text-white">Manage Contents</h1>
            <p className="text-gray-400 mt-1">Insert, edit or delete contents that appear on your page</p>
          </div>
          
          <div className="flex items-center gap-4">
            <SearchBarNxt 
              onSearch={handleSearch}
              placeholder="Search by name, file or categor..."
            />
            
            <Link
              href="/nextsteps/contents/new"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors whitespace-nowrap"
            >
              + New Content
            </Link>
          </div>
        </div>

        {searchTerm && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white">
                  Results to: <strong>"{searchTerm}"</strong>
                </span>
                <span className="text-gray-400 ml-4">
                  {pagination.totalItems} content(s) found
                </span>
              </div>
              <button
                onClick={() => handleSearch('')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Clean up search
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
                <img
                  src={conteudo.link || `/api/nextsteps/conteudo/${conteudo.id}`}
                  alt={conteudo.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">
                      {conteudo.name || 'No name'}
                    </h3>
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
                      {categoria.name}
                    </span>
                  ))}
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Link
                    href={`/nextsteps/contents/edit/${conteudo.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded transition-colors text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(conteudo.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors text-sm"
                  >
                    Delete
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
                <p className="text-xl">No results found</p>
                <p className="mt-2">Try changing search terms</p>
                <button
                  onClick={() => handleSearch('')}
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  Clean up search
                </button>
              </>
            ) : (
              <>
                <p className="text-xl">No contents found</p>
                <p className="mt-2">Insert your first content to begin </p>
                <Link
                  href="/nextsteps/contents/new"
                  className="mt-4 inline-block px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Insert your content
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
      Previous
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
      Next
    </button>
  </div>
}
