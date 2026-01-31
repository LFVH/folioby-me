import { create } from 'zustand'

interface GlobalFilterState {
  filtroAtivo: string | null
  tipoFiltro: 'categoria' | 'search' | null
  termoPesquisa: string
  setFiltroCategoria: (categoriaId: string | null) => void
  setFiltroPesquisa: (termo: string) => void
  limparFiltros: () => void
}

export const useGlobalFilter = create<GlobalFilterState>((set, get) => ({
  filtroAtivo: null,
  tipoFiltro: null,
  termoPesquisa: '',
  
  setFiltroCategoria: (categoriaId) => {
    set({ 
      filtroAtivo: categoriaId,
      tipoFiltro: categoriaId ? 'categoria' : null,
      termoPesquisa: ''
    })
  },
  
  setFiltroPesquisa: (termo) => {
    set({ 
      termoPesquisa: termo,
      filtroAtivo: termo ,
      tipoFiltro: termo ? 'search' : null
    })
  },
  
  limparFiltros: () => {
    set({ 
      filtroAtivo: null,
      tipoFiltro: null,
      termoPesquisa: ''
    })
  },
}))