const DEFAULT_SITE_URL = 'https://folioby.me'

function normalizeSiteUrl(url: string): string {
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    return DEFAULT_SITE_URL
  }

  const withProtocol = /^https?:\/\//i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`

  return withProtocol.replace(/\/+$/, '')
}

export function getSiteUrl(): string {
  return normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.VERCEL_URL ||
      DEFAULT_SITE_URL
  )
}
