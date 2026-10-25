import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { del, head } from '@vercel/blob';
import prisma from '@/prisma';
import { isHis, verifyUser } from '@/utils/verifyUserAuth';
import { MAX_USER_STORAGE_BYTES } from '@/lib/storage-quota';
import { PUT } from './route';

vi.mock('@/utils/verifyUserAuth', () => ({ verifyUser: vi.fn(), isHis: vi.fn() }));
vi.mock('@vercel/blob', () => ({ head: vi.fn(), del: vi.fn(), put: vi.fn(), list: vi.fn() }));

const MB = 1024 * 1024;
const antigo = 'https://abc123.public.blob.vercel-storage.com/nextsteps/antigo.gif';
const novo = 'https://abc123.public.blob.vercel-storage.com/nextsteps/novo.gif';
const existente = { id: 5, userId: 'user-maria', storageBytes: BigInt(5 * MB), mediaUrls: [antigo], link: antigo, categorias: [] };

function editar(body: Record<string, unknown>) {
  return PUT(
    new NextRequest('http://localhost/api/nextsteps/conteudo/5', { method: 'PUT', body: JSON.stringify({ name: 'Reel', categoriasIds: [1], ...body }) }),
    { params: Promise.resolve({ id: '5' }) }
  );
}

describe('PUT /api/nextsteps/conteudo/[id]', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(head).mockReset();
    vi.mocked(del).mockReset();
    vi.mocked(verifyUser).mockResolvedValue({ userId: 'user-maria', isPremium: true });
    vi.mocked(isHis).mockResolvedValue(true);
    vi.spyOn(prisma.conteudo, 'findUnique').mockResolvedValue(existente as any);
    vi.spyOn(prisma.categoria, 'findMany').mockResolvedValue([{ id: 1 }] as any);
    vi.spyOn(prisma.conteudo, 'update').mockResolvedValue({ id: 5 } as any);
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ storageUsedBytes: BigInt(5 * MB) } as any);
    vi.spyOn(prisma.usuario, 'update').mockResolvedValue({} as any);
    vi.spyOn(prisma, '$executeRaw').mockResolvedValue(1 as any);
  });

  it('editar sem arquivo novo mantem o tamanho e nao libera cota', async () => {
    const response = await editar({ storageBytes: 0, mediaUrls: [] });

    expect(response.status).toBe(200);
    expect(prisma.conteudo.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ storageBytes: BigInt(5 * MB) }) })
    );
    expect(prisma.usuario.update).not.toHaveBeenCalled();
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });

  it('reenviar as mesmas URLs nao mede, nao troca e nao apaga o arquivo', async () => {
    const response = await editar({ mediaUrls: [antigo] });

    expect(response.status).toBe(200);
    expect(head).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
  });

  it('arquivo novo maior soma so a diferenca real na cota', async () => {
    vi.mocked(head).mockResolvedValue({ size: 8 * MB } as any);

    const response = await editar({ mediaUrls: [novo], storageBytes: 1 });

    expect(response.status).toBe(200);
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 'user-maria' },
      data: { storageUsedBytes: { increment: BigInt(3 * MB) } },
    });
    expect(del).toHaveBeenCalledWith(antigo);
  });

  it('arquivo novo menor devolve a diferenca para a cota', async () => {
    vi.mocked(head).mockResolvedValue({ size: 2 * MB } as any);

    const response = await editar({ mediaUrls: [novo] });

    expect(response.status).toBe(200);
    expect(prisma.$executeRaw).toHaveBeenCalled();
  });

  it('arquivo novo que estoura a cota e recusado, descartado, e o antigo continua', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue({ storageUsedBytes: BigInt(MAX_USER_STORAGE_BYTES - MB) } as any);
    vi.mocked(head).mockResolvedValue({ size: 10 * MB } as any);

    const response = await editar({ mediaUrls: [novo] });

    expect(response.status).toBe(400);
    expect(prisma.conteudo.update).not.toHaveBeenCalled();
    expect(del).toHaveBeenCalledWith(novo);
    expect(del).not.toHaveBeenCalledWith(antigo);
  });
});
