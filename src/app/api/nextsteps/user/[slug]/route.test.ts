import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import prisma from '@/prisma';
import { verifyUser } from '@/utils/verifyUserAuth';
import { GET, PUT } from './route';

vi.mock('@/utils/verifyUserAuth', () => ({ verifyUser: vi.fn() }));

const doc = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Oi' }] }] };

function call(handler: typeof GET | typeof PUT, slug: string, body?: unknown) {
  const request = new NextRequest(`http://localhost/api/nextsteps/user/${slug}`, {
    method: body === undefined ? 'GET' : 'PUT',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return handler(request, { params: Promise.resolve({ slug }) });
}

describe('/api/nextsteps/user/[slug]', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(verifyUser).mockResolvedValue({ userId: 'user-maria', isPremium: true });
  });

  it('nao deixa um usuario alterar a descricao de outro slug', async () => {
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ slug: 'maria' } as any);
    const update = vi.spyOn(prisma.usuario, 'update');

    const response = await call(PUT, 'joao', { desc: doc });

    expect(response.status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it('atualiza a descricao do proprio usuario pelo id da sessao', async () => {
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ slug: 'maria' } as any);
    const update = vi.spyOn(prisma.usuario, 'update').mockResolvedValue({ name: 'Maria', image: null, desc: doc } as any);

    const response = await call(PUT, 'maria', { desc: doc });

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'user-maria' }, data: { desc: doc } }));
  });

  it('recusa desc que nao e um documento do TipTap', async () => {
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ slug: 'maria' } as any);
    const update = vi.spyOn(prisma.usuario, 'update');

    const response = await call(PUT, 'maria', { desc: '<script>alert(1)</script>' });

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
  });

  it('recusa desc grande demais', async () => {
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ slug: 'maria' } as any);
    const update = vi.spyOn(prisma.usuario, 'update');
    const enorme = { type: 'doc', content: [{ type: 'text', text: 'x'.repeat(200_000) }] };

    const response = await call(PUT, 'maria', { desc: enorme });

    expect(response.status).toBe(413);
    expect(update).not.toHaveBeenCalled();
  });

  it('nao devolve o perfil de outro slug no GET', async () => {
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ slug: 'maria', name: 'Maria', image: null, desc: doc } as any);

    const response = await call(GET, 'joao');

    expect(response.status).toBe(403);
  });

  it('devolve o proprio perfil no GET sem expor o slug', async () => {
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({ slug: 'maria', name: 'Maria', image: null, desc: doc } as any);

    const response = await call(GET, 'maria');

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ name: 'Maria', image: null, desc: doc });
  });
});
