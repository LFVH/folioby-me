import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../prisma";
import { isHis, verifyUser } from "@/utils/verifyUserAuth";
import { BlobService } from "@/lib/blob-service";
import { applyUserStorageDelta, checkUserStorageQuotaByDelta, removeUserStorageBytes } from '@/lib/storage-quota';

const serializeJsonSafe = <T>(value: T): T => {
  if (typeof value === 'bigint') {
    return Number(value) as T
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeJsonSafe(item)) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, serializeJsonSafe(item)])
    ) as T
  }

  return value
}

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== "string") return null;

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
};

const normalizeCategoriaIds = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0)
    ),
  ];
};

const normalizeMediaUrls = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};

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
  { params }: { params: Promise<{ id: string }> }
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
      where: { id },
    });

    if (!conteudoExistente) {
      return NextResponse.json(
        { success: false, error: "Conteudo nao encontrado" },
        { status: 404 }
      );
    }

    if (conteudoExistente.mediaUrls?.length > 0) {
      for (const url of conteudoExistente.mediaUrls) {
        try {
          if (url?.includes("blob.vercel-storage.com")) {
            await BlobService.deleteFile(url);
          }
        } catch (deleteError) {
          console.error("Erro ao deletar blob antigo:", deleteError);
        }
      }
    }

    const removedStorageBytes = Number(conteudoExistente.storageBytes || 0);
    await removeUserStorageBytes(userId, removedStorageBytes);

    await prisma.conteudo.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Conteudo excluido com sucesso",
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
  { params }: { params: Promise<{ id: string }> }
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
      where: { id },
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
        { success: false, error: "ID invalido" },
        { status: 400 }
      );
    }

    const accessError = await ensureConteudoAccess(userId, isPremium, id);
    if (accessError) {
      return accessError;
    }

    const conteudoExistente = await prisma.conteudo.findUnique({
      where: { id },
      include: { categorias: true },
    });

    if (!conteudoExistente) {
      return NextResponse.json(
        {
          success: false,
          error: "Conteudo nao encontrado",
        },
        {
          status: 404,
        }
      );
    }

    const body = await request.json();
    const {
      name,
      fonte,
      link,
      linkext,
      categoriasIds,
      isSequence,
      mediaUrls,
      storageBytes,
    } = body;

    const normalizedName = normalizeOptionalText(name);
    const normalizedFonte = normalizeOptionalText(fonte);
    const normalizedLink = normalizeOptionalText(link);
    const normalizedLinkext = normalizeOptionalText(linkext);
    const normalizedCategoriasIds = normalizeCategoriaIds(categoriasIds);
    const normalizedMediaUrls = normalizeMediaUrls(mediaUrls);

    if (!normalizedName) {
      return NextResponse.json(
        { success: false, error: "Informe o nome do conteudo." },
        { status: 400 }
      );
    }

    if (normalizedCategoriasIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Selecione pelo menos uma categoria." },
        { status: 400 }
      );
    }

    const categoriasValidas = await prisma.categoria.findMany({
      where: {
        id: {
          in: normalizedCategoriasIds,
        },
        userId,
      },
      select: {
        id: true,
      },
    });

    if (categoriasValidas.length !== normalizedCategoriasIds.length) {
      return NextResponse.json(
        { success: false, error: "Uma ou mais categorias selecionadas sao invalidas." },
        { status: 400 }
      );
    }

    const oldStorageBytes = Number(conteudoExistente.storageBytes || 0);
    const nextStorageBytes = Number(storageBytes || 0);
    const storageDelta = nextStorageBytes - oldStorageBytes;

    if (storageDelta > 0) {
      const quota = await checkUserStorageQuotaByDelta(userId, storageDelta);
      if (!quota.allowed) {
        return NextResponse.json(
          { success: false, error: quota.message },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      name: normalizedName,
      fonte: normalizedFonte,
      linkext: normalizedLinkext,
      updatedAt: new Date(),
      storageBytes: BigInt(Math.max(0, nextStorageBytes)),
      categorias: {
        set: categoriasValidas.map(({ id: categoriaId }) => ({
          id: categoriaId,
        })),
      },
    };

    if (normalizedMediaUrls.length > 0) {
      if (conteudoExistente.mediaUrls?.length > 0) {
        for (const url of conteudoExistente.mediaUrls) {
          try {
            if (url?.includes("blob.vercel-storage.com")) {
              await BlobService.deleteFile(url);
            }
          } catch (deleteError) {
            console.error("Erro ao deletar blob antigo:", deleteError);
          }
        }
      }

      let filename = "";
      let mimetype = "";
      const firstUrl = normalizedMediaUrls[0];

      filename = firstUrl?.split("/").pop() || "";

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
      updateData.mediaType = isSequence ? "sequence" : "single";
      updateData.mediaUrls = normalizedMediaUrls;
      updateData.data = Buffer.from("");
    } else if (normalizedLink) {
      updateData.link = normalizedLink;
    } else if (!conteudoExistente.link) {
      return NextResponse.json(
        { success: false, error: "Envie um arquivo antes de salvar o conteudo." },
        { status: 400 }
      );
    }

    if (storageDelta > 0) {
      await applyUserStorageDelta(userId, storageDelta);
    } else if (storageDelta < 0) {
      await removeUserStorageBytes(userId, Math.abs(storageDelta));
    }

    const conteudo = await prisma.conteudo.update({
      where: { id },
      data: updateData,
      include: {
        categorias: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: serializeJsonSafe(conteudo),
      message: "Conteudo atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar conteudo:", error);

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
  { params }: { params: Promise<{ id: string }> }
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
      where: { id },
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
          isTrend: !conteudoExistente.isTrend,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: conteudo,
      message: "Atualizada com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar conteudo:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
