import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authHandler from "@/app/api/nxtHandle/nextAuthHandler";
import prisma from "../prisma";
import { Usuario } from "../../generated/prisma/client";
import { logNow } from "./Logging";
''
export async function verifyUser() {
  try {
    const userDB = await userExists();
    if(userDB instanceof NextResponse) return userDB;
  
    return {
    userId: userDB?.id,
    isPremium: userDB?.isPremium || false
    };
  } catch (error) {
    logNow("verifyUser " + (error instanceof Error ? error.message : 'Ocorreu um erro!'));
    return NextResponse.json(
      { success: false, body: { message: error instanceof Error ? error.message : 'Ocorreu um erro!' } },
      { status: 400 }
    );
  }
}


export async function isActuallyChief(userId: string) {
  const adminUserIds = process.env.CHIEF_USER_IDS?.split(',') || [];
  return adminUserIds.includes(userId);
}

export async function isHis(userId: string, conteudoId: number): Promise<boolean> {
  try {
    // Validação dos parâmetros de entrada
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn('isHis: userId inválido ou vazio');
      return false;
    }

    if (!conteudoId || typeof conteudoId !== 'number' || conteudoId <= 0) {
      console.warn('isHis: conteudoId inválido');
      return false;
    }

    // Usando template tag para evitar SQL injection (Prisma já sanitiza)
    const result = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS(
        SELECT 1 FROM "Conteudo" 
        WHERE "id" = ${conteudoId}::integer 
          AND "userId" = ${userId}::uuid
        LIMIT 1
      ) as "exists"
    `;

    // Verifica se temos um resultado válido
    if (!result || !Array.isArray(result) || result.length === 0) {
      console.error('isHis: Resultado inesperado da query', result);
      return false;
    }

    return result[0].exists;
    
  } catch (error) {
    // Log detalhado do erro
    console.error('Erro em isHis:', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      conteudoId,
      timestamp: new Date().toISOString()
    });
    
    // Retorna false seguro em caso de erro
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

function checkPremiumExpiration(user: Usuario ) {
  // Get current date (without time component)
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // If user has no premium dates, consider as expired
  if (!user.dtIniPremium || !user.dtFimPremium) {
      throw new Error("101 - 1");
  }

  // Normalize dates by removing time components
  const dtIni = new Date(user.dtIniPremium);
  dtIni.setHours(0, 0, 0, 0);
  
  const dtFim = new Date(user.dtFimPremium);
  dtFim.setHours(0, 0, 0, 0);

  // Check if current date is outside premium period
  if (currentDate < dtIni || currentDate >= dtFim) {
      throw new Error("101 - 2");
  }
  return user.id;
}