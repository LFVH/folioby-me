'use client'

import { useEffect, useState } from 'react'
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

function getMediaLabel(conteudo: BannerConteudo) {
  if (conteudo.mediaType === 'sequence' && conteudo.mediaUrls?.length) {
    return `${conteudo.mediaUrls.length} frames`
  }

  if (conteudo.mimetype?.includes('gif')) {
    return 'GIF'
  }

  return conteudo.mimetype?.split('/')[1]?.toUpperCase() || 'MEDIA'
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
  const currentBannerUrl = getBannerMediaUrl(currentBanner)

  if (!currentBanner || !currentBannerUrl) {
    return null
  }

  const bannerTitle = getBannerTitle(currentBanner)

  const handleAssistirClick = () => {
    if (!currentBanner.linkext) {
      return
    }

    window.open(currentBanner.linkext, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="relative isolate min-h-[30rem] overflow-hidden bg-black">
      <div className="absolute inset-0">
        <img
          src={currentBannerUrl}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-30 blur-3xl scale-110"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.30),transparent_32%),linear-gradient(120deg,rgba(0,0,0,0.15),rgba(0,0,0,0.82)_48%,rgba(0,0,0,0.96)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[30rem] max-w-7xl items-end gap-8 px-6 py-10 md:min-h-[34rem] md:grid-cols-[minmax(0,1fr)_minmax(340px,540px)] md:px-8 md:py-14">
        <div className="max-w-2xl">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-red-300/90">
            <span>{currentBanner.fonte || 'Portfolio visual'}</span>
            <span className="h-1 w-1 rounded-full bg-red-400/70" />
            <span>{getMediaLabel(currentBanner)}</span>
            {currentBanner.isTrend && (
              <>
                <span className="h-1 w-1 rounded-full bg-orange-400/80" />
                <span className="rounded-full bg-orange-500/20 px-3 py-1 tracking-[0.22em] text-orange-100">
                  Em alta
                </span>
              </>
            )}
          </div>

          <h1 className="mb-4 max-w-xl text-4xl font-bold leading-tight text-white md:text-6xl">
            {bannerTitle}
          </h1>

          <p className="max-w-xl text-sm leading-7 text-gray-200 md:text-base">
            Visual em destaque com enquadramento preservado para evitar zoom excessivo e perda de definicao.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={handleAssistirClick}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                currentBanner.linkext
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'cursor-not-allowed bg-gray-500/60 text-gray-200'
              }`}
              disabled={!currentBanner.linkext}
              title={
                currentBanner.linkext
                  ? `Abrir ${currentBanner.linkext}`
                  : 'Link externo nao disponivel'
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

        <div className="relative mx-auto w-full max-w-[34rem] self-center md:justify-self-end">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-red-500/30 via-orange-500/10 to-transparent blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/80 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-4 text-[11px] uppercase tracking-[0.24em] text-white/70">
              <span>{getMediaLabel(currentBanner)}</span>
              <span>{currentBanner.fonte || 'FolioBy'}</span>
            </div>

            <div className="relative aspect-[16/10] w-full bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_56%),linear-gradient(180deg,rgba(24,24,27,0.88),rgba(9,9,11,0.98))]">
              <img
                src={currentBannerUrl}
                alt={bannerTitle}
                className="h-full w-full object-contain p-4 md:p-6"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>

      {bannerConteudos.length > 1 && (
        <div className="absolute bottom-5 left-6 z-20 flex gap-2 md:left-8">
          {bannerConteudos.map((conteudo, index) => (
            <button
              key={conteudo.id}
              onClick={() => setCurrentBannerIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentBannerIndex ? 'w-10 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Exibir banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
