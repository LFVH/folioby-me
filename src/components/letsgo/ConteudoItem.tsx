'use client'
import { useState, useEffect, useRef } from 'react'
import { ConteudoWithUrl } from '@/types'
interface ConteudoItemProps {
  conteudo: ConteudoWithUrl
  layout?: 'carrossel' | 'lista'
}
export default function ConteudoItem({ conteudo, layout = 'carrossel' }: ConteudoItemProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const isSequence = conteudo.mediaType === 'sequence' && conteudo.mediaUrls?.length > 1
  console.log('isSequence')
  console.log(isSequence)
  console.log("conteudo.mediaType")
  console.log(conteudo.mediaType)
  console.log("conteudo.mediaUrls?.length")
  console.log(conteudo.mediaUrls?.length)
  const isGif = !isSequence && conteudo.mimetype?.includes('gif')
  const mediaUrls = conteudo.mediaUrls?.length ? conteudo.mediaUrls : [conteudo.url]
  useEffect(() => {
    if (isHovered && isSequence) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => 
          prev === mediaUrls.length - 1 ? 0 : prev + 1
        )
      }, 800)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovered, isSequence, mediaUrls.length])
  useEffect(() => {
    if (!isHovered) {
      setCurrentImageIndex(0)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isHovered])
  const handleClick = () => {
    if (conteudo.linkext) {
      window.open(conteudo.linkext, '_blank', 'noopener,noreferrer')
    }
  }
  const handleMouseEnter = () => {
    setIsHovered(true)
  }
  const handleMouseLeave = () => {
    setIsHovered(false)
  }
  const currentMediaUrl = isSequence && isHovered
    ? mediaUrls[currentImageIndex]
    : mediaUrls[0]
  const getMediaBadge = () => {
    if (isSequence) {
      return (
        <div className="absolute top-2 right-2 z-30 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span>{mediaUrls.length} imagens</span>
        </div>
      )
    }
    if (isGif) {
      return (
        <div className="absolute top-2 right-2 z-30 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          GIF
        </div>
      )
    }
    return (
      <div className="absolute top-2 right-2 z-30 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
        {conteudo.mimetype?.split('/')[1]?.toUpperCase() || 'IMG'}
      </div>
    )
  }
  const baseStyles = `
    relative rounded-lg overflow-hidden shadow-lg bg-gray-800 group/item
    transition-all duration-500 ease-out transform
    hover:scale-105 hover:z-10 cursor-pointer
    ${conteudo.linkext ? 'hover:shadow-red-500/20' : ''}
    ${conteudo.isTrend ? 'ring-2 ring-orange-500 ring-opacity-80' : ''}
  `
  const layoutStyles = {
    carrossel: 'flex-none w-64 h-36',
    lista: 'w-full aspect-video max-w-md mx-auto'
  }
  return (
    <div 
      className={`${baseStyles} ${layoutStyles[layout]}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={conteudo.linkext ? `Abrir ${conteudo.linkext} em nova aba` : 'Sem link externo'}
    >
      
      {conteudo.isTrend && (
        <>
          <div className="absolute -top-1 -left-1 w-5 h-5 text-orange-500 animate-bounce z-20">
            <FireIcon />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 text-orange-500 animate-bounce z-20" style={{ animationDelay: '0.3s' }}>
            <FireIcon />
          </div>
          <div className="absolute -bottom-1 -left-1 w-5 h-5 text-orange-500 animate-bounce z-20" style={{ animationDelay: '0.6s' }}>
            <FireIcon />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 text-orange-500 animate-bounce z-20" style={{ animationDelay: '0.9s' }}>
            <FireIcon />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 text-red-500 z-20">
            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></div>
            <FireIcon />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 animate-pulse z-0" />
          <div className="absolute inset-0 overflow-hidden z-10">
            <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-float opacity-90" />
            <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-orange-400 rounded-full animate-float opacity-80" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-6 left-8 w-1 h-1 bg-red-400 rounded-full animate-float opacity-90" style={{ animationDelay: '2s' }} />
          </div>
          <div className="absolute top-2 left-2 z-30">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse-fast">
              🔥 EM ALTA
            </div>
          </div>
        </>
      )}
      
      {getMediaBadge()}
      
      {isSequence && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-30 flex gap-1">
          {mediaUrls.map((_: string, index: number) => (
            <div
              key={index}
              className={`
                w-1.5 h-1.5 rounded-full transition-all duration-300
                ${index === currentImageIndex && isHovered 
                  ? 'bg-white w-3' 
                  : 'bg-white/50'
                }
              `}
            />
          ))}
        </div>
      )}
      <img
        src={currentMediaUrl}
        alt={conteudo.filename}
        className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover/item:scale-110 ${
          conteudo.isTrend ? 'brightness-110' : ''
        }`}
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = '/placeholder-image.jpg'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-all duration-500 ease-out z-10">
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-sm font-medium truncate transform translate-y-2 group-hover/item:translate-y-0 transition-transform duration-300">
            {conteudo.name || conteudo.filename.replace(/\.[^/.]+$/, '')}
          </p>
          
          <p className="text-gray-300 text-xs truncate transform translate-y-2 group-hover/item:translate-y-0 transition-transform duration-400">
            {(
              isSequence 
                ? `Sequência de ${mediaUrls.length} imagens` 
                : isGif 
                  ? 'GIF animado' 
                  : 'Imagem estática'
            )}
          </p>
          
          {conteudo.linkext && (
            <div className="flex items-center gap-1 mt-1 transform translate-y-2 group-hover/item:translate-y-0 transition-transform duration-500">
              <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="text-red-400 text-xs">Abrir link externo</span>
            </div>
          )}
        </div>
      </div>
      
      {isHovered && (isGif || isSequence) && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-black bg-opacity-70 rounded-full p-2">
          <svg className="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSequence ? "M4 4v16h16V4H4z" : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
    </div>
  )
}
function FireIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      imageRendering="optimizeQuality"
      fillRule="evenodd"
      clipRule="evenodd"
      viewBox="0 0 384 511.4"
      className="w-full h-full drop-shadow-lg"
    >
      <defs>
        <linearGradient id="fireGradient" gradientUnits="userSpaceOnUse" x1="163.52" y1="286.47" x2="163.52" y2="500.71">
          <stop offset="0" stopColor="#FB6404"/>
          <stop offset="1" stopColor="#F2BE10"/>
        </linearGradient>
      </defs>
      <path fill="#E20919" d="M77.46 228.43C65.33 119.85 128.78 43.48 247.72 0c-72.85 94.5 62.09 196.88 69.53 295.03 17.44-29.75 27.34-69.48 29.3-122.55 89.18 139.92 15.25 368.59-181.02 335.73-18.02-3.01-35.38-8.7-51.21-17.17C42.76 452.8 0 369.53 0 290c0-50.69 21.68-95.95 49.74-131.91 3.75 35.23 11.73 61.51 27.72 70.34z"/>
      <path fill="url(#fireGradient)" d="M139.16 372.49c-21.83-57.66-18.81-150.75 42.33-183.41.43 107.03 103.57 120.64 84.44 234.9 17.64-20.39 26.51-53.02 28.1-78.75 27.96 65.38 6.04 117.72-33.81 144.37-121.15 81-225.48-83.23-156.11-173.26 2.08 20.07 26.14 51.12 35.05 56.15z"/>
    </svg>
  )}