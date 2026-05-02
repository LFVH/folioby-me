// app/[slug]/page.tsx
import { Metadata } from 'next'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import Script from 'next/script'
import FlixClient from './FlixClient'
import { getPortfolioBySlug } from '@/lib/db/slug-metadata'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await getPortfolioBySlug(slug)
  const userName = data.userName || slug

  return {
    title: `${userName} - Portfólio Profissional | FolioBy`,
    description: `Explore o portfólio de ${userName}. Veja trabalhos de edição, motion design e criatividade.`,
    openGraph: {
      title: `${userName} - Portfólio Criativo`,
      description: `Conheça o trabalho de ${userName} no FolioBy`,
      images: ['https://folioby.com/og-image.jpg'],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${userName} - Portfólio`,
      description: `Veja o portfólio de ${userName}`,
    },
  }
}

export default async function FlixPage({ params }: PageProps) {
  const { slug } = await params
  const queryClient = new QueryClient()
  const data = await queryClient.fetchQuery({
    queryKey: ['categorias', slug],
    queryFn: () => getPortfolioBySlug(slug),
  })

  const userName = data.userName || slug
  const categorias = data.categorias || []
  const todosConteudos = categorias.flatMap((cat: any) => cat.conteudos || [])

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: userName,
      description: `Portfólio profissional de ${userName}`,
      identifier: slug,
    },
  }

  if (todosConteudos.length > 0) {
    Object.assign(schemaData.mainEntity, {
      hasPart: todosConteudos.slice(0, 10).map(
        (
          conteudo: { titulo: string; descricao: string; thumbnail: string; url: string },
          index: number
        ) => ({
          '@type': 'CreativeWork',
          name: conteudo.titulo,
          description: conteudo.descricao,
          image: conteudo.thumbnail,
          url: conteudo.url,
          position: index + 1,
        })
      ),
    })
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'FolioBy',
        item: 'https://folioby.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: userName,
        item: `https://folioby.com/${slug}`,
      },
    ],
  }

  return (
    <>
      <Script
        id="schema-person"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <Script
        id="schema-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <HydrationBoundary state={dehydrate(queryClient)}>
        <FlixClient slug={slug} />
      </HydrationBoundary>
    </>
  )
}
