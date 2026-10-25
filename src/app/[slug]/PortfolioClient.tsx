// app/[slug]/PortfolioClient.tsx
'use client'

import { useGlobalFilter } from '@/hooks/useGlobalFilter'
import ConteudosFiltradosComScroll from '@/components/letsgo/ConteudosFiltrados'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useCategorias } from '@/hooks/useCategorias'
import HeroBanner from '@/components/letsgo/HeroBanner'

interface PortfolioClientProps {
  slug: string
}

export default function PortfolioClient({ slug }: PortfolioClientProps) {
  const { data, isLoading } = useCategorias(slug)
  
  const { filtroAtivo, tipoFiltro, termoPesquisa } = useGlobalFilter()
  const categorias = data?.categorias || []

  if (isLoading) {
    return <LoadingSpinner />
  }

  const ownerName = data?.userName || slug

  return (
    <main className="">
      <h1 className="sr-only">Portfólio de {ownerName}</h1>
      <HeroBanner 
        categorias={categorias}
        ownerName={ownerName}
        categoriaFiltrada={tipoFiltro === 'categoria' ? filtroAtivo : null}
      />
      
      <ConteudosFiltradosComScroll 
        categorias={categorias}
        filtroAtivo={filtroAtivo}
        tipoFiltro={tipoFiltro}
        termoPesquisa={termoPesquisa}
      />
    </main>
  )
}