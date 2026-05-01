import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma";
import { isHis, verifyUser } from "@/utils/verifyUserAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, isPremium } = authResult;
    const id = parseInt((await params).id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "id invalido" },
        { status: 400 }
      );
    }

    if (!isPremium || !(await isHis(userId, id))) {
      return NextResponse.json(
        { success: false, error: "Conteudo nao encontrado" },
        { status: 403 }
      );
    }

    const conteudo = await prisma.conteudo.findUnique({
      where: { id },
      include: {
        categorias: {
          select: {
            id: true,
            nome: true,
            name: true
          }
        }
      }
    });

    if (!conteudo) {
      return NextResponse.json(
        { success: false, error: "Conteudo nao encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conteudo
    });
  } catch (error) {
    console.error("Erro ao buscar conteudo:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
