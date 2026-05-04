import { NextRequest, NextResponse } from 'next/server'
import {verifyUser } from "@/utils/verifyUserAuth"
import { BlobService } from '@/lib/blob-service';
import prisma from '@/prisma';
import { linkSchema } from '@/app/api/auth/auth/definitions';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    if(!isPremium) return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
    ) 
  const data = await prisma.usuario.findUnique({
    where: { id: userId },
    select: { links: true }
  })
    if(!data) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json({
      success: true,
      data: data?.links ?? []
    })
  } 
   catch (error) {
    console.error('Erro ao buscar links:', error)
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

  const parsed = linkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 })
  }

  const { nr_redesocial, link, titulo } = parsed.data

  const existing = await prisma.usuario.findUnique({
    where: { id: userId }
  })
  if(!existing){
    return NextResponse.json(
      { success: false, error: 'Usuário não encontrado' },
      { status: 404 }
    )
  }
  const newItem: [number, string, string] = [nr_redesocial, link, titulo]

  if (!existing.links) {
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        links: [newItem]
      }
    })
  } else {
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        links: [...(existing.links as any[]), newItem]
      }
    })
  }

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Link criado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao criar Link:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    if(!isPremium) return NextResponse.json(
        { success: false, error: '404 Not Found' },
        { status: 403 }
      )
      const { index } = await request.json()

  const existing = await prisma.usuario.findUnique({
    where: { id: userId }
  })

  if (!existing) return NextResponse.json({ ok: false })

  const updated = (existing.links as any[]).filter((_, i) => i !== index)

  await prisma.usuario.update({
    where: { id: userId },
    data: { links: updated }
  })

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Link excluido com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir link:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}