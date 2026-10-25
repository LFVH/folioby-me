// Slugs cuja vitrine é substituída por uma página estática em public/ (rewrite em next.config.mjs).
export const STATIC_PROFILE_PAGES = ['/luizfvieirah', '/luizfvieirah/en']

export const hasStaticShowcase = (slug: string) => STATIC_PROFILE_PAGES.includes(`/${slug}`)
