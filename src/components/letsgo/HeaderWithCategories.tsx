'use client'
import { Menu } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCategorias } from '@/hooks/useCategorias'
import { useGlobalFilter } from '@/hooks/useGlobalFilter'
import SearchBar from './SearchBar'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { scrollToTop } from '@/lib/utils'
import { hasStaticShowcase } from '@/lib/static-profiles'
import { useRouter, usePathname } from 'next/navigation'

// Altura da LoggedBar (borda + py-2 + botão h-10), fixa no topo para o dono logado.
const LOGGED_BAR_OFFSET = 'top-[58px]'
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded'

export default function HeaderWithCategories() {
  const params = useParams()
  const slug = params.slug as string
  const { data } = useCategorias(slug)
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const {
    filtroAtivo,
    tipoFiltro,
    termoPesquisa,
    setFiltroCategoria,
    setFiltroPesquisa,
    limparFiltros,
  } = useGlobalFilter()
  const categorias = data?.categorias || []
  const userName = data?.userName || ''
  const firstNames = userName
    ? userName
        .trim()
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .join(' ')
    : ''
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const loggedBarVisible = Boolean(session?.user?.status)
  // Sem vitrine dinâmica (página estática), busca e categorias não teriam o que filtrar.
  const showcaseFilters = !hasStaticShowcase(slug)

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
        limparFiltros()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [filtroAtivo, limparFiltros])

  const categoriasPrincipais = categorias.slice(0, 4)
  const categoriasRestantes = categorias.slice(4)

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
    setIsMobileCategoriesOpen(false)
  }

  const handleSearch = (termo: string) => {
    if (termo && pathname !== `/${slug}`) {
      router.push(`/${slug}`)
    }
    setFiltroPesquisa(termo)
  }

  const handleInicioClick = () => {
    scrollToTop()
    limparFiltros()
  }

  const handleProfileClick = () => {
    limparFiltros()
    scrollToTop()
  }

  const navLinks = [
    {
      label: 'Portfólio',
      href: `/${slug}`,
      isActive: pathname === `/${slug}`,
      title: firstNames ? `Trabalhos de ${firstNames}` : 'Trabalhos',
      onClick: handleInicioClick,
    },
    {
      label: 'Perfil',
      href: `/${slug}/profile`,
      isActive: pathname.startsWith(`/${slug}/profile`),
      title: firstNames ? `Perfil e contatos de ${firstNames}` : 'Perfil e contatos',
      onClick: handleProfileClick,
    },
  ]

  const navLinkClass = (isActive: boolean) =>
    `text-sm font-semibold whitespace-nowrap transition-colors ${focusRing} ${
      isActive
        ? 'text-white underline decoration-2 decoration-red-600 underline-offset-8'
        : 'text-zinc-400 hover:text-white'
    }`

  const isCategoriaAtiva = (categoriaId: string) =>
    filtroAtivo === categoriaId && tipoFiltro === 'categoria'

  const categoriaPillClass = (categoria: { id: string; isTrend?: boolean }) =>
    `inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors ${focusRing} ${
      isCategoriaAtiva(categoria.id)
        ? 'bg-red-600 font-semibold text-white'
        : categoria.isTrend
          ? 'bg-red-600/15 font-medium text-red-100 ring-1 ring-red-500/40 hover:bg-red-600/25'
          : 'bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:bg-zinc-800 hover:text-white'
    }`

  const trendDot = (
    <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 rounded-full bg-orange-400" />
  )

  const activeCategory = categorias.find((categoria: any) => categoria.id === filtroAtivo)
  const activeCategoryLabel = activeCategory?.name || activeCategory?.nome || filtroAtivo

  return (
    <>
      <header
        className={`fixed inset-x-0 ${loggedBarVisible ? LOGGED_BAR_OFFSET : 'top-0'} z-50 border-b border-white/5 bg-black/85 backdrop-blur-md`}
      >
        <div className="flex h-16 items-center gap-3 px-4 md:gap-6 md:px-8">
          <Link
            href="/"
            aria-label="FolioBy - página inicial"
            title="Conheça o FolioBy"
            className={`shrink-0 ${focusRing}`}
          >
            <span className="text-xl font-bold tracking-tight text-red-600 md:text-2xl">FolioBy</span>
          </Link>

          <nav
            aria-label="Navegação do portfólio"
            className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto py-3 md:gap-5 md:overflow-visible md:py-0"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                title={link.title}
                aria-current={link.isActive ? 'page' : undefined}
                onClick={link.onClick}
                className={navLinkClass(link.isActive)}
              >
                {link.label}
              </Link>
            ))}

            {showcaseFilters && categorias.length > 0 && (
              <div className="hidden items-center gap-2 md:flex">
                <span aria-hidden="true" className="mr-2 h-5 w-px bg-zinc-700" />
                {categoriasPrincipais.map((categoria) => (
                  <button
                    key={categoria.id}
                    type="button"
                    onClick={() => handleCategoriaClick(categoria.id)}
                    aria-pressed={isCategoriaAtiva(categoria.id)}
                    title={categoria.isTrend ? 'Categoria em alta' : undefined}
                    className={categoriaPillClass(categoria)}
                  >
                    {categoria.isTrend && trendDot}
                    {categoria.name}
                  </button>
                ))}

                {categoriasRestantes.length > 0 && (
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      aria-label="Mais categorias"
                      title="Mais categorias"
                      aria-haspopup="true"
                      aria-expanded={isDropdownOpen}
                      className={`inline-flex size-9 items-center justify-center rounded-full transition-colors ${focusRing} ${
                        tipoFiltro === 'categoria' && categoriasRestantes.some((c) => c.id === filtroAtivo)
                          ? 'bg-red-600 text-white'
                          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-56 rounded-lg border border-zinc-800 bg-black/95 py-2 shadow-xl backdrop-blur-sm z-50">
                        <div className="px-3 py-2 border-b border-zinc-800">
                          <p className="text-white text-sm font-semibold">Todas as categorias</p>
                        </div>

                        <div className="max-h-60 overflow-y-auto">
                          {categoriasRestantes.map((categoria) => (
                            <button
                              key={categoria.id}
                              type="button"
                              onClick={() => handleCategoriaClick(categoria.id)}
                              aria-pressed={isCategoriaAtiva(categoria.id)}
                              className={`w-full text-left px-3 py-2 text-sm ${
                                isCategoriaAtiva(categoria.id)
                                  ? 'bg-red-600 text-white'
                                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                              } transition-colors flex justify-between items-center`}
                            >
                              <span>{categoria.name}</span>
                              <span className="text-xs bg-zinc-800 px-2 py-1 rounded">
                                {categoria.conteudos.length}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </nav>

          {showcaseFilters && categorias.length > 0 && (
            <button
              type="button"
              onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
              aria-label="Categorias"
              title="Categorias"
              aria-expanded={isMobileCategoriesOpen}
              aria-controls="categorias-mobile"
              className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-zinc-800 transition-colors hover:bg-zinc-800 md:hidden ${focusRing}`}
            >
              <Menu aria-hidden="true" size={18} className="text-zinc-300" />
            </button>
          )}

          {showcaseFilters && (
            <div className="ml-auto shrink-0">
              <SearchBar
                onSearch={handleSearch}
                value={tipoFiltro === 'search' ? termoPesquisa : ''}
                onClear={limparFiltros}
              />
            </div>
          )}
        </div>

        {isMobileCategoriesOpen && categorias.length > 0 && (
          <div id="categorias-mobile" className="flex flex-wrap gap-2 px-4 pb-3 md:hidden">
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                type="button"
                onClick={() => handleCategoriaClick(categoria.id)}
                aria-pressed={isCategoriaAtiva(categoria.id)}
                className={categoriaPillClass(categoria)}
              >
                {categoria.isTrend && trendDot}
                {categoria.name}
              </button>
            ))}
          </div>
        )}

        {filtroAtivo && (
          <div className="flex items-center gap-2 px-4 pb-3 text-sm text-white md:px-8">
            <span className="whitespace-nowrap">Filtrando por:</span>
            <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-medium truncate max-w-[200px]">
              {tipoFiltro === 'categoria'
                ? activeCategoryLabel
                : `"${filtroAtivo}"`}
            </span>
            <button
              type="button"
              onClick={limparFiltros}
              aria-label="Limpar filtro"
              title="Limpar filtro"
              className={`text-zinc-400 hover:text-white transition-colors p-1 flex-shrink-0 ${focusRing}`}
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </header>
      {loggedBarVisible && <div aria-hidden="true" className="h-[58px]" />}
    </>
  )
}
