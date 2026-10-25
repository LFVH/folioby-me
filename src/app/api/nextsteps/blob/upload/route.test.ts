import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import prisma from '@/prisma';
import { verifyUser } from '@/utils/verifyUserAuth';
import { MAX_SINGLE_UPLOAD_BYTES, MAX_USER_STORAGE_BYTES } from '@/lib/storage-quota';
import { GET, POST } from './route';

vi.mock('@/utils/verifyUserAuth', () => ({ verifyUser: vi.fn() }));
vi.mock('@vercel/blob/client', () => ({ handleUpload: vi.fn() }));

const MB = 1024 * 1024;

function pedirToken(clientPayload: unknown) {
  return POST(
    new Request('http://localhost/api/nextsteps/blob/upload', {
      method: 'POST',
      body: JSON.stringify({
        type: 'blob.generate-client-token',
        payload: { pathname: 'nextsteps/a.gif', clientPayload: typeof clientPayload === 'string' ? clientPayload : JSON.stringify(clientPayload) },
      }),
    })
  );
}

function usoAtual(bytes: number) {
  vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ storageUsedBytes: BigInt(bytes) } as any);
}

// Executa o onBeforeGenerateToken que a rota passou ao handleUpload e devolve as regras do token.
async function regrasDoToken() {
  const opcoes = vi.mocked(handleUpload).mock.calls[0][0];
  return opcoes.onBeforeGenerateToken('nextsteps/a.gif', null, false);
}

describe('/api/nextsteps/blob/upload', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(handleUpload).mockReset().mockResolvedValue({ type: 'blob.generate-client-token', clientToken: 't' } as any);
    vi.mocked(verifyUser).mockResolvedValue({ userId: 'user-maria', isPremium: true });
  });

  it('recusa quem nao esta logado', async () => {
    vi.mocked(verifyUser).mockResolvedValue(NextResponse.json({}, { status: 401 }));

    const response = await pedirToken({ storageBytes: MB });

    expect(response.status).toBe(401);
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it('recusa tamanho declarado ausente, zero, negativo ou invalido', async () => {
    usoAtual(0);

    for (const payload of [{}, { storageBytes: 0 }, { storageBytes: -5 }, { storageBytes: 'abc' }, 'nao-e-json']) {
      const response = await pedirToken(payload);
      expect(response.status).toBe(400);
    }
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it('recusa arquivo acima de 500 MB', async () => {
    usoAtual(0);

    const response = await pedirToken({ storageBytes: MAX_SINGLE_UPLOAD_BYTES + 1 });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain('500 MB');
  });

  it('recusa arquivo que estoura a cota de 2 GB do usuario', async () => {
    usoAtual(MAX_USER_STORAGE_BYTES - MB);

    const response = await pedirToken({ storageBytes: 2 * MB });

    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain('2GB');
    expect(handleUpload).not.toHaveBeenCalled();
  });

  it('aceita arquivo que cabe exatamente no espaco restante', async () => {
    usoAtual(MAX_USER_STORAGE_BYTES - MB);

    const response = await pedirToken({ storageBytes: MB });

    expect(response.status).toBe(200);
  });

  it('limita o token ao espaco restante, mesmo se o navegador declarar um tamanho menor que o real', async () => {
    usoAtual(MAX_USER_STORAGE_BYTES - 3 * MB);

    await pedirToken({ storageBytes: 1 });
    const regras = await regrasDoToken();

    expect(regras.maximumSizeInBytes).toBe(3 * MB);
    expect(regras.allowedContentTypes).toEqual(expect.arrayContaining(['image/gif', 'image/png']));
    expect(regras.allowedContentTypes).not.toContain('video/mp4');
  });

  it('nunca libera mais que 500 MB por arquivo', async () => {
    usoAtual(0);

    await pedirToken({ storageBytes: MB });
    const regras = await regrasDoToken();

    expect(regras.maximumSizeInBytes).toBe(MAX_SINGLE_UPLOAD_BYTES);
  });

  it('informa uso, espaco restante e limite por arquivo', async () => {
    usoAtual(MAX_USER_STORAGE_BYTES - 3 * MB);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      usedBytes: MAX_USER_STORAGE_BYTES - 3 * MB,
      remainingBytes: 3 * MB,
      limitBytes: MAX_USER_STORAGE_BYTES,
      maxFileBytes: MAX_SINGLE_UPLOAD_BYTES,
    });
  });
});
