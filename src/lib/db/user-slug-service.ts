import prisma from '@/prisma'
import { criarURL } from '@/lib/utils'
import {
  assertValidUserSlug,
  buildUserSlugWithSuffix,
  createUserSlugTakenError,
  getUserSlugValidationError,
  truncateUserSlug,
} from '@/lib/user-slug'

async function findUserBySlug(slug: string, excludeUserId?: string) {
  return prisma.usuario.findFirst({
    where: {
      slug,
      ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
    },
    select: { id: true },
  })
}

export async function assertAvailableUserSlug(slug: string, excludeUserId?: string): Promise<string> {
  const normalizedSlug = assertValidUserSlug(slug)
  const existingUser = await findUserBySlug(normalizedSlug, excludeUserId)

  if (existingUser) {
    throw createUserSlugTakenError()
  }

  return normalizedSlug
}

async function isUserSlugAvailable(slug: string, excludeUserId?: string): Promise<boolean> {
  if (getUserSlugValidationError(slug)) {
    return false
  }

  const existingUser = await findUserBySlug(slug, excludeUserId)
  return !existingUser
}

export async function generateAvailableUserSlug(name: string): Promise<string> {
  const initialCandidate = truncateUserSlug(criarURL(name))
  const baseSlug = initialCandidate || 'user'

  if (await isUserSlugAvailable(baseSlug)) {
    return baseSlug
  }

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const randomSuffix = String(Math.floor(100 + Math.random() * 900))
    const candidate = buildUserSlugWithSuffix(baseSlug, randomSuffix)

    if (await isUserSlugAvailable(candidate)) {
      return candidate
    }
  }

  const fallbackCandidate = buildUserSlugWithSuffix(baseSlug, Date.now().toString().slice(-6))

  if (await isUserSlugAvailable(fallbackCandidate)) {
    return fallbackCandidate
  }

  throw new Error('Nao foi possivel gerar uma slug disponivel.')
}
