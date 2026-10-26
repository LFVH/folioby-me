import prisma from "@/prisma";
import { verifyUser } from "@/utils/verifyUserAuth";
import { NextRequest, NextResponse } from "next/server";
import { serializeJsonSafe } from '@/lib/json-safe';

// Descrição do perfil: JSON do TipTap. 100 mil caracteres cobrem textos longos com folga.
const MAX_DESC_CHARS = 100_000;

function isTipTapDoc(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    && (value as { type?: unknown }).type === "doc";
}

function perfilDeOutroUsuario() {
  return NextResponse.json({ error: "Perfil não pertence ao usuário logado" }, { status: 403 });
}

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
    const user = await prisma.usuario.findUnique({
      where: { id: authResult.userId },
      select: { slug: true, name: true, image: true, desc: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario nao encontrado" }, { status: 404 });
    }
    if (user.slug !== slug) {
      return perfilDeOutroUsuario();
    }

    const { name, image, desc } = user;
    return NextResponse.json({ name, image, desc });
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error instanceof Error ? error.message : error);
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

    if (desc !== null && !isTipTapDoc(desc)) {
      return NextResponse.json({ error: "Descrição inválida" }, { status: 400 });
    }
    if (JSON.stringify(desc).length > MAX_DESC_CHARS) {
      return NextResponse.json({ error: "Descrição grande demais" }, { status: 413 });
    }

    // O slug da URL só identifica o perfil; quem pode alterar é sempre o usuário da sessão.
    const owner = await prisma.usuario.findUnique({
      where: { id: authResult.userId },
      select: { slug: true }
    });
    if (!owner || owner.slug !== slug) {
      return perfilDeOutroUsuario();
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: authResult.userId },
      data: { desc },
      select: { name: true, image: true, desc: true }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar descrição do perfil:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
