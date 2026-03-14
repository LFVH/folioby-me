export async function getPortfolioBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/letsgo/categorias?slug=${encodeURIComponent(slug)}`, {
      // para dados frescos no servidor cache: 'no-cache',
      next: { revalidate: 60 }
    })
    
    if (!response.ok) {
      return { categorias: [] }
    }
    
    const result = await response.json()
    const categoriasProcessadas = result.data.map((categoria: any) => ({
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