import { NextRequest, NextResponse } from 'next/server'
import prisma from "../../../../prisma"
import { verifyUser } from "@/utils/verifyUserAuth"
import { applyUserStorageDelta, checkUserStorageQuotaByDelta, removeUserStorageBytes } from '@/lib/storage-quota'

const serializeJsonSafe = <T>(value: T): T => {
  if (typeof value === 'bigint') {
    return Number(value) as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeJsonSafe(item)) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, serializeJsonSafe(item)])
    ) as T
  }

  return value
}

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') return null

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

const normalizeCategoriaIds = (value: unknown) => {
  if (!Array.isArray(value)) return []

  return [
    ...new Set(
      value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0)
    ),
  ]
}

const normalizeMediaUrls = (value: unknown) => {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyUser()
    if (authResult instanceof NextResponse) return authResult

    const { userId, isPremium } = authResult
    if (!isPremium) {
      return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    const where: any = {
      userId,
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [conteudos, total] = await Promise.all([
      prisma.conteudo.findMany({
        include: {
          categorias: {
            select: {
              id: true,
              nome: true,
              name: true,
            },
          },
        },
        where,
        orderBy: [
          {
            isTrend: 'desc',
          },
          {
            updatedAt: 'desc',
          },
        ],
        skip,
        take: limit,
      }),
      prisma.conteudo.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: serializeJsonSafe(conteudos),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar conteudos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyUser()
    if (authResult instanceof NextResponse) return authResult

    const { userId, isPremium } = authResult
    if (!isPremium) {
      return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      fonte,
      link,
      linkext,
      categoriasIds,
      isSequence,
      mediaUrls,
      storageBytes,
    } = body

    const normalizedName = normalizeOptionalText(name)
    const normalizedFonte = normalizeOptionalText(fonte)
    const normalizedLink = normalizeOptionalText(link)
    const normalizedLinkext = normalizeOptionalText(linkext)
    const normalizedCategoriasIds = normalizeCategoriaIds(categoriasIds)
    const normalizedMediaUrls = normalizeMediaUrls(mediaUrls)

    if (!normalizedName) {
      return NextResponse.json(
        { success: false, error: 'Informe o nome do conteudo.' },
        { status: 400 }
      )
    }

    if (normalizedCategoriasIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Selecione pelo menos uma categoria.' },
        { status: 400 }
      )
    }

    if (!normalizedLink && normalizedMediaUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Envie um arquivo antes de salvar o conteudo.' },
        { status: 400 }
      )
    }

    const categoriasValidas = await prisma.categoria.findMany({
      where: {
        id: {
          in: normalizedCategoriasIds,
        },
        userId,
      },
      select: {
        id: true,
      },
    })

    if (categoriasValidas.length !== normalizedCategoriasIds.length) {
      return NextResponse.json(
        { success: false, error: 'Uma ou mais categorias selecionadas sao invalidas.' },
        { status: 400 }
      )
    }

    const requestedStorageBytes = Number(storageBytes || 0)
    if (requestedStorageBytes > 0) {
      const quota = await checkUserStorageQuotaByDelta(userId, requestedStorageBytes)
      if (!quota.allowed) {
        return NextResponse.json(
          { success: false, error: quota.message },
          { status: 400 }
        )
      }
    }

    let mediaType = 'single'
    let filename = ''
    let mimetype = ''

    if (isSequence && normalizedMediaUrls.length > 0) {
      mediaType = 'sequence'
      filename = 'sequence'
      mimetype = 'image/sequence'
    } else if (normalizedMediaUrls.length > 0) {
      mediaType = 'single'

      const fileUrl = normalizedMediaUrls[0]
      filename = fileUrl.split('/').pop() || ''

      if (filename.endsWith('.mp4')) {
        mimetype = 'video/mp4'
      } else if (filename.endsWith('.pdf')) {
        mimetype = 'application/pdf'
      } else {
        mimetype = 'image/jpeg'
      }
    }

    const conteudo = await prisma.conteudo.create({
      data: {
        name: normalizedName,
        fonte: normalizedFonte,
        link: normalizedMediaUrls[0] || normalizedLink,
        linkext: normalizedLinkext,
        filename,
        mimetype,
        data: Buffer.from(''),
        mediaType,
        mediaUrls: normalizedMediaUrls,
        storageBytes: BigInt(requestedStorageBytes > 0 ? requestedStorageBytes : 0),
        categorias: {
          connect: categoriasValidas.map(({ id }) => ({ id })),
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        categorias: true,
      },
    })

    if (requestedStorageBytes > 0) {
      await applyUserStorageDelta(userId, requestedStorageBytes)
    }

    return NextResponse.json({
      success: true,
      data: serializeJsonSafe(conteudo),
      message: 'Conteudo criado com sucesso',
    })
  } catch (error) {
    console.error('Erro ao criar conteudo:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      {
        status: 500,
      }
    )
  }
}
