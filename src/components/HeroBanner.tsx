'use client'

import { CategoriaWithUrls } from '@/types'
import { logNow } from '@/utils/Logging'
import { useState, useEffect } from 'react'

interface HeroBannerProps {
  categorias: CategoriaWithUrls[]
  categoriaFiltrada?: string | null
}

export default function HeroBanner({ categorias, categoriaFiltrada  }: HeroBannerProps) {
  
  if (categoriaFiltrada) return <div></div>;
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  
  const bannerConteudos = (categoriaFiltrada 
    ? categorias.find(c => c.id === categoriaFiltrada)?.conteudos || []
    : categorias.flatMap(c => c.conteudos)).slice(0, 5)
  
  useEffect(() => {
    if (bannerConteudos.length <= 0) return

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => 
        prev === bannerConteudos.length - 1 ? 0 : prev + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [bannerConteudos.length])

  // 🔥 FUNÇÃO PARA ABRIR LINK EXTERNO
  const handleAssistirClick = () => {
    if (currentBanner?.linkext) {
      window.open(currentBanner.linkext, '_blank', 'noopener,noreferrer')
    } else {
      // 🔥 OPÇÃO 1: Mostrar alerta se não tiver link
      alert('Este conteúdo não possui link externo disponível.')
      
      // 🔥 OPÇÃO 2: Ou abrir a própria imagem em nova aba
      // window.open(currentBanner.url, '_blank', 'noopener,noreferrer')
    }
  }

  if (bannerConteudos.length === 0) return null

  const currentBanner = bannerConteudos[currentBannerIndex]
  if(!currentBanner || !currentBanner.url) return null
  
  return (
    <div className="relative h-96 md:h-[500px] w-full overflow-hidden">
      {/* Imagem do Banner */}
      <img
        src={currentBanner.url}
        alt={currentBanner.filename}
        className="w-full h-full object-cover"
      />
      
      {/* Overlay Gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      
      {/* Conteúdo do Banner */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {currentBanner.filename.replace('.gif', '')}
          </h1>
          <div className="flex gap-4">
            {/* 🔥 BOTÃO ASSISTIR CLICÁVEL */}
            <button 
              onClick={handleAssistirClick}
              className={`px-6 py-2 font-semibold rounded transition-colors flex items-center gap-2 ${
                currentBanner.linkext
                  ? 'bg-white text-black hover:bg-gray-200 cursor-pointer'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
              disabled={!currentBanner.linkext}
              title={
                currentBanner.linkext 
                  ? `Abrir ${currentBanner.linkext}` 
                  : 'Link externo não disponível'
              }
            >
              ▶ Assistir
              {currentBanner.linkext && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </button>
          </div>
        
        </div>
      </div>

      {/* Indicadores */}
      {bannerConteudos.length > 1 && (
        <div className="absolute bottom-4 right-8 flex gap-2">
          {bannerConteudos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentBannerIndex 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}