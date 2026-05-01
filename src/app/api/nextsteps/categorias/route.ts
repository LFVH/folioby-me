import { NextRequest, NextResponse } from 'next/server'
import prisma from "../../../../prisma"
import { verifyUser } from "@/utils/verifyUserAuth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    if(!isPremium) return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
    ) 
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '99')
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    const where: any = {
      userId
    }
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [categorias, total] = await Promise.all([
      prisma.categoria.findMany({
        where,
        include: {
          _count: {
            select: {
              conteudos: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.categoria.count({ where })
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      success: true,
      data: categorias,
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
    console.error('Erro ao buscar categorias:', error)
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
    if(!isPremium) return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
      )
    const body = await request.json()
    const { nome, name, descricao } = body
    
    if (!nome && !name) {
      return NextResponse.json(
        { success: false, error: 'Nome (PT) ou Name (EN) é obrigatório' },
        { status: 400 }
      )
    }

    const categoria = await prisma.categoria.create({
      data: {
        nome: nome || null,
        name: name || null,
        descricao: descricao || null,
        user: {
          connect: {
            id: userId 
          }
        }
      },
    })

    return NextResponse.json({
      success: true,
      data: categoria,
      message: 'Categoria criada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
