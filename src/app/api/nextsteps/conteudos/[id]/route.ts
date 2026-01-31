import { NextRequest, NextResponse } from "next/server";
import prisma from "@/database/prisma";
import { isActuallyChief, verifyUser } from "@/utils/verifyUserAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    const conteudo = await prisma.conteudo.findUnique({
      where: { id: parseInt((await params).id) },
      include: {
        categorias: {
          select: {
            id: true,
            nome: true,
            name: true
          }
        }
      }
    })

    if (!conteudo) {
      return NextResponse.json(
        { success: false, error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: conteudo
    })
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}