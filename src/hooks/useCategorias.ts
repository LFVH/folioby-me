import { useQuery } from '@tanstack/react-query'
import { CategoriaWithUrls } from '@/types'

interface CategoriasData {
  categorias: CategoriaWithUrls[]
  userName?: string
}

export const useCategorias = (slug: string) => {
  return useQuery({
    queryKey: ['categorias',slug],
    queryFn: async (): Promise<CategoriasData> => {
      const response = await fetch(`/api/letsgo/categorias?slug=${encodeURIComponent(slug)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar categorias')
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
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
    enabled: !!slug
  })
}