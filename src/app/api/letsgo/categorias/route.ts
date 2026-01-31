// src/app/api/letsgo/categorias/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/database/prisma";
import { verifyUser } from '@/utils/verifyUserAuth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    
    const { userId, isPremium } = authResult;

    if (isPremium) {
      // Usuário premium - traz tudo
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
                isFree: true,
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
    } else {
      // Usuário não premium - filtra categorias e conteúdos
      const categorias = await prisma.categoria.findMany({
        where: {
          isFree: true // Apenas categorias free
        },
        include: {
          conteudos: {
            where: {
              isFree: true // Apenas conteúdos free
            },
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
              isFree: true,
              isTrend: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              conteudos: {
                where: {
                  isFree: false // Conta conteúdos não free
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      })

      // Transforma os dados para incluir a contagem de conteúdos bloqueados
      const categoriasComBloqueados = categorias.map(categoria => {
        const conteudosBloqueados = categoria._count?.conteudos || 0;
        
        // Remove _count do objeto final
        const { _count, ...categoriaSemCount } = categoria;
        
        // Só adiciona conteudosBloqueados se houver conteúdos bloqueados
        return conteudosBloqueados > 0 
          ? { ...categoriaSemCount, conteudosBloqueados }
          : categoriaSemCount;
      })
      
      const totalCategoriasBloqueadas = await prisma.categoria.count({
        where: {
          isFree: false
        }
      })

      return NextResponse.json({
        success: true,
        data: categoriasComBloqueados,
        estatisticas: totalCategoriasBloqueadas > 0 ? totalCategoriasBloqueadas : undefined,
        userType: 'free'
      })
    }
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