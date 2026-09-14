'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import Cropper, { type Area, type Point } from 'react-easy-crop'
import { cn } from '@/lib/utils'
import { drawCroppedPreview, exportCroppedImage, loadImage } from '@/lib/image-crop'

type ImageMimeType = 'image/jpeg' | 'image/png'

interface ProfileImageCropperProps {
  isOpen: boolean
  imageSrc: string | null
  fileName: string
  outputFormat?: ImageMimeType
  onClose: () => void
  onConfirm: (file: File) => Promise<void> | void
}

const DEFAULT_CROP = { x: 0, y: 0 }

function CropEditor({
  imageSrc,
  fileName,
  outputFormat,
  onClose,
  onConfirm,
}: {
  imageSrc: string
  fileName: string
  outputFormat: ImageMimeType
  onClose: () => void
  onConfirm: (file: File) => Promise<void> | void
}) {
  const titleId = useId()
  const zoomId = useId()
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [crop, setCrop] = useState<Point>(DEFAULT_CROP)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)

  const formatLabel = useMemo(
    () => (outputFormat === 'image/png' ? 'PNG' : 'JPG'),
    [outputFormat]
  )
  const minZoom = 0.4
  const maxZoom = 4

  useEffect(() => {
    let isMounted = true

    loadImage(imageSrc)
      .then((image) => {
        if (isMounted) {
          setSourceImage(image)
        }
      })
      .catch(() => {
        if (isMounted) {
          setSourceImage(null)
        }
      })

    return () => {
      isMounted = false
    }
  }, [imageSrc])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isExporting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isExporting, onClose])

  useEffect(() => {
    if (!previewCanvasRef.current || !sourceImage || !croppedAreaPixels) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      drawCroppedPreview({
        canvas: previewCanvasRef.current!,
        image: sourceImage,
        crop: croppedAreaPixels,
        roundMask: true,
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [crop, croppedAreaPixels, sourceImage, zoom])

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return
    }

    setIsExporting(true)

    try {
      const croppedFile = await exportCroppedImage({
        imageSrc,
        crop: croppedAreaPixels,
        fileName,
        outputFormat,
      })

      await onConfirm(croppedFile)
    } finally {
      setIsExporting(false)
    }
  }

  const handleClose = () => {
    setCrop(DEFAULT_CROP)
    setZoom(1)
    setCroppedAreaPixels(null)
    setSourceImage(null)
    setIsExporting(false)
    setIsInteracting(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto bg-black/80 p-0 backdrop-blur-sm overscroll-contain sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isExporting) {
          handleClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-5xl overflow-hidden border border-white/10 bg-[#09090b] text-white shadow-[0_30px_100px_rgba(0,0,0,0.55)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[32px]"
        style={{
          height: '100dvh',
          paddingTop: 'max(env(safe-area-inset-top), 0px)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
        }}
      >
        <div className="flex h-full flex-col">
          <div className="shrink-0 border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-red-400">Foto de perfil</p>
                <h2 id={titleId} className="mt-2 text-2xl font-semibold sm:text-[2rem]">
                  Ajuste sua foto como no WhatsApp
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                  Arraste para reposicionar, use o scroll ou o gesto de pinça para dar zoom e confirme quando o enquadramento estiver do jeito que você quer.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isExporting}
                aria-label="Fechar recorte"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Fechar
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-4">
                <div className="relative h-[min(46dvh,25rem)] min-h-[280px] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.16),transparent_42%),linear-gradient(180deg,#101014_0%,#050505_100%)] sm:h-[min(52dvh,31rem)] lg:h-[min(56dvh,34rem)]">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    minZoom={minZoom}
                    maxZoom={maxZoom}
                    cropShape="round"
                    objectFit="cover"
                    showGrid={false}
                    restrictPosition
                    zoomWithScroll
                    keyboardStep={12}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
                    onCropAreaChange={(_, pixels) => setCroppedAreaPixels(pixels)}
                    onInteractionStart={() => setIsInteracting(true)}
                    onInteractionEnd={() => setIsInteracting(false)}
                    onTouchRequest={() => true}
                    style={{
                      containerStyle: {
                        background:
                          'radial-gradient(circle at top, rgba(255,255,255,0.06), rgba(9,9,11,0.96) 60%)',
                        touchAction: 'none',
                      },
                      cropAreaStyle: {
                        border: '2px solid rgba(255,255,255,0.96)',
                        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.66)',
                      },
                    }}
                    classes={{
                      containerClassName: 'touch-none select-none',
                      cropAreaClassName: 'shadow-[0_0_0_1px_rgba(255,255,255,0.12)]',
                      mediaClassName: cn(
                        'transition-transform duration-200 ease-out',
                        isInteracting ? 'cursor-grabbing' : 'cursor-grab'
                      ),
                    }}
                  />
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor={zoomId} className="text-sm font-medium text-zinc-200">
                      Zoom
                    </label>
                    <span className="text-sm text-zinc-400">{Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setZoom((value) => Math.max(minZoom, Number((value - 0.15).toFixed(2))))}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 transition hover:bg-white/10"
                      aria-label="Diminuir zoom"
                    >
                      -
                    </button>
                    <input
                      id={zoomId}
                      type="range"
                      min={minZoom}
                      max={maxZoom}
                      step={0.01}
                      value={zoom}
                      onChange={(event) => setZoom(Number(event.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-red-500"
                      aria-describedby={`${zoomId}-help`}
                    />
                    <button
                      type="button"
                      onClick={() => setZoom((value) => Math.min(maxZoom, Number((value + 0.15).toFixed(2))))}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 transition hover:bg-white/10"
                      aria-label="Aumentar zoom"
                    >
                      +
                    </button>
                  </div>
                  <p id={`${zoomId}-help`} className="mt-3 text-xs text-zinc-500">
                    Rolagem, toque e pinça para zoom estão habilitados.
                  </p>
                </div>
              </div>

              <aside className="space-y-4 pb-2">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-red-400">Prévia</p>
                  <div className="mt-4 flex items-center justify-center">
                    <div className="rounded-full border border-white/10 bg-zinc-950 p-2 shadow-[0_15px_45px_rgba(0,0,0,0.45)]">
                      <canvas
                        ref={previewCanvasRef}
                        className="h-40 w-40 rounded-full object-cover sm:h-44 sm:w-44"
                        aria-label="Pré-visualização da foto de perfil"
                      />
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm font-medium text-zinc-100">Saída final em {formatLabel}</p>
                    <p className="mt-2 text-sm text-zinc-400">
                      Exportação quadrada em alta qualidade para manter boa nitidez no avatar pequeno e no perfil público.
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm font-medium text-zinc-100">Dicas de enquadramento</p>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                    <li>Mantenha o rosto um pouco acima do centro para o avatar parecer mais vivo.</li>
                    <li>O zoom mínimo permite abrir mais a foto antes de cortar.</li>
                    <li>O círculo mostra exatamente a área visível no perfil e nos botões.</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-[#09090b]/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isExporting}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isExporting || !croppedAreaPixels}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:scale-[1.01] hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExporting ? 'Salvando foto...' : 'Usar esta foto'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileImageCropper({
  isOpen,
  imageSrc,
  fileName,
  outputFormat = 'image/jpeg',
  onClose,
  onConfirm,
}: ProfileImageCropperProps) {
  if (!isOpen || !imageSrc) {
    return null
  }

  return (
    <CropEditor
      key={`${imageSrc}-${fileName}`}
      imageSrc={imageSrc}
      fileName={fileName}
      outputFormat={outputFormat}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  )
}
