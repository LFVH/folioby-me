import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';
import { verifyUser } from '@/utils/verifyUserAuth';
import {
  FEEDBACK_BODY_MAX_BYTES,
  FEEDBACK_LIMITE_POR_USUARIO,
  feedbackSchema,
} from '@/lib/feedback';
import { avisarFeedbackNoTelegram } from '@/lib/telegram';

async function avisarDono(userId: string, feedback: { nota: number; mensagem: string; podeContatar: boolean }) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return;
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: userId }, select: { name: true, email: true } });
    await avisarFeedbackNoTelegram({ ...feedback, nome: usuario?.name, email: usuario?.email });
  } catch {
    // O feedback já está salvo; o aviso é só conveniência.
  }
}

function erro(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

function mesmaOrigem(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;

    const enviados = await prisma.feedback.count({ where: { userId: authResult.userId } });

    return NextResponse.json({ success: true, enviados, limite: FEEDBACK_LIMITE_POR_USUARIO });
  } catch (error) {
    console.error('Erro ao consultar feedbacks:', error);
    return erro('Erro interno do servidor', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId } = authResult;

    if (!mesmaOrigem(request)) {
      return erro('Origem não permitida', 403);
    }

    if (!request.headers.get('content-type')?.includes('application/json')) {
      return erro('Envie os dados em JSON', 415);
    }

    if (Number(request.headers.get('content-length')) > FEEDBACK_BODY_MAX_BYTES) {
      return erro('Feedback grande demais', 413);
    }

    const raw = await request.text();
    if (Buffer.byteLength(raw, 'utf8') > FEEDBACK_BODY_MAX_BYTES) {
      return erro('Feedback grande demais', 413);
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return erro('JSON inválido', 400);
    }

    const parsed = feedbackSchema.safeParse(body);
    if (!parsed.success) {
      return erro(parsed.error.issues[0]?.message ?? 'Dados inválidos', 400);
    }

    const existentes = await prisma.feedback.findMany({ where: { userId }, select: { seq: true } });
    const ocupadas = new Set(existentes.map(({ seq }) => seq));
    const posicoes = Array.from({ length: FEEDBACK_LIMITE_POR_USUARIO }, (_, i) => i + 1);
    const seq = posicoes.find((posicao) => !ocupadas.has(posicao));
    if (!seq) {
      return erro('Você já enviou o número máximo de feedbacks. Obrigado!', 409);
    }

    try {
      await prisma.feedback.create({
        data: { userId, seq, ...parsed.data },
        select: { id: true },
      });
    } catch (error) {
      // Dois envios simultâneos disputam a mesma posição; o índice único do banco barra o segundo.
      if ((error as { code?: string })?.code === 'P2002') {
        return erro('Seu feedback já está sendo registrado. Tente de novo em instantes.', 409);
      }
      throw error;
    }

    // Aguardado (com timeout de 3s): na Vercel, trabalho solto depois da resposta pode ser interrompido.
    await avisarDono(userId, parsed.data);

    return NextResponse.json(
      { success: true, enviados: existentes.length + 1, limite: FEEDBACK_LIMITE_POR_USUARIO },
      { status: 201 }
    );
  } catch (error) {
    // Só o código: o erro do banco pode trazer a linha recusada, com o texto do usuário.
    console.error('Erro ao registrar feedback:', (error as { code?: string })?.code ?? 'sem código');
    return erro('Erro interno do servidor', 500);
  }
}
