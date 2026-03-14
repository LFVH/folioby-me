// app/[slug]/page.tsx
import { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import FlixClient from './FlixClient'
import Script from 'next/script'
import { getPortfolioBySlug } from '@/lib/db/slug-metadata'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getPortfolioBySlug(params.slug)
  const primeiraCategoria = data.categorias?.[0]
  const userName = data.userName || params.slug
  
  return {
    title: `${userName} - Portfólio Profissional | FolioBy`,
    description: `Explore o portfólio de ${userName}. Veja trabalhos de edição, motion design e criatividade.`,
    openGraph: {
      title: `${userName} - Portfólio Criativo`,
      description: `Conheça o trabalho de ${userName} no FolioBy`,
      images: ['https://folioby.com/og-image.jpg'], // Ideal: imagem do usuário
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${userName} - Portfólio`,
      description: `Veja o portfólio de ${userName}`,
    }
  }
}

export default async function FlixPage({ params }: { params: { slug: string } }) {
  const queryClient = new QueryClient()
  const data = await queryClient.fetchQuery({
    queryKey: ['categorias', params.slug],
    queryFn: () => getPortfolioBySlug(params.slug),
  })
  
  const userName = data.userName || params.slug
  const categorias = data.categorias || []
  
  // Extrair todos os projetos/trabalhos para o Schema
  const todosConteudos = categorias.flatMap((cat: any) => cat.conteudos || [])
  
  // ============================================
  // SCHEMA.ORG - DADOS MÍNIMOS ESSENCIAIS
  // ============================================
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage', // Tipo principal: Página de Perfil
    mainEntity: {
      '@type': 'Person', // A entidade principal é uma Pessoa
      name: userName,
      description: `Portfólio profissional de ${userName}`,
      
      // DADOS MÍNIMOS (já ajudam muito):
      identifier: params.slug, // identificador único
      
      // -------------------------------------------------
      // DADOS OPCIONAIS (implemente se tiver):
      // -------------------------------------------------
      // image: data.avatarUrl, // Foto do perfil
      // jobTitle: data.profissao, // Ex: "Editor de Vídeo", "Motion Designer"
      // worksFor: data.empresa, // Se trabalhar para alguma empresa
      // sameAs: [ // Redes sociais
      //   data.instagram,
      //   data.linkedin,
      //   data.behance
      // ].filter(Boolean),
      // -------------------------------------------------
    }
  }
  
  // SCHEMA ENRIQUECIDO (se houver projetos)
  if (todosConteudos.length > 0) {
    // Adiciona os projetos como "itemList" ou "creativeWork"
    Object.assign(schemaData.mainEntity, {
      hasPart: todosConteudos.slice(0, 10).map((conteudo: { titulo: any; descricao: any; thumbnail: any; url: any }, index: number) => ({
        '@type': 'CreativeWork', // ou 'ImageObject', 'VideoObject'
        name: conteudo.titulo,
        description: conteudo.descricao,
        image: conteudo.thumbnail,
        url: conteudo.url,
        position: index + 1,
        
        // -------------------------------------------------
        // DADOS OPCIONAIS POR PROJETO:
        // -------------------------------------------------
        // dateCreated: conteudo.dataCriacao,
        // keywords: conteudo.tags?.join(', '),
        // -------------------------------------------------
      }))
    })
  }
  
  // SCHEMA PARA BREADCRUMB (navegação)
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'FolioBy',
        item: 'https://folioby.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: userName,
        item: `https://folioby.com/${params.slug}`
      }
    ]
  }

  return (
    <>
      {/* Schema.org Principal */}
      <Script
        id="schema-person"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      {/* Schema de Navegação (ajuda o Google a entender a estrutura) */}
      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <HydrationBoundary state={dehydrate(queryClient)}>
        <FlixClient slug={params.slug} />
      </HydrationBoundary>
    </>
  )
}