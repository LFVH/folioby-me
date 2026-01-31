import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/database/prisma"
import { isActuallyChief, verifyUser } from "@/utils/verifyUserAuth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    if(!isActuallyChief(userId)) return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
    ) 
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const [conteudos, total] = await Promise.all([
      prisma.conteudo.findMany({
        include: {
          categorias: {
            select: {
              id: true,
              nome: true,
              name: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.conteudo.count()
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: conteudos,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    })
  } catch (error) {
    console.error('Erro ao buscar conteúdos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    if(!isActuallyChief(userId)) return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
      )
    const formData = await request.formData()
    
    const nome = formData.get('nome') as string
    const name = formData.get('name') as string
    const fonte = formData.get('fonte') as string
    const link = formData.get('link') as string
    const linkext = formData.get('linkext') as string
    const categoriasIds = formData.get('categoriasIds') as string
    const file = formData.get('file') as File

    // Validação do arquivo
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    if (!file.type.includes('gif')) {
      return NextResponse.json(
        { success: false, error: 'Apenas arquivos GIF são permitidos' },
        { status: 400 }
      )
    }

    // Converter File para Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Processar categorias
    const categoriasConnect = categoriasIds 
      ? categoriasIds.split(',').map(id => ({ id: parseInt(id) }))
      : []

    const conteudo = await prisma.conteudo.create({
      data: {
        nome,
        name,
        fonte,
        link,
        linkext,
        filename: file.name,
        mimetype: file.type,
        data: buffer,
        categorias: {
          connect: categoriasConnect
        }
      },
      include: {
        categorias: true
      }
    })

    return NextResponse.json({
      success: true,
      data: conteudo,
      message: 'Conteúdo criado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao criar conteúdo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}