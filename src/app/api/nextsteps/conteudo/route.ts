import { NextRequest, NextResponse } from 'next/server'
import prisma from "../../../../prisma"
import {verifyUser } from "@/utils/verifyUserAuth"
import { BlobService } from '@/lib/blob-service';

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
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Construir o objeto where dinamicamente
    const where: any = {
      userId: userId // Adiciona o filtro por userId
    }

    // Adiciona condição de search se existir
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } }
      ]
    }

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
        where, // Adiciona o where com as condições
        orderBy: [
          {
            isTrend: 'desc' // Primeiro ordena por isTrend (trending primeiro)
          },
          {
            updatedAt: 'desc' // Depois por updatedAt (mais recentes primeiro)
          }
        ],
        skip,
        take: limit
      }),
      prisma.conteudo.count({ where }) // Adiciona where também no count para contagem precisa
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
    if(!isPremium) return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
      )
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const fonte = formData.get('fonte') as string
    const link = formData.get('link') as string
    const linkext = formData.get('linkext') as string
    const categoriasIds = formData.get('categoriasIds') as string
      // NOVO: Verificar se é sequência de imagens
    const isSequence = formData.get('isSequence') === 'true';
    const files = formData.getAll('files') as File[]; // Para múltiplos uploads
    const singleFile = formData.get('file') as File | null;

    let mediaUrls: string[] = [];
    let mediaType = 'single';
    let filename = '';
    let mimetype = '';
    
    if (isSequence && files.length > 0) {
      // Upload de múltiplas imagens
      mediaType = 'sequence';
      const uploads = await BlobService.uploadMultiple(files, `nextsteps/sequences/${Date.now()}`);
      mediaUrls = uploads.map(u => u.url);
      filename = files[0].name; // Nome do primeiro arquivo como referência
      mimetype = 'image/sequence';
      
    } else if (singleFile) {
      // Upload de arquivo único (compatível com GIFs existentes)
      const buffer = Buffer.from(await singleFile.arrayBuffer());
      const upload = await BlobService.uploadFromServer(
        buffer,
        singleFile.name,
        singleFile.type
      );
      mediaUrls = [upload.url];
      filename = upload.filename;
      mimetype = upload.mimetype;
    }


    // Processar categorias
    const categoriasConnect = categoriasIds 
      ? categoriasIds.split(',').map(id => ({ id: parseInt(id) }))
      : []

    const conteudo = await prisma.conteudo.create({
      data: {
        name,
        fonte,
        link: mediaUrls[0] || null,
        linkext,
        filename,
        mimetype,
        data: Buffer.from(''),
        mediaType,
        mediaUrls,
        categorias: {
          connect: categoriasConnect
        },
        user: {
          connect: {
            id: userId 
          }
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