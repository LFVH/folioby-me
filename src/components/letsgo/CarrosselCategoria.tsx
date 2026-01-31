// src/components/letsgo/CarrosselCategoria.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { CategoriaWithUrls } from '@/types'
import ConteudoItem from './ConteudoItem'
import Link from 'next/link'

interface CarrosselCategoriaProps {
  categoria: CategoriaWithUrls
  layout?: 'carrossel' | 'lista'
}

export default function CarrosselCategoria({ 
  categoria, 
  layout = 'carrossel'
}: CarrosselCategoriaProps) {
  const carrosselRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollRequestRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      if (scrollRequestRef.current) {
        cancelAnimationFrame(scrollRequestRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (layout === 'carrossel') {
      updateArrows()
      
      const handleResize = () => {
        setTimeout(updateArrows, 100)
      }

      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [categoria.conteudos.length, layout])

  useEffect(() => {
    if (layout === 'carrossel') {
      setTimeout(updateArrows, 100)
    }
  }, [categoria.conteudos, layout])

  // Componente do cadeado
  const LockedContentIndicator = ({ count }: { count: number }) => (
    <Link href="/" >
    <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center z-10">
      <div className="text-center text-white">
        <svg 
          className="w-12 h-12 mx-auto mb-2 opacity-80" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
            clipRule="evenodd" 
          />
        </svg>
        <div className="text-lg font-semibold">
          +{count} conteúdo{count > 1 ? 's' : ''}
        </div>
        <div className="text-sm opacity-90">Disponível para premium</div>
      </div>
    </div>
    </Link>
  )

  if (layout === 'lista') {
    return (
      <div className="relative">
        <div className="flex items-center gap-3 mb-6 px-8">
          <h2 className="text-2xl font-bold text-white">
            {categoria.nome}
          </h2>
          {categoria.conteudosBloqueados && categoria.conteudosBloqueados > 0 && (
            <Link href="/" >
              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-400 text-sm font-medium">
                  +{categoria.conteudosBloqueados}
                </span>
              </div>
            </Link>
          )}
        </div>
        
        {categoria.descricao && (
          <p className="text-gray-400 mb-6 px-8 text-sm">
            {categoria.descricao}
          </p>
        )}

        <div className="px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categoria.conteudos.map((conteudo, index) => (
              <ConteudoItem
                key={`${conteudo.id}-${index}`}
                conteudo={conteudo}
                layout="lista"
              />
            ))}
            
            {/* Espaço reservado para conteúdos bloqueados */}
            {categoria.conteudosBloqueados && categoria.conteudosBloqueados > 0 && (
                <div className="relative rounded-lg overflow-hidden bg-gray-800/30 border-2 border-dashed border-gray-600/50 min-h-[200px]">
                  <LockedContentIndicator count={categoria.conteudosBloqueados} />
                </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const SCROLL_DURATION = 600
  const SCROLL_AMOUNT = 400

  const easeInOutQuad = (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  const smoothScroll = (targetScroll: number) => {
    if (!carrosselRef.current || isScrolling) return

    const carrossel = carrosselRef.current
    const startScroll = carrossel.scrollLeft
    const distance = targetScroll - startScroll
    const startTime = performance.now()

    setIsScrolling(true)

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / SCROLL_DURATION, 1)
      const easeProgress = easeInOutQuad(progress)

      carrossel.scrollLeft = startScroll + distance * easeProgress

      if (progress < 1) {
        scrollRequestRef.current = requestAnimationFrame(animateScroll)
      } else {
        setIsScrolling(false)
        updateArrows()
      }
    }

    scrollRequestRef.current = requestAnimationFrame(animateScroll)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!carrosselRef.current || isScrolling) return

    const { scrollLeft, scrollWidth, clientWidth } = carrosselRef.current
    let targetScroll: number

    if (direction === 'right') {
      if (scrollLeft >= scrollWidth - clientWidth - 50) {
        targetScroll = 0
      } else {
        targetScroll = scrollLeft + SCROLL_AMOUNT
        targetScroll = Math.min(targetScroll, scrollWidth - clientWidth)
      }
    } else {
      if (scrollLeft <= 50) {
        targetScroll = scrollWidth - clientWidth
      } else {
        targetScroll = scrollLeft - SCROLL_AMOUNT
        targetScroll = Math.max(0, targetScroll)
      }
    }

    smoothScroll(targetScroll)
  }

  const updateArrows = () => {
    if (!carrosselRef.current) return

    const { scrollLeft, scrollWidth, clientWidth } = carrosselRef.current
    setShowLeftArrow(true)
    setShowRightArrow(true)
  }

  const handleScroll = () => {
    if (!isScrolling) {
      updateArrows()
    }
  }

  return (
    <div className="relative group">
      <div className="flex items-center gap-3 mb-4 px-8">
        <h2 className="text-2xl font-bold text-white">
          {categoria.nome}
        </h2>
        {categoria.conteudosBloqueados && categoria.conteudosBloqueados > 0 && (
          <Link href="/" >
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-400 text-xs font-medium">
              +{categoria.conteudosBloqueados}
            </span>
          </div>
          </Link>
        )}
      </div>
      
      {categoria.descricao && (
        <p className="text-gray-400 mb-4 px-8 text-sm">
          {categoria.descricao}
        </p>
      )}

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg ${
            isScrolling ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          aria-label="Rolar para esquerda"
          disabled={isScrolling}
        >
          <svg 
            className={`w-6 h-6 ${isScrolling ? 'opacity-50' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative px-8">
          <div
            ref={carrosselRef}
            onScroll={handleScroll}
            className={`
              flex gap-4 overflow-x-auto scrollbar-hide
              ${isScrolling ? 'scroll-auto' : 'scroll-smooth'}
              transition-opacity duration-200
            `}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: isScrolling ? 'auto' : 'smooth'
            }}
          >
            {categoria.conteudos.map((conteudo, index) => (
              <ConteudoItem
                key={`${conteudo.id}-${index}`}
                conteudo={conteudo}
                layout="carrossel"
              />
            ))}
            
            {/* Espaço reservado para conteúdos bloqueados no carrossel */}
            {categoria.conteudosBloqueados && categoria.conteudosBloqueados > 0 && (
              <div className="flex-shrink-0 w-64 rounded-lg overflow-hidden bg-gray-800/30 border-2 border-dashed border-gray-600/50 relative">
                <LockedContentIndicator count={categoria.conteudosBloqueados} />
              </div>
            )}
          </div>

          {isScrolling && (
            <div className="absolute inset-0 bg-black/10 rounded-lg pointer-events-none z-20" />
          )}
        </div>

        <button
          onClick={() => scroll('right')}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg ${
            isScrolling ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          aria-label="Rolar para direita"
          disabled={isScrolling}
        >
          <svg 
            className={`w-6 h-6 ${isScrolling ? 'opacity-50' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}