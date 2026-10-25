import { head } from '@vercel/blob'
import { BlobService } from './blob-service'

const BLOB_HOST_SUFFIX = '.public.blob.vercel-storage.com'

// Só aceitamos mídia hospedada no nosso Vercel Blob: é o que conta na cota de armazenamento.
export function isBlobUrl(valor: string): boolean {
  try {
    const url = new URL(valor)
    return url.protocol === 'https:' && url.hostname.endsWith(BLOB_HOST_SUFFIX)
  } catch {
    return false
  }
}

// Tamanho real das mídias, lido no Blob. O valor enviado pelo navegador não é confiável.
export async function medirMidias(urls: string[]): Promise<number> {
  const tamanhos = await Promise.all(urls.map(async (url) => (await head(url)).size))
  return tamanhos.reduce((total, tamanho) => total + tamanho, 0)
}

// Remove mídias que acabaram de subir mas não foram aceitas (ex.: cota estourada).
export async function descartarMidias(urls: string[]): Promise<void> {
  await Promise.all(urls.filter(isBlobUrl).map((url) => BlobService.deleteFile(url)))
}
