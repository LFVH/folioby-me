'use client'

import { useEffect, useRef } from 'react'
import { CategoriaWithUrls } from '@/types'
import { useConteudosFiltrados } from '@/hooks/useConteudosFiltrados'
import CarrosselCategoria from './CarrosselCategoria'
import { useGlobalFilter } from '@/hooks/useGlobalFilter'
import Link from 'next/link'

interface ConteudosFiltradosProps {
  categorias: CategoriaWithUrls[]
  filtroAtivo: string | null
  tipoFiltro: 'categoria' | 'search' | null
  termoPesquisa: string
  nrCategoriasBloq?: number | undefined
}

export default function ConteudosFiltradosComScroll({ 
  categorias, 
  filtroAtivo, 
  tipoFiltro, 
  termoPesquisa,
  nrCategoriasBloq
}: ConteudosFiltradosProps) {
  const { limparFiltros } = useGlobalFilter()
  const { 
    categoriasFiltradas, 
    loadMore, 
    hasMore, 
    loading 
  } = useConteudosFiltrados({
    categorias,
    filtroAtivo,
    tipoFiltro,
    termoPesquisa
  })

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const shouldUseListLayout = categoriasFiltradas.length === 1 && 
    (tipoFiltro === 'categoria' || tipoFiltro === 'search')

  useEffect(() => {
    if (filtroAtivo || !hasMore || loading) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [hasMore, loading, loadMore, filtroAtivo])

  if (!loading && categoriasFiltradas.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-xl mb-4">
          {tipoFiltro === 'search' 
            ? `Nenhum resultado encontrado para "${termoPesquisa}"`
            : tipoFiltro === 'categoria'
            ? 'Nenhum conteúdo encontrado nesta categoria.'
            : 'Nenhuma categoria encontrada.'
          }
        </p>
        {filtroAtivo && (
          <button
            onClick={limparFiltros}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Ver Tudo
          </button>
        )}
      </div>
    )
  }

    const LockedCategoriaIndicator = ({ count }: { count: number }) => (
    <Link href="/" >
    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center z-10">
      <div className="text-center text-white">
        <svg 
          className="w-12 h-12 mx-auto mb-2 opacity-80" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
            clipRule="evenodd" 
          />
        </svg>
        <div className="text-lg font-semibold">
          +{count} categoria{count > 1 ? 's' : ''}
        </div>
        <div className="text-sm opacity-90">Disponível para premium</div>
      </div>
    </div>
    </Link>
  )

  return (
    <section className="py-8 space-y-12">
      {tipoFiltro === 'search' && categoriasFiltradas.length > 0 && (
        <div className="px-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Resultados para "{termoPesquisa}"
          </h2>
          <p className="text-gray-400">
            {categoriasFiltradas.reduce((total, cat) => total + cat.conteudos.length, 0)} 
            conteúdo(s) encontrado(s)
          </p>
        </div>
      )}

      {categoriasFiltradas.map((categoria, index) => (
        <CarrosselCategoria 
          key={`${categoria.id}-${index}-${tipoFiltro}-${filtroAtivo}`}
          categoria={categoria}
          layout={shouldUseListLayout ? 'lista' : 'carrossel'} 
        />
      ))}
      
      {/* Loading e Scroll Infinito */}
      {filtroAtivo ? (
        loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        )
      ) : (
        <>
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          )}
          
          {hasMore && !loading && (
            <div ref={loadMoreRef} className="h-4"></div>
          )}
        </>
      )}
      {nrCategoriasBloq && nrCategoriasBloq>0 &&(
        <div className="relative rounded-lg overflow-hidden bg-gray-800/30 border-2 border-dashed border-gray-600/50 min-h-[200px]">
          <LockedCategoriaIndicator count={nrCategoriasBloq} />
        </div>
      )}
      {!hasMore && categoriasFiltradas.length > 0 && !filtroAtivo && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            OK Let's go.
          </p>
        </div>
      )}
    </section>
  )
}