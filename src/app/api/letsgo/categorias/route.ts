// src/app/api/letsgo/categorias/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from "../../../../prisma";
import { findBySlug } from '@/utils/verifyUserAuth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    if(!slug) return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        message: 'Erro Slug'
      },
      { status: 500 }
    )
    const userDB = await findBySlug(slug)
    if(userDB instanceof NextResponse) return userDB;
    const [categorias, total] = await Promise.all([
    prisma.categoria.findMany({
      where: {
        conteudos: {
          some: {
            AND: [
              { userId: userDB.id },
            ]
          }
        }
      },
      include: {
        conteudos: {
          where: {
            userId: userDB.id,
          },
          select: {
            id: true,
            name: true,
            filename: true,
            mimetype: true,
            link: true,
            linkext: true,
            fonte: true,
            createdAt: true,
            isTrend: true,
          },
          orderBy: [
            { isTrend: 'desc' },   // true vem primeiro em 'desc'
            { createdAt: 'desc' }, // depois ordena por data
          ],
        }
      },
        orderBy: [
          { isTrend: 'desc' },   // true vem primeiro em 'desc'
          { createdAt: 'desc' }, // depois ordena por data
        ],
      }),
      prisma.categoria.count({
        where: {
          conteudos: {
            some: {
              AND: [
                { userId: userDB.id },
              ]
            }
          }
        }
      })
    ])
    return NextResponse.json({
      success: true,
      data: categorias,
      //userType: 'premium'
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