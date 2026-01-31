import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/database/prisma";
import { verifyUser } from '@/utils/verifyUserAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const id = parseInt((await params).id, 10);
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;
    if (isNaN(id)) return NextResponse.json({ message: "id inválido" }, { status: 400 });
    const conteudo = await prisma.conteudo.findUnique({
      where: { id: id,
        ...(!isPremium && { isFree: isPremium })
       }
    })

    if (!conteudo) {
      return NextResponse.json(
        { error: 'Conteúdo não encontrado' },
        { status: 404 }
      )
    }
    const buffer = Buffer.from(conteudo.data)
    
    return new NextResponse(buffer, {
    headers: {
        'Content-Type': conteudo.mimetype,
        'Content-Disposition': `inline; filename="${conteudo.filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}