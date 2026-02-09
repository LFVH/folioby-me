import { NextRequest, NextResponse } from 'next/server'
import prisma from "../../../../../prisma"
import { isActuallyChief, verifyUser } from "@/utils/verifyUserAuth"
import { criarURL } from '@/lib/utils';
import { refreshSlugCache } from '@/lib/db/slug-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    const id = (await params).id;
    if (userId != id)
      return NextResponse.json(
        { success: false, error: 'Erro, não encontrado' },
        { status: 403 }
      ) 
    const body = await request.json()
    const { slug } = body
    const userDB = await prisma.usuario.findUnique({
      where: { id: id}
    })
    
    if (!userDB) {
      return NextResponse.json(
        { success: false, error: 'User não encontrada' },
        { status: 404 }
      )
    }
    const slugNormalizada = criarURL(slug, {incluirNumero: false})
    const findSlugDB = await prisma.usuario.findUnique({
      where: { slug: slugNormalizada}
    })

    if (findSlugDB) {
      return NextResponse.json(
        { success: false, error: 'Slug já utilizada' },
        { status: 403 }
      )
    }
    const userUpdt = await prisma.usuario.update({
      where: { id: id },
      data: {
        slug: slugNormalizada
      }
    })
     await refreshSlugCache()
    return NextResponse.json({
      success: true,
      data: userUpdt,
      message: 'User atualizada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao atualizar user:', error)

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    const id = (await params).id;
    if (userId != id)
      return NextResponse.json(
        { success: false, error: 'Erro, não encontrado' },
        { status: 403 }
      )
    
    const userDB = await prisma.usuario.findUnique({
      where: { id: id },
    })

    if (!userDB) {
      return NextResponse.json(
        { success: false, error: 'Usuario não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: userDB
    })
  } catch (error) {
    console.error('Erro ao buscar user:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}