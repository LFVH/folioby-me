'use client'

import { useGlobalFilter } from '@/hooks/useGlobalFilter'
import HeroBanner from '@/components/HeroBanner'
import ConteudosFiltradosComScroll from '@/components/letsgo/ConteudosFiltrados'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useCategorias } from '@/hooks/useCategorias'
import { useParams } from 'next/navigation'

export default function FlixPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data, isLoading: bannerLoading } = useCategorias(slug)
  const { filtroAtivo, tipoFiltro, termoPesquisa } = useGlobalFilter()
  const categorias = data?.categorias || []
  const nrCategoriasBloq = data?.estatisticas
  if (bannerLoading) {
    return <LoadingSpinner />
  }
  return (
      <main className="">
        <HeroBanner 
          categorias={categorias || []}
          categoriaFiltrada={tipoFiltro === 'categoria' ? filtroAtivo : null}
        />
        
        <ConteudosFiltradosComScroll 
          categorias={categorias || []}
          filtroAtivo={filtroAtivo}
          tipoFiltro={tipoFiltro}
          termoPesquisa={termoPesquisa}
          nrCategoriasBloq={nrCategoriasBloq}
        />
      </main>
  )
}