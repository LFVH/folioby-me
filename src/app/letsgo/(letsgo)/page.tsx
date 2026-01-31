'use client'

import { useGlobalFilter } from '@/hooks/useGlobalFilter'
import HeroBanner from '@/components/HeroBanner'
import ConteudosFiltradosComScroll from '@/components/letsgo/ConteudosFiltrados'
import LoadingSpinner from '@/components/LoadingSpinner'
import HeaderWithCategories from '@/components/letsgo/HeaderWithCategories'
import { useCategorias } from '@/hooks/useCategorias'

export default function DirectorPage() {
  const { data, isLoading: bannerLoading } = useCategorias()
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