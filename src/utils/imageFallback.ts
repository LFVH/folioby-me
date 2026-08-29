import { useCallback, useState } from 'react'

export function handleImgError(
  e: React.SyntheticEvent<HTMLImageElement>,
  fallback = '/placeholder-image.jpg'
) {
  const img = e.currentTarget as HTMLImageElement

  // prevent infinite loop: if fallback already applied, do nothing
  if (img.dataset.fallbackApplied === '1') return

  // remove handler to avoid re-entry and mark as applied
  img.onerror = null
  img.dataset.fallbackApplied = '1'
  img.src = fallback
}

export function useImageFallback(initialSrc?: string | null, fallback = '/placeholder-image.jpg') {
  const [src, setSrc] = useState<string | undefined>(initialSrc ?? undefined)

  const onError = useCallback(() => {
    setSrc((current) => (current === fallback ? current : fallback))
  }, [fallback])

  return { src, setSrc, onError }
}
