'use client'

import { useState, useRef, useEffect } from 'react'
import { useCategorias } from '@/hooks/useCategorias'
import { useGlobalFilter } from '@/hooks/useGlobalFilter'
import SearchBar from './SearchBar'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { scrollToTop } from '@/lib/utils'
import { useRouter, usePathname } from 'next/navigation'

export default function HeaderWithCategories() {
  const params = useParams()
  const slug = params.slug as string
  const { data, isLoading } = useCategorias(slug)
  const router = useRouter()
  const pathname = usePathname()
  const { 
    filtroAtivo, 
    tipoFiltro, 
    termoPesquisa,
    setFiltroCategoria, 
    setFiltroPesquisa, 
    limparFiltros 
  } = useGlobalFilter()
  const categorias = data?.categorias || []
  const userName = data?.userName || ""
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && filtroAtivo) {
        limparFiltros();
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [filtroAtivo])

  const categoriasPrincipais = categorias?.slice(0, 4) || []
  const categoriasRestantes = categorias?.slice(4) || []

  const handleCategoriaClick = (categoriaId: string) => {
    if (pathname !== `/${slug}`) {
      router.push(`/${slug}`)
    }
    if (filtroAtivo === categoriaId && tipoFiltro === 'categoria') {
      limparFiltros()
    } else {
      setFiltroCategoria(categoriaId)
    }
    setIsDropdownOpen(false)
  }

  const handleInicioClick = () => {
    scrollToTop()
    limparFiltros()
  }

  const handleProfileClick = () => {
    limparFiltros()
  }

  const handleSearch = (termo: string) => {
    setFiltroPesquisa(termo)
  }

  const handleClearSearch = () => {
    limparFiltros()
  }

  const handleClearAllFilters = () => {
    limparFiltros()
  }

  if (isLoading) {
    return (
      <header className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent p-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
          <Link href={`/`} className="flex items-center space-x-2">
            <div className="text-red-600 font-bold tracking-tight">
              <h1 className="text-red-600 text-xl sm:text-2xl font-bold truncate">FolioBy</h1>
            </div>
          </Link>
            <nav className="hidden md:flex gap-4">
              <span className="text-gray-400">Carregando...</span>
            </nav>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-7 w-full z-50 bg-gradient-to-b from-black to-transparent">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Link href={`/`} className="flex items-center space-x-2">
              <div className="text-red-600 font-bold tracking-tight">
                <h1 className="text-red-600 text-xl sm:text-2xl font-bold truncate">FolioBy</h1>
              </div>
            </Link>
        
            <nav className="hidden md:flex items-center gap-4 flex-wrap min-w-0">
              <Link
                className="text-gray-300 hover:text-white transition-colors duration-200 font-bold"
                href={`/${slug}/profile`}
                key={userName}
                onClick={handleProfileClick}
              >
                {userName?.split(' ')[0] + (userName?.split(' ')[1] ? userName?.split(' ')[1] : '') + "'s  Profile" || 'Usuário'}
              </Link>
              <Link
                className="text-gray-300 hover:text-white transition-colors duration-200 font-bold"
                href={`/${slug}/profile#links`}
                key={`${userName}+${userName.substring(2)}`}
                onClick={handleProfileClick}
              >
              Contact
              </Link>
              <Link
                className= "text-gray-300 hover:text-white transition-colors duration-200 text-lg font-light tracking-[0.3em]"
                href={`/${slug}`}
                key={`${userName}H`}
                onClick={handleInicioClick}
              >
                Portfolio
              </Link>
              {categoriasPrincipais.map((categoria) => (
              <div key={categoria.id} className="relative">
                <button
                  onClick={() => handleCategoriaClick(categoria.id)}
                  className={`relative z-10 transition-all duration-300 whitespace-nowrap text-sm px-3 py-1 rounded-full ${
                    filtroAtivo === categoria.id && tipoFiltro === 'categoria'
                      ? 'text-white font-bold bg-red-600 shadow-lg shadow-red-500/30'
                      : categoria.isTrend
                        ? 'text-white font-semibold bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-105'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {categoria.name}
                  {categoria.isTrend && (
                    <span className="absolute -top-2 -right-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                      </span>
                    </span>
                  )}
                </button>
                {categoria.isTrend && filtroAtivo !== categoria.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-sm animate-pulse-slow" />
                )}
              </div>
              ))}
              {categoriasRestantes.length > 0 && (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`text-gray-300 hover:text-white transition-colors p-1 ${
                      tipoFiltro === 'categoria' && categoriasRestantes.some(c => c.id === filtroAtivo)
                        ? 'text-white font-semibold underline decoration-red-600'
                        : ''
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-black/90 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                      <div className="px-3 py-2 border-b border-gray-700">
                        <p className="text-white text-sm font-semibold">Todas as Categorias</p>
                      </div>
        
                      <div className="max-h-60 overflow-y-auto">
                        {categoriasRestantes.map((categoria) => (
                          <button
                            key={categoria.id}
                            onClick={() => handleCategoriaClick(categoria.id)}
                            className={`w-full text-left px-3 py-2 text-sm ${
                              filtroAtivo === categoria.id && tipoFiltro === 'categoria'
                                ? 'bg-red-600 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            } transition-colors flex justify-between items-center`}
                          >
                            <span>{categoria.name}</span>
                            <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                              {categoria.conteudos.length}
                            </span>
                          </button>
                        ))}
        
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex-1 sm:flex-none min-w-0">
              <SearchBar
                onSearch={handleSearch}
                value={tipoFiltro === 'search' ? termoPesquisa : ''}
                onClear={handleClearSearch}
              />
            </div>
          </div>
        
        </div>
        {/* Menu Mobile - Categorias */}
        {/* <div className="md:hidden mt-3 overflow-x-auto">
          <nav className="flex gap-3 pb-2 min-w-max">
            <button
              onClick={handleInicioClick}
              className={`${
                !filtroAtivo
                  ? 'text-white font-semibold bg-red-600'
                  : 'text-gray-300 bg-gray-800 hover:bg-gray-700'
              } transition-colors whitespace-nowrap text-sm px-3 py-1 rounded-full`}
            >
              Início
            </button>
            {categorias?.slice(0, 6).map((categoria) => (
              <button
                key={categoria.id}
                onClick={() => handleCategoriaClick(categoria.id)}
                className={`${
                  filtroAtivo === categoria.id && tipoFiltro === 'categoria'
                    ? 'text-white font-semibold bg-red-600'
                    : 'text-gray-300 bg-gray-800 hover:bg-gray-700'
                } transition-colors whitespace-nowrap text-sm px-3 py-1 rounded-full`}
              >
                {categoria.name}
              </button>
            ))}
            {categorias && categorias.length > 6 && (
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-gray-300 bg-gray-800 hover:bg-gray-700 transition-colors text-sm px-3 py-1 rounded-full"
              >
                +
              </button>
            )}
          </nav>
        </div> */}
        {filtroAtivo && (
          <div className="mt-3 flex items-center gap-2 text-sm text-white">
            <span className="whitespace-nowrap">Filtrando por:</span>
            <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-medium truncate max-w-[200px]">
              {tipoFiltro === 'categoria'
                ? categorias?.find(c => c.id === filtroAtivo)?.nome
                : `"${filtroAtivo}"`
              }
            </span>
            <button
              onClick={handleClearAllFilters}
              className="text-gray-400 hover:text-white transition-colors p-1 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
    </header>
  )
}

