export const USER_SLUG_MAX_LENGTH = 50
export const USER_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const RESERVED_USER_SLUGS = [
  'api',
  'auth',
  'login',
  'nextsteps',
  'privacidade',
  'services',
  'signup',
  'termos',
] as const

const RESERVED_USER_SLUG_SET = new Set<string>(RESERVED_USER_SLUGS)

export class UserSlugError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message)
    this.name = 'UserSlugError'
  }
}

export function normalizeUserSlug(slug: string): string {
  return slug.trim().toLowerCase()
}

export function truncateUserSlug(slug: string): string {
  return normalizeUserSlug(slug)
    .slice(0, USER_SLUG_MAX_LENGTH)
    .replace(/-+$/g, '')
}

export function buildUserSlugWithSuffix(baseSlug: string, suffix: string): string {
  const normalizedBaseSlug = truncateUserSlug(baseSlug) || 'user'
  const normalizedSuffix = normalizeUserSlug(suffix).replace(/[^a-z0-9-]/g, '')

  if (!normalizedSuffix) {
    return normalizedBaseSlug
  }

  const maxBaseLength = USER_SLUG_MAX_LENGTH - normalizedSuffix.length - 1
  const truncatedBase = normalizedBaseSlug.slice(0, Math.max(maxBaseLength, 1)).replace(/-+$/g, '')

  return `${truncatedBase || 'user'}-${normalizedSuffix}`
}

export function isReservedUserSlug(slug: string): boolean {
  return RESERVED_USER_SLUG_SET.has(normalizeUserSlug(slug))
}

export function getUserSlugValidationError(slug: string): string | null {
  const normalizedSlug = normalizeUserSlug(slug)

  if (!normalizedSlug) {
    return 'Slug obrigatoria.'
  }

  if (normalizedSlug.length > USER_SLUG_MAX_LENGTH) {
    return 'Use no maximo 50 caracteres.'
  }

  if (!USER_SLUG_REGEX.test(normalizedSlug)) {
    return 'Use apenas letras minusculas, numeros e hifens.'
  }

  if (isReservedUserSlug(normalizedSlug)) {
    return 'Essa slug e reservada pelo sistema.'
  }

  return null
}

export function assertValidUserSlug(slug: string): string {
  const normalizedSlug = normalizeUserSlug(slug)
  const validationError = getUserSlugValidationError(normalizedSlug)

  if (validationError) {
    throw new UserSlugError(validationError, 400)
  }

  return normalizedSlug
}

export function createUserSlugTakenError(): UserSlugError {
  return new UserSlugError('Essa slug ja esta em uso.', 409)
}
