// src/app/api/letsgo/categorias/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from "../../../../prisma";
import { verifyUser } from '@/utils/verifyUserAuth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId, isPremium } = authResult;
    const [categorias, total] = await Promise.all([
      prisma.categoria.findMany({
        include: {
          conteudos: {
            select: {
              id: true,
              nome: true,
              name: true,
              filename: true,
              mimetype: true,
              link: true,
              linkext: true,
              fonte: true,
              createdAt: true,
              isTrend: true,
            },
            orderBy: { createdAt: 'desc' },
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.categoria.count()
    ])

    return NextResponse.json({
      success: true,
      data: categorias,
      userType: 'premium'
    })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}