import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import prisma from '@/prisma';
import { verifyUser } from '@/utils/verifyUserAuth';
import { LIMITES } from '@/lib/limits';
import { POST } from './route';
import { PUT } from './[id]/route';

vi.mock('@/utils/verifyUserAuth', () => ({ verifyUser: vi.fn(), isHis: vi.fn() }));

const req = (method: string, body: unknown) =>
  new NextRequest('http://localhost/api/nextsteps/categorias', { method, body: JSON.stringify(body) });

describe('/api/nextsteps/categorias', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(verifyUser).mockResolvedValue({ userId: 'user-maria', isPremium: true });
  });

  it('cria categoria dentro dos limites', async () => {
    const create = vi.spyOn(prisma.categoria, 'create').mockResolvedValue({ id: 1 } as any);

    const response = await POST(req('POST', { nome: 'Motion', descricao: 'Animacoes curtas' }));

    expect(response.status).toBe(200);
    expect(create).toHaveBeenCalled();
  });

  it('recusa nome ou descricao acima do limite ao criar', async () => {
    const create = vi.spyOn(prisma.categoria, 'create');

    expect((await POST(req('POST', { nome: 'x'.repeat(LIMITES.categoriaNome + 1) }))).status).toBe(400);
    expect((await POST(req('POST', { nome: 'ok', descricao: 'x'.repeat(LIMITES.categoriaDescricao + 1) }))).status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('recusa nome acima do limite ao editar', async () => {
    const update = vi.spyOn(prisma.categoria, 'update');

    const response = await PUT(req('PUT', { nome: 'x'.repeat(LIMITES.categoriaNome + 1) }), { params: Promise.resolve({ id: '1' }) });

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });
});
