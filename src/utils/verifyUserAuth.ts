import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authHandler from "@/app/api/nxtHandle/nextAuthHandler";
import prisma from "../prisma";
import { Usuario } from "../../generated/prisma/client";
import { logNow } from "./Logging";
import { isFileLikeUserSlug } from "@/lib/user-slug";

type VerifiedUser = {
  userId: string;
  isPremium: boolean;
}

type ResourceType = "conteudo" | "categoria";

export async function verifyUserById(userId: string): Promise<VerifiedUser | NextResponse> {
  try {
    if (!userId?.trim()) {
      return NextResponse.json(
        { success: false, body: { message: "Usuário não autenticado." } },
        { status: 401 }
      );
    }

    const userDB = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isPremium: true,
        isBlocked: true,
        dtFimPremium: true,
      },
    });

    if (!userDB || userDB.isBlocked) {
      return NextResponse.json(
        { success: false, body: { message: "Usuário ou senha incorretos." } },
        { status: 400 }
      );
    }
    if(userDB.dtFimPremium && userDB.isPremium && new Date() > userDB.dtFimPremium){
      await prisma.usuario.update({
        where: { id: userId },
        data: {
           isPremium: false,
        }
      });
      userDB.isPremium = false;
    }
    return {
      userId: userDB.id,
      isPremium: userDB.isBlocked ? !userDB.isBlocked : userDB.isPremium,
    };
  } catch (error) {
    logNow("verifyUserById " + (error instanceof Error ? error.message : "Ocorreu um erro!"));
    return NextResponse.json(
      { success: false, body: { message: error instanceof Error ? error.message : "Ocorreu um erro!" } },
      { status: 400 }
    );
  }
}

export async function verifyUser() {
  try {
    const session = await getServerSession(authHandler);
    if (!session?.id) {
      return NextResponse.json(
        { success: false, body: { message: "Usuário não autenticado." } },
        { status: 401 }
      );
    }

    return verifyUserById(session.id);
  } catch (error) {
    logNow("verifyUser " + (error instanceof Error ? error.message : "Ocorreu um erro!"));
    return NextResponse.json(
      { success: false, body: { message: error instanceof Error ? error.message : "Ocorreu um erro!" } },
      { status: 400 }
    );
  }
}

export function isActuallyChief(userId: string) {
  const adminUserIds = process.env.CHIEF_USER_IDS?.split(",") || [];
  return adminUserIds.includes(userId);
}

export async function isHis(
  userId: string,
  resourceId: number,
  resourceType: ResourceType = "conteudo"
): Promise<boolean> {
  try {
    if (!userId || typeof userId !== "string" || userId.trim() === "") {
      console.warn("isHis: userId invalido ou vazio");
      return false;
    }

    if (!resourceId || typeof resourceId !== "number" || resourceId <= 0) {
      console.warn("isHis: resourceId invalido");
      return false;
    }

    if (resourceType === "categoria") {
      const categoria = await prisma.categoria.findFirst({
        where: { id: resourceId, userId },
        select: { id: true },
      });

      return Boolean(categoria);
    }

    const conteudo = await prisma.conteudo.findFirst({
      where: { id: resourceId, userId },
      select: { id: true },
    });

    return Boolean(conteudo);
  } catch (error) {
    console.error("Erro em isHis:", {
      error: error instanceof Error ? error.message : "Erro desconhecido",
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      resourceId,
      resourceType,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

export async function userExists(): Promise<Usuario | NextResponse>  {
  const session = await getServerSession(authHandler);
    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, body: { message: "Usuário não autenticado." } },
        { status: 401 }
      );
    }
    const userId = session.id;
    const userExists = await prisma.usuario.findUnique({
      where: { id: userId },
    });
    if (userExists && !userExists.isBlocked) {
      return userExists;
    }
    return NextResponse.json(
      { success: false, body: { message: "Usuário ou senha incorretos." } },
      { status: 400 }
    );
}

export async function findBySlug(slug: string): Promise<Usuario | NextResponse>  {
    if (isFileLikeUserSlug(slug)) {
      return NextResponse.json(
        { success: false, body: { message: "Not Found" } },
        { status: 404 }
      );
    }

    const userExists = await prisma.usuario.findUnique({
      where: { slug: slug },
    });
    if (userExists && !userExists.isBlocked && userExists.isPremium) {
      return userExists;
    }
    console.error("SLUG: " + slug)
    return NextResponse.json(
      { success: false, body: { message: "Not Found" } },
      { status: 400 }
    );
}
