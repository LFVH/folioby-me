// app/[slug]/FlixClient.tsx
'use client' // ✅ AGORA PODE!

import { useGlobalFilter } from '@/hooks/useGlobalFilter'
import HeroBanner from '@/components/HeroBanner'
import ConteudosFiltradosComScroll from '@/components/letsgo/ConteudosFiltrados'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useEffect, useState } from 'react'

// Interface para as props (TypeScript)
interface FlixClientProps {
  categorias: any[] // Substitua 'any' pelo tipo correto
  slug: string
}

export default function FlixClient({ categorias, slug }: FlixClientProps) {
  // Estado local para controle de loading (se necessário)
  const [isLoading, setIsLoading] = useState(false)
  
  // Hooks client-side
  const { filtroAtivo, tipoFiltro, termoPesquisa } = useGlobalFilter()
  
  // Se você precisar fazer mais chamadas API no cliente
  useEffect(() => {
    // Exemplo: buscar dados adicionais baseados no slug
    // setIsLoading(true)
    // buscarMaisDados(slug).then(...)
  }, [slug])
  
  // Se ainda estiver carregando (dados iniciais já vieram do servidor)
  // Isso é útil se você precisar buscar mais dados no cliente
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