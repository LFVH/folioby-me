import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/prisma';
import { verifyUser } from '@/utils/verifyUserAuth';
import { GET, POST } from './route';

vi.mock('@/utils/verifyUserAuth', () => ({ verifyUser: vi.fn() }));

const valido = { nota: 4, mensagem: 'Gostei da vitrine, mas faltou explicar o perfil.', podeContatar: true };

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new NextRequest('http://localhost/api/feedback', {
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
      headers: { 'content-type': 'application/json', origin: 'http://localhost', ...headers },
    })
  );
}

describe('/api/feedback', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(verifyUser).mockResolvedValue({ userId: 'user-maria', isPremium: false });
  });

  it('recusa quem nao esta logado', async () => {
    vi.mocked(verifyUser).mockResolvedValue(NextResponse.json({}, { status: 401 }));
    const create = vi.spyOn(prisma.feedback, 'create');

    const response = await post(valido);

    expect(response.status).toBe(401);
    expect(create).not.toHaveBeenCalled();
  });

  it('recusa envio vindo de outro site', async () => {
    const create = vi.spyOn(prisma.feedback, 'create');

    const response = await post(valido, { origin: 'https://site-malicioso.com' });

    expect(response.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
  });

  it('exige corpo JSON', async () => {
    const response = await post('nota=5', { 'content-type': 'application/x-www-form-urlencoded' });

    expect(response.status).toBe(415);
  });

  it('recusa corpo grande demais', async () => {
    const response = await post({ ...valido, mensagem: 'x'.repeat(10_000) });

    expect(response.status).toBe(413);
  });

  it('recusa pelo content-length antes de ler o corpo', async () => {
    const response = await post(valido, { 'content-length': '999999' });

    expect(response.status).toBe(413);
  });

  it('recusa nota fora de 1 a 5, mensagem curta e campos extras', async () => {
    const create = vi.spyOn(prisma.feedback, 'create');

    expect((await post({ ...valido, nota: 9 })).status).toBe(400);
    expect((await post({ ...valido, mensagem: '   oi    ' })).status).toBe(400);
    expect((await post({ ...valido, userId: 'outro-usuario' })).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('conta emoji como um caractere, igual ao banco', async () => {
    const create = vi.spyOn(prisma.feedback, 'create');

    // 10 unidades UTF-16, mas só 7 caracteres para o Postgres.
    const response = await post({ ...valido, mensagem: 'Top \u{1F44D}\u{1F44D}\u{1F44D}' });

    expect(response.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('recusa o quarto feedback do mesmo usuario', async () => {
    vi.spyOn(prisma.feedback, 'findMany').mockResolvedValue([{ seq: 1 }, { seq: 2 }, { seq: 3 }] as any);
    const create = vi.spyOn(prisma.feedback, 'create');

    const response = await post(valido);

    expect(response.status).toBe(409);
    expect(create).not.toHaveBeenCalled();
  });

  it('grava o feedback do usuario da sessao com a proxima posicao', async () => {
    vi.spyOn(prisma.feedback, 'findMany').mockResolvedValue([{ seq: 1 }] as any);
    const create = vi.spyOn(prisma.feedback, 'create').mockResolvedValue({ id: 10 } as any);

    const response = await post({ ...valido, mensagem: `  ${valido.mensagem}\u0000  ` });

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith({
      data: { userId: 'user-maria', seq: 2, nota: 4, mensagem: valido.mensagem, podeContatar: true },
      select: { id: true },
    });
    expect(await response.json()).toEqual({ success: true, enviados: 2, limite: 3 });
  });

  it('usa a primeira posicao livre quando um feedback foi apagado', async () => {
    vi.spyOn(prisma.feedback, 'findMany').mockResolvedValue([{ seq: 1 }, { seq: 3 }] as any);
    const create = vi.spyOn(prisma.feedback, 'create').mockResolvedValue({ id: 11 } as any);

    const response = await post(valido);

    expect(response.status).toBe(201);
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ seq: 2 }) }));
  });

  it('trata dois envios simultaneos na mesma posicao como conflito', async () => {
    vi.spyOn(prisma.feedback, 'findMany').mockResolvedValue([{ seq: 1 }, { seq: 2 }] as any);
    vi.spyOn(prisma.feedback, 'create').mockRejectedValue(Object.assign(new Error('unique'), { code: 'P2002' }));

    const response = await post(valido);

    expect(response.status).toBe(409);
  });

  it('salva o feedback mesmo se o aviso no Telegram falhar', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '123:abc');
    vi.stubEnv('TELEGRAM_CHAT_ID', '999');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('fora do ar')));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(prisma.feedback, 'findMany').mockResolvedValue([] as any);
    vi.spyOn(prisma.feedback, 'create').mockResolvedValue({ id: 12 } as any);
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ name: 'Maria', email: 'maria@exemplo.com' } as any);

    const response = await post(valido);

    expect(response.status).toBe(201);
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('informa quantos feedbacks o usuario ja enviou', async () => {
    vi.spyOn(prisma.feedback, 'count').mockResolvedValue(2);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, enviados: 2, limite: 3 });
  });
});
