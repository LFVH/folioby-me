// app/[slug]/page.tsx
import { Metadata } from 'next'
import FlixClient from './FlixClient'
import { getCategoriasBySlug } from '@/lib/db/slug-metadata'

// Busca os dados no servidor para gerar metadata
async function getData(slug: string) {
  try {
    // Esta função deve buscar os dados do banco diretamente (sem hooks)
    const data = await getCategoriasBySlug(slug)
    return data
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    return { categorias: [] }
  }
}

// generateMetadata - AGORA FUNCIONA porque não tem 'use client'
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const slug = (await params).slug
  const data = await getData(slug)
  const primeiraCategoria = data.categorias?.[0]
  
  // Título dinâmico baseado no slug/categoria
  const titulo = primeiraCategoria?.nome 
    ? `${primeiraCategoria.nome} - FolioBy`
    : `Portfólios de ${slug} - FolioBy`
  
  const descricao = `Explore os melhores portfólios de ${slug}. Encontre trabalhos incríveis de editores e criativos.`
  
  return {
    title: titulo,
    description: descricao,
    openGraph: {
      title: titulo,
      description: descricao,
      images: ['/og-image.jpg'], // imagem padrão ou dinâmica
    },
  }
}

// Server Component principal
export default async function FlixPage({ params }: { params: { slug: string } }) {
  const data = await getData(params.slug)
  const categorias = data.categorias || []
  
  // Passa os dados para o Client Component
  // Como é Server Component, NÃO tem 'use client' aqui
  return <FlixClient 
    categorias={categorias} 
    slug={params.slug}
  />
}