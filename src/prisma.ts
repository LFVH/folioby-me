import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

import { assertValidUserSlug } from './lib/user-slug'

let pool: Pool

function readSlugInput(slug: unknown): string | null {
  if (typeof slug === 'string') {
    return slug
  }

  if (
    slug &&
    typeof slug === 'object' &&
    'set' in slug &&
    typeof (slug as { set?: unknown }).set === 'string'
  ) {
    return (slug as { set: string }).set
  }

  return null
}

function writeNormalizedSlug(data: Record<string, unknown>, normalizedSlug: string) {
  if (typeof data.slug === 'string') {
    data.slug = normalizedSlug
    return
  }

  if (
    data.slug &&
    typeof data.slug === 'object' &&
    'set' in data.slug
  ) {
    ;(data.slug as { set: string }).set = normalizedSlug
    return
  }

  data.slug = normalizedSlug
}

function validateSlugInArgs(data: Record<string, unknown> | undefined) {
  if (!data) {
    return
  }

  const rawSlug = readSlugInput(data.slug)

  if (rawSlug === null) {
    return
  }

  const normalizedSlug = assertValidUserSlug(rawSlug)
  writeNormalizedSlug(data, normalizedSlug)
}

function withUserSlugValidation(client: PrismaClient) {
  return client.$extends({
    query: {
      usuario: {
        async create({ args, query }: { args: any; query: any }) {
          validateSlugInArgs(args.data as Record<string, unknown>)
          return query(args)
        },
        async update({ args, query }: { args: any; query: any }) {
          validateSlugInArgs(args.data as Record<string, unknown>)
          return query(args)
        },
        async upsert({ args, query }: { args: any; query: any }) {
          validateSlugInArgs(args.create as Record<string, unknown>)
          validateSlugInArgs(args.update as Record<string, unknown>)
          return query(args)
        },
      },
    },
  })
}

declare global {
  var __prisma: PrismaClient | undefined
  var __pool: Pool | undefined
}

let basePrisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  basePrisma = new PrismaClient({ adapter: new PrismaPg(pool) })
} else {
  if (!global.__pool) {
    global.__pool = new Pool({ connectionString: process.env.DATABASE_URL! })
  }
  pool = global.__pool

  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      adapter: new PrismaPg(pool)
    })
  }

  basePrisma = global.__prisma
}

const prisma = withUserSlugValidation(basePrisma)

process.on('beforeExit', async () => {
  await pool.end()
  await basePrisma.$disconnect()
})

export default prisma
