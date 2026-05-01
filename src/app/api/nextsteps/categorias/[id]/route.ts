import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma";
import { verifyUser } from "@/utils/verifyUserAuth";

async function ensureCategoriaAccess(isPremium: boolean) {
  if (!isPremium) {
    return NextResponse.json(
      { success: false, error: "404 Not Found" },
      { status: 403 }
    );
  }

  return null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, isPremium } = authResult;
    const id = parseInt((await params).id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ message: "id invalido" }, { status: 400 });
    }

    const accessError = await ensureCategoriaAccess(isPremium);
    if (accessError) return accessError;

    const body = await request.json();
    const { nome, name, descricao } = body;

    const categoriaExistente = await prisma.categoria.findFirst({
      where: { id, userId }
    });

    if (!categoriaExistente) {
      return NextResponse.json(
        { success: false, error: "Categoria nao encontrada" },
        { status: 404 }
      );
    }

    await prisma.categoria.updateMany({
      where: { id, userId },
      data: {
        nome: nome !== undefined ? nome : categoriaExistente.nome,
        name: name !== undefined ? name : categoriaExistente.name,
        descricao: descricao !== undefined ? descricao : categoriaExistente.descricao
      }
    });

    const categoria = await prisma.categoria.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            conteudos: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: categoria,
      message: "Categoria atualizada com sucesso"
    });
  } catch (error: any) {
    console.error("Erro ao atualizar categoria:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "Ja existe uma categoria com este nome" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, isPremium } = authResult;
    const id = parseInt((await params).id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ message: "id invalido" }, { status: 400 });
    }

    const accessError = await ensureCategoriaAccess(isPremium);
    if (accessError) return accessError;

    const categoria = await prisma.categoria.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            conteudos: true
          }
        }
      }
    });

    if (!categoria) {
      return NextResponse.json(
        { success: false, error: "Categoria nao encontrada" },
        { status: 404 }
      );
    }

    if (categoria._count.conteudos > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Nao e possivel excluir categoria com conteudos associados"
        },
        { status: 400 }
      );
    }

    await prisma.categoria.deleteMany({
      where: { id, userId }
    });

    return NextResponse.json({
      success: true,
      message: "Categoria excluida com sucesso"
    });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
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
    const id = parseInt((await params).id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ message: "id invalido" }, { status: 400 });
    }

    const accessError = await ensureCategoriaAccess(isPremium);
    if (accessError) return accessError;

    const categoria = await prisma.categoria.findFirst({
      where: { id, userId },
      include: {
        _count: {
          select: {
            conteudos: true
          }
        }
      }
    });

    if (!categoria) {
      return NextResponse.json(
        { success: false, error: "Categoria nao encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;

    const { userId, isPremium } = authResult;
    const id = parseInt((await params).id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ message: "id invalido" }, { status: 400 });
    }

    const accessError = await ensureCategoriaAccess(isPremium);
    if (accessError) return accessError;

    const categoriaExistente = await prisma.categoria.findFirst({
      where: { id, userId }
    });

    if (!categoriaExistente) {
      return NextResponse.json(
        { success: false, error: "Categoria nao encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { toggle } = body;

    if (!toggle) {
      return NextResponse.json(
        { success: false, error: "O que fazer?" },
        { status: 404 }
      );
    }

    let categoria = null;

    if (toggle === "istrend") {
      await prisma.categoria.updateMany({
        where: { id, userId },
        data: {
          isTrend: !categoriaExistente.isTrend
        }
      });

      categoria = await prisma.categoria.findFirst({
        where: { id, userId }
      });
    }

    return NextResponse.json({
      success: true,
      data: categoria,
      message: "Atualizada com sucesso"
    });
  } catch (error: any) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
