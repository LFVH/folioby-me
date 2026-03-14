// app/[slug]/FlixClient.tsx
'use client'

import { useGlobalFilter } from '@/hooks/useGlobalFilter'
import HeroBanner from '@/components/HeroBanner'
import ConteudosFiltradosComScroll from '@/components/letsgo/ConteudosFiltrados'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useCategorias } from '@/hooks/useCategorias' // ✅ SEU HOOK ORIGINAL!

interface FlixClientProps {
  slug: string
}

export default function FlixClient({ slug }: FlixClientProps) {
  // ✅ USA O HOOK NORMALMENTE!
  // Os dados já vêm pré-carregados do servidor via HydrationBoundary
  const { data, isLoading } = useCategorias(slug)
  
  const { filtroAtivo, tipoFiltro, termoPesquisa } = useGlobalFilter()
  const categorias = data?.categorias || []

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <main className="">
      <HeroBanner 
        categorias={categorias}
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