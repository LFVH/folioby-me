import prisma from "@/prisma";
import { verifyUser } from "@/utils/verifyUserAuth";
import { NextRequest, NextResponse } from "next/server";
import { serializeJsonSafe } from '@/lib/json-safe';

// GET
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;

    const { isPremium } = authResult;
    if (!isPremium) {
      return NextResponse.json({ error: "404 Not Found" }, { status: 403 });
    }

    const { slug } = await params;
    console.log(slug);
    const user = await prisma.usuario.findUnique({
      where: { slug },
      select: { name: true, image: true, desc: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// PUT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;

    const { isPremium } = authResult;
    if (!isPremium) {
      return NextResponse.json({ error: "404 Not Found" }, { status: 403 });
    }

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
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
