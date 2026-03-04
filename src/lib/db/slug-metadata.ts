// lib/api.ts
// Funções que podem ser chamadas TANTO no servidor quanto no cliente

// Esta função funciona no servidor (para metadata)
export async function getCategoriasBySlug(slug: string) {
  // Aqui você faz a chamada direta ao banco de dados
  // ou para uma API interna
  try {
    // Exemplo com fetch (se tiver API interna)
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categorias/${slug}`, {
      // Importante: cache para não fazer muitas requisições
      next: { revalidate: 3600 } // revalida a cada hora
    })
    
    if (!response.ok) {
      return { categorias: [] }
    }
    
    return await response.json()
  } catch (error) {
    console.error('Erro em getCategoriasBySlug:', error)
    return { categorias: [] }
  }
}

// Versão para uso no cliente (se precisar)
export async function getCategoriasBySlugClient(slug: string) {
  const response = await fetch(`/api/categorias/${slug}`)
  return response.json()
}