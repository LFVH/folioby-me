// app/sitemap.ts
import { MetadataRoute } from 'next'
import { getValidUserSlugs } from '@/lib/db/slug-service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Busca todos os slugs do banco de dados
  const slugs =  await getValidUserSlugs() // retorna [{ slug: 'joao-silva' }, ...]
  
  // URLs estáticas
  const staticUrls = [
    {
      url: 'https://folioby.com',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: 'https://folioby.com/sobre',
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: 'https://folioby.com/termos-de-uso',
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: 'https://folioby.com/politica-privacidade',
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]
  
  // URLs dinâmicas dos portfólios
  const portfolioUrls = slugs.map((slug) => ({
    url: `https://folioby.com/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const, // portfólios podem mudar com frequência
    priority: 0.9,
  }))
  
  return [...staticUrls, ...portfolioUrls]
}