import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma";
import { isHis, verifyUser } from "@/utils/verifyUserAuth";
import { BlobService } from "@/lib/blob-service";

async function ensureConteudoAccess(userId: string, isPremium: boolean, id: number) {
  if (!isPremium || !(await isHis(userId, id))) {
    return NextResponse.json(
      { success: false, error: "Conteudo nao encontrado" },
      { status: 403 }
    );
  }

  return null;
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

    const accessError = await ensureConteudoAccess(userId, isPremium, id);
    if (accessError) return accessError;

    await prisma.conteudo.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Conteudo excluido com sucesso"
    });
  } catch (error) {
    console.error("Erro ao excluir conteudo:", error);
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

    const accessError = await ensureConteudoAccess(userId, isPremium, id);
    if (accessError) return accessError;

    const conteudo = await prisma.conteudo.findUnique({
      where: { id }
    });

    if (!conteudo) {
      return NextResponse.json(
        { error: "Conteudo nao encontrado" },
        { status: 404 }
      );
    }

    if (conteudo.link) {
      return NextResponse.redirect(conteudo.link, 302);
    }

    if (conteudo.data) {
      const buffer = Buffer.from(conteudo.data);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": conteudo.mimetype || "image/gif",
          "Content-Disposition": `inline; filename="${conteudo.filename}"`,
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return NextResponse.json(
      { error: "Conteudo sem arquivo" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Erro ao buscar conteudo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyUser();

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { userId, isPremium } = authResult;

    const id = parseInt((await params).id, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const accessError = await ensureConteudoAccess(
      userId,
      isPremium,
      id
    );

    if (accessError) {
      return accessError;
    }

    const conteudoExistente = await prisma.conteudo.findUnique({
      where: { id },
    });

    if (!conteudoExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "Conteúdo não encontrado",
        },
        {
          status: 404,
        }
      );
    }

    // =========================
    // BODY JSON
    // =========================

    const body = await request.json();

    const {
      name,
      fonte,
      link,
      linkext,
      categoriasIds,
      isSequence,
      mediaUrls,
    } = body;

    // =========================
    // UPDATE DATA
    // =========================

    const updateData: any = {
      name,
      fonte,
      linkext,
      updatedAt: new Date(),
    };

    // =========================
    // NOVOS ARQUIVOS
    // =========================

    if (mediaUrls?.length > 0) {

      // remove blobs antigos
      if (conteudoExistente.mediaUrls?.length > 0) {
        for (const url of conteudoExistente.mediaUrls) {
          try {
            if (
              url?.includes("blob.vercel-storage.com")
            ) {
              await BlobService.deleteFile(url);
            }
          } catch (deleteError) {
            console.error(
              "Erro ao deletar blob antigo:",
              deleteError
            );
          }
        }
      }

      let filename = "";
      let mimetype = "";

      const firstUrl = mediaUrls[0];

      filename =
        firstUrl?.split("/").pop() || "";

      if (filename.endsWith(".mp4")) {
        mimetype = "video/mp4";
      } else if (filename.endsWith(".pdf")) {
        mimetype = "application/pdf";
      } else if (filename.endsWith(".webp")) {
        mimetype = "image/webp";
      } else if (filename.endsWith(".png")) {
        mimetype = "image/png";
      } else {
        mimetype = "image/jpeg";
      }

      updateData.link = firstUrl;

      updateData.filename = filename;

      updateData.mimetype = mimetype;

      updateData.mediaType = isSequence
        ? "sequence"
        : "single";

      updateData.mediaUrls = mediaUrls;

      updateData.data = Buffer.from("");
    }

    // =========================
    // LINK EXTERNO
    // =========================

    else if (link !== undefined) {
      updateData.link = link;
    }

    // =========================
    // CATEGORIAS
    // =========================

    if (categoriasIds?.length > 0) {
      updateData.categorias = {
        set: categoriasIds.map((id: number) => ({
          id,
        })),
      };
    }

    // =========================
    // UPDATE
    // =========================

    const conteudo = await prisma.conteudo.update({
      where: { id },

      data: updateData,

      include: {
        categorias: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: conteudo,
      message: "Conteúdo atualizado com sucesso",
    });

  } catch (error) {
    console.error(
      "Erro ao atualizar conteúdo:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
      },
      {
        status: 500,
      }
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

    const accessError = await ensureConteudoAccess(userId, isPremium, id);
    if (accessError) return accessError;

    const conteudoExistente = await prisma.conteudo.findUnique({
      where: { id }
    });

    if (!conteudoExistente) {
      return NextResponse.json(
        { success: false, error: "Conteudo nao encontrado" },
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

    let conteudo = null;

    if (toggle === "istrend") {
      conteudo = await prisma.conteudo.update({
        where: { id },
        data: {
          isTrend: !conteudoExistente.isTrend
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: conteudo,
      message: "Atualizada com sucesso"
    });
  } catch (error: any) {
    console.error("Erro ao atualizar conteudo:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
