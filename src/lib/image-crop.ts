'use client'

import type { Area } from 'react-easy-crop'

type ImageMimeType = 'image/jpeg' | 'image/png'

interface DrawPreviewOptions {
  canvas: HTMLCanvasElement
  image: HTMLImageElement
  crop: Area
  size?: number
  roundMask?: boolean
}

interface ExportCroppedImageOptions {
  imageSrc: string
  crop: Area
  fileName: string
  outputFormat?: ImageMimeType
  quality?: number
  maxOutputSize?: number
}

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Nao foi possivel carregar a imagem selecionada.'))
    image.src = src
  })
}

export function drawCroppedPreview({
  canvas,
  image,
  crop,
  size = 184,
  roundMask = true,
}: DrawPreviewOptions) {
  const context = canvas.getContext('2d')

  if (!context) {
    return
  }

  canvas.width = size
  canvas.height = size

  context.clearRect(0, 0, size, size)
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  if (roundMask) {
    context.save()
    context.beginPath()
    context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    context.closePath()
    context.clip()
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size
  )

  if (roundMask) {
    context.restore()
  }
}

export async function exportCroppedImage({
  imageSrc,
  crop,
  fileName,
  outputFormat = 'image/jpeg',
  quality = 0.94,
  maxOutputSize = 1200,
}: ExportCroppedImageOptions) {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  const sourceSize = Math.max(crop.width, crop.height)
  const outputSize = Math.max(1, Math.round(Math.min(sourceSize, maxOutputSize)))

  canvas.width = outputSize
  canvas.height = outputSize

  const context = canvas.getContext('2d', { alpha: outputFormat === 'image/png' })

  if (!context) {
    throw new Error('Nao foi possivel preparar a imagem final.')
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'

  if (outputFormat === 'image/jpeg') {
    context.fillStyle = '#09090b'
    context.fillRect(0, 0, outputSize, outputSize)
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize
  )

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputFormat, quality)
  })

  if (!blob) {
    throw new Error('Nao foi possivel exportar a imagem final.')
  }

  const extension = outputFormat === 'image/png' ? 'png' : 'jpg'
  const normalizedName = fileName.replace(/\.[^/.]+$/, '') || 'avatar'

  return new File([blob], `${normalizedName}-avatar.${extension}`, {
    type: outputFormat,
    lastModified: Date.now(),
  })
}
