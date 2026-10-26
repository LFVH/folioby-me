import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { isFileLikeUserSlug } from '@/lib/user-slug';
import { serializeJsonSafe } from '@/lib/json-safe';

// GET
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params; 
    if (isFileLikeUserSlug(slug)) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const user = await prisma.usuario.findUnique({
      where: { slug },
      select: { name: true, image: true, desc: true, links: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(serializeJsonSafe(user));
  } catch (error) {
    console.error('Erro ao buscar perfil público:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
