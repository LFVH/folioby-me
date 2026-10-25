import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import prisma from '@/prisma';
import { verifyUser } from '@/utils/verifyUserAuth';
import { MAX_PROFILE_IMAGE_BYTES, MAX_USER_STORAGE_BYTES } from '@/lib/storage-quota';
import { POST } from './route';

vi.mock('@/utils/verifyUserAuth', () => ({ verifyUser: vi.fn() }));
vi.mock('@vercel/blob', () => ({ head: vi.fn(), del: vi.fn(), put: vi.fn(), list: vi.fn() }));

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function arquivo(bytes: number[], tamanho: number, tipo = 'image/png') {
  const conteudo = new Uint8Array(tamanho);
  conteudo.set(bytes);
  return new File([conteudo], 'foto.png', { type: tipo });
}

function enviar(file: File) {
  const form = new FormData();
  form.append('file', file);
  return POST(new NextRequest('http://localhost/api/nextsteps/user/image', { method: 'POST', body: form }));
}

describe('POST /api/nextsteps/user/image', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(put).mockReset().mockResolvedValue({ url: 'https://abc.public.blob.vercel-storage.com/foto.png' } as any);
    vi.mocked(verifyUser).mockResolvedValue({ userId: 'user-maria', isPremium: true });
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ storageUsedBytes: 0n } as any);
    vi.spyOn(prisma.usuario, 'update').mockResolvedValue({} as any);
  });

  it('recusa foto acima de 5 MB', async () => {
    const response = await enviar(arquivo(PNG, MAX_PROFILE_IMAGE_BYTES + 1));

    expect(response.status).toBe(400);
    expect(put).not.toHaveBeenCalled();
  });

  it('recusa arquivo que diz ser imagem mas nao e', async () => {
    const response = await enviar(arquivo([0x3c, 0x73, 0x76, 0x67], 1024));

    expect(response.status).toBe(400);
    expect(put).not.toHaveBeenCalled();
  });

  it('recusa tipo nao permitido', async () => {
    const response = await enviar(arquivo(PNG, 1024, 'image/svg+xml'));

    expect(response.status).toBe(400);
    expect(put).not.toHaveBeenCalled();
  });

  it('recusa quando estoura a cota de 2 GB', async () => {
    vi.mocked(prisma.usuario.findUnique).mockResolvedValue({ storageUsedBytes: BigInt(MAX_USER_STORAGE_BYTES - 100) } as any);

    const response = await enviar(arquivo(PNG, 1024));

    expect(response.status).toBe(400);
    expect(put).not.toHaveBeenCalled();
  });

  it('aceita uma imagem valida e soma o tamanho na cota', async () => {
    const response = await enviar(arquivo(PNG, 2048));

    expect(response.status).toBe(200);
    expect(prisma.usuario.update).toHaveBeenCalledWith({
      where: { id: 'user-maria' },
      data: { storageUsedBytes: { increment: 2048n } },
    });
  });
});
