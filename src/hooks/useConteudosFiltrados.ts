import { useState, useEffect, useRef } from 'react'
import { CategoriaWithUrls } from '@/types'

interface UseConteudosFiltradosProps {
  categorias: CategoriaWithUrls[]
  filtroAtivo: string | null
  tipoFiltro: 'categoria' | 'search' | null
  termoPesquisa: string
}

export const useConteudosFiltrados = ({ 
  categorias, 
  filtroAtivo, 
  tipoFiltro, 
  termoPesquisa 
}: UseConteudosFiltradosProps) => {
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<CategoriaWithUrls[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const lastFilterRef = useRef({ filtroAtivo, tipoFiltro, termoPesquisa })

  

const getCategoriasPaginadas = (categoriasParaFiltrar: CategoriaWithUrls[], pageNum: number = 1) => {
    if (!filtroAtivo) {
      const limit = 3
      const startIndex = 0 
      const endIndex = pageNum * limit
            
      const categoriasPaginas = categoriasParaFiltrar.slice(0, endIndex)
      const temMais = endIndex < categoriasParaFiltrar.length
      
      return {
        categorias: categoriasPaginas,
        hasMore: temMais
      }
    }

    if (tipoFiltro === 'categoria') {
      const categoriaFiltrada = categoriasParaFiltrar.find(c => c.id === filtroAtivo)    
      return {
        categorias: categoriaFiltrada ? [categoriaFiltrada] : [],
        hasMore: false
      }
    }

    if (tipoFiltro === 'search') {
      const termoLower = termoPesquisa.toLowerCase()
      
      const categoriasComBusca = categoriasParaFiltrar.map(categoria => ({
        ...categoria,
        conteudos: categoria.conteudos.filter(conteudo => 
          conteudo.nome?.toLowerCase().includes(termoLower) ||
          conteudo.name?.toLowerCase().includes(termoLower) ||
          conteudo.filename.toLowerCase().includes(termoLower) ||
          categoria.nome?.toLowerCase().includes(termoLower) ||
          categoria.name?.toLowerCase().includes(termoLower)
        )
      })).filter(categoria => categoria.conteudos.length > 0)

      return {
        categorias: categoriasComBusca,
        hasMore: false
      }
    }

    return {
      categorias: categoriasParaFiltrar,
      hasMore: false
    }
  }

  const loadMore = async () => {
    if (loading || !hasMore || filtroAtivo) {
      return
    }
    setLoading(true)    
    try {
      setTimeout(() => {
        const result = getCategoriasPaginadas(categorias, page + 1)
        setCategoriasFiltradas(result.categorias)
        setHasMore(result.hasMore)
        setPage(prev => prev + 1)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('❌ Erro ao carregar mais categorias:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtersChanged = 
      lastFilterRef.current.filtroAtivo !== filtroAtivo ||
      lastFilterRef.current.tipoFiltro !== tipoFiltro ||
      lastFilterRef.current.termoPesquisa !== termoPesquisa

    if (!filtersChanged && categoriasFiltradas.length > 0) {
      return
    }

    lastFilterRef.current = { filtroAtivo, tipoFiltro, termoPesquisa }
    
    setLoading(true)
    setPage(1)

    const result = getCategoriasPaginadas(categorias, 1)
    setCategoriasFiltradas(result.categorias)
    setHasMore(result.hasMore)
    setLoading(false)
  }, [categorias, filtroAtivo, tipoFiltro, termoPesquisa])

  return { 
    categoriasFiltradas, 
    loadMore, 
    hasMore, 
    loading,
    filtroAtivo,
    tipoFiltro 
  }
}

