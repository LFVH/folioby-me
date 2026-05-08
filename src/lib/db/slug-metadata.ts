import { isFileLikeUserSlug } from '@/lib/user-slug'

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}

export async function getPortfolioBySlug(slug: string) {
  try {
    if (isFileLikeUserSlug(slug)) {
      return { categorias: [] }
    }

    const baseUrl = getBaseUrl()
    
    const response = await fetch(`${baseUrl}/api/letsgo/categorias?slug=${encodeURIComponent(slug)}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return { categorias: [] }
    }
    
    const result = await response.json()
    const categorias = Array.isArray(result.data) ? result.data : []
    const categoriasProcessadas = categorias.map((categoria: any) => ({
      ...categoria,
      conteudos: categoria.conteudos.map((conteudo: any) => ({
        ...conteudo,
        url: conteudo.link || `/api/letsgo/conteudos/${conteudo.id}`
      }))
    }))

    return {
      categorias: categoriasProcessadas,
      userName: result.name,
    }
  } catch (error) {
    console.error('Erro em getCategoriasBySlug:', error)
    return { categorias: [] }
  }
}
