'use client'

import { useEffect, useState } from 'react'
import { handleImgError } from '@/utils/imageFallback'
import { CategoriaWithUrls } from '@/types'

interface HeroBannerProps {
  categorias: CategoriaWithUrls[]
  categoriaFiltrada?: string | null
}

type BannerConteudo = CategoriaWithUrls['conteudos'][number]

function getBannerTitle(conteudo: BannerConteudo) {
  return conteudo.name || conteudo.filename.replace(/\.[^/.]+$/, '')
}

function getBannerMediaUrl(conteudo: BannerConteudo) {
  const firstMediaUrl = conteudo.mediaUrls?.find(Boolean)
  return firstMediaUrl || conteudo.url || null
}

export default function HeroBanner({ categorias, categoriaFiltrada }: HeroBannerProps) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  const bannerConteudos = (
    categoriaFiltrada
      ? categorias.find((categoria) => categoria.id === categoriaFiltrada)?.conteudos || []
      : categorias.flatMap((categoria) => categoria.conteudos)
  )
    .filter((conteudo) => Boolean(getBannerMediaUrl(conteudo)))
    .slice(0, 5)

  useEffect(() => {
    if (currentBannerIndex < bannerConteudos.length) {
      return
    }

    setCurrentBannerIndex(0)
  }, [bannerConteudos.length, currentBannerIndex])

  useEffect(() => {
    if (bannerConteudos.length <= 1) {
      return
    }

    const interval = setInterval(() => {
      setCurrentBannerIndex((previousIndex) =>
        previousIndex === bannerConteudos.length - 1 ? 0 : previousIndex + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [bannerConteudos.length])

  if (categoriaFiltrada || bannerConteudos.length === 0) {
    return null
  }

  const currentBanner = bannerConteudos[currentBannerIndex]

  if (!currentBanner) {
    return null
  }

  const handleAssistirClick = () => {
    if (!currentBanner.linkext) {
      return
    }

    window.open(currentBanner.linkext, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="relative isolate overflow-hidden bg-black">
      <div className="relative min-h-[30rem] md:min-h-[36rem] lg:min-h-[40rem]">
        <div className="absolute inset-0">
          {bannerConteudos.map((conteudo, index) => {
            const imageUrl = getBannerMediaUrl(conteudo)

            if (!imageUrl) {
              return null
            }

            return (
              <img
                key={`bg-${conteudo.id}`}
                src={imageUrl}
                alt=""
                aria-hidden="true"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ease-out ${
                  index === currentBannerIndex ? 'opacity-40' : 'opacity-0'
                }`}
                onError={(e) => handleImgError(e)}
              />
            )
          })}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.82)_22%,rgba(0,0,0,0.38)_58%,rgba(0,0,0,0.78)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.18)_45%,rgba(0,0,0,0.92)_100%)]" />
        </div>

        <div className="absolute inset-y-0 right-0 left-[20%] hidden items-center justify-end md:flex">
          {bannerConteudos.map((conteudo, index) => {
            const imageUrl = getBannerMediaUrl(conteudo)

            if (!imageUrl) {
              return null
            }

                return (
              <div
                key={`hero-${conteudo.id}`}
                className={`absolute inset-0 flex items-center justify-end transition-all duration-700 ease-out ${
                  index === currentBannerIndex
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'pointer-events-none opacity-0 translate-x-6 scale-[1.02]'
                }`}
              >
                <img
                  src={imageUrl}
                  alt={getBannerTitle(conteudo)}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="h-[82%] w-full object-contain object-left drop-shadow-[0_20px_65px_rgba(0,0,0,0.55)]"
                  onError={(e) => handleImgError(e)}
                />
              </div>
            )
          })}
        </div>

        <div className="absolute inset-x-0 top-0 flex justify-center px-4 pt-8 md:hidden">
          {bannerConteudos.map((conteudo, index) => {
            const imageUrl = getBannerMediaUrl(conteudo)

            if (!imageUrl) {
              return null
            }

              return (
              <img
                key={`mobile-${conteudo.id}`}
                src={imageUrl}
                alt={getBannerTitle(conteudo)}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                className={`absolute top-8 h-[44vh] w-[92vw] max-w-xl object-contain transition-all duration-700 ease-out ${
                  index === currentBannerIndex
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'pointer-events-none opacity-0 translate-y-3 scale-[1.02]'
                }`}
                onError={(e) => handleImgError(e)}
              />
            )
          })}
        </div>

        <div className="relative z-10 mx-auto flex min-h-[30rem] max-w-7xl items-end px-6 pb-12 pt-[19rem] md:min-h-[36rem] md:px-8 md:pb-16 md:pt-24 lg:min-h-[40rem]">
          <div className="max-w-xl">
            {currentBanner.isTrend && (
              <div className="mb-5 inline-flex items-center rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-white">
                Em alta
              </div>
            )}

            <h1 className="max-w-lg text-4xl font-bold leading-[0.95] text-white md:text-6xl lg:text-7xl">
              {getBannerTitle(currentBanner)}
            </h1>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={handleAssistirClick}
                className={`inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-semibold transition-colors ${
                  currentBanner.linkext
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'cursor-not-allowed bg-neutral-500/60 text-neutral-200'
                }`}
                disabled={!currentBanner.linkext}
                title={
                  currentBanner.linkext
                    ? `Abrir ${currentBanner.linkext}`
                    : 'Link externo não disponível'
                }
              >
                <span>Assistir</span>
                {currentBanner.linkext && (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {bannerConteudos.length > 1 && (
          <div className="absolute bottom-5 left-6 z-20 flex gap-2 md:bottom-8 md:left-8">
            {bannerConteudos.map((conteudo, index) => (
              <button
                key={conteudo.id}
                onClick={() => setCurrentBannerIndex(index)}
                className={`rounded-full transition-all ${
                  index === currentBannerIndex
                    ? 'h-2.5 w-10 bg-white'
                    : 'h-2.5 w-2.5 bg-white/45 hover:bg-white/75'
                }`}
                aria-label={`Exibir banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
