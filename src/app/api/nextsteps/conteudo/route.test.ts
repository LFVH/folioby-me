import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { del, head } from '@vercel/blob';
import prisma from '@/prisma';
import { verifyUser } from '@/utils/verifyUserAuth';
import { MAX_USER_STORAGE_BYTES } from '@/lib/storage-quota';
import { POST } from './route';

vi.mock('@/utils/verifyUserAuth', () => ({ verifyUser: vi.fn() }));
vi.mock('@vercel/blob', () => ({ head: vi.fn(), del: vi.fn(), put: vi.fn(), list: vi.fn() }));

const MB = 1024 * 1024;
const blob = 'https://abc123.public.blob.vercel-storage.com/nextsteps/a.gif';
const valido = { name: 'Reel', categoriasIds: [1], mediaUrls: [blob], link: blob };

function criar(body: unknown) {
  return POST(new NextRequest('http://localhost/api/nextsteps/conteudo', { method: 'POST', body: JSON.stringify(body) }));
}

describe('POST /api/nextsteps/conteudo', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(head).mockReset();
    vi.mocked(del).mockReset();
    vi.mocked(verifyUser).mockResolvedValue({ userId: 'user-maria', isPremium: true });
    vi.spyOn(prisma.categoria, 'findMany').mockResolvedValue([{ id: 1 }] as any);
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ storageUsedBytes: 0n } as any);
    vi.spyOn(prisma.conteudo, 'create').mockResolvedValue({ id: 7 } as any);
    vi.spyOn(prisma.usuario, 'update').mockResolvedValue({} as any);
  });

  it('usa o tamanho real do Blob e ignora o storageBytes do navegador', async () => {
    vi.mocked(head).mockResolvedValue({ size: 3 * MB } as any);

    const response = await criar({ ...valido, storageBytes: 1 });

    expect(response.status).toBe(200);
    expect(prisma.conteudo.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ storageBytes: BigInt(3 * MB) }) })
    );
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 'user-maria' },
      data: { storageUsedBytes: { increment: BigInt(3 * MB) } },
    });
  });

  it('recusa e apaga o arquivo enviado quando estoura a cota de 2 GB', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue({ storageUsedBytes: BigInt(MAX_USER_STORAGE_BYTES - MB) } as any);
    vi.mocked(head).mockResolvedValue({ size: 2 * MB } as any);

    const response = await criar(valido);

    expect(response.status).toBe(400);
    expect(prisma.conteudo.create).not.toHaveBeenCalled();
    expect(del).toHaveBeenCalledWith(blob);
  });

  it('recusa midia de fora do nosso Blob sem consultar tamanho', async () => {
    const response = await criar({ ...valido, mediaUrls: ['https://outro-site.com/a.gif'] });

    expect(response.status).toBe(400);
    expect(head).not.toHaveBeenCalled();
    expect(prisma.conteudo.create).not.toHaveBeenCalled();
  });

  it('recusa nome longo demais e link externo que nao seja http(s)', async () => {
    expect((await criar({ ...valido, name: 'x'.repeat(121) })).status).toBe(400);
    expect((await criar({ ...valido, linkext: 'javascript:alert(1)' })).status).toBe(400);
    expect(prisma.conteudo.create).not.toHaveBeenCalled();
  });

  it('recusa quando nao consegue confirmar o arquivo no Blob', async () => {
    vi.mocked(head).mockRejectedValue(new Error('not found'));

    const response = await criar(valido);

    expect(response.status).toBe(400);
    expect(prisma.conteudo.create).not.toHaveBeenCalled();
  });
});
