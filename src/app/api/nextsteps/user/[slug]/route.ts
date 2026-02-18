import prisma from '@/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
        console.log("passou")
    const { slug } = await params; 
    console.log("passou")
    console.log(slug)
    const user = await prisma.usuario.findUnique({
      where: { slug },
      select: { name: true, image: true, desc: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { desc } = body;

    const updatedUser = await prisma.usuario.update({
      where: { slug },
      data: { desc },
      select: { name: true, image: true, desc: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}   