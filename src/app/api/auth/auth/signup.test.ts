import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/prisma';
import { avisarCadastroNoTelegram } from '@/lib/telegram';
import { signup } from './signup';

// after() só existe dentro de uma requisição; aqui o callback roda na hora e o teste espera por ele.
const pendentes = vi.hoisted(() => [] as Promise<unknown>[]);
vi.mock('next/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/server')>()),
  after: (callback: () => Promise<unknown>) => {
    pendentes.push(callback());
  },
}));
vi.mock('@/lib/telegram', () => ({ avisarCadastroNoTelegram: vi.fn() }));
vi.mock('@/lib/db/user-slug-service', () => ({ generateAvailableUserSlug: vi.fn().mockResolvedValue('maria-souza') }));

function formulario(dados: Record<string, string>) {
  const form = new FormData();
  Object.entries(dados).forEach(([campo, valor]) => form.set(campo, valor));
  return form;
}

async function cadastrar(dados = valido) {
  const result = await signup(undefined, formulario(dados));
  await Promise.all(pendentes.splice(0));
  return result;
}

const valido = { name: 'Maria Souza', email: 'Maria@Exemplo.com', password: 'senha-forte-123' };
const criado = { id: 'u1', name: 'Maria Souza', email: 'maria@exemplo.com', slug: 'maria-souza' };
const sucesso = { data: { name: 'Maria Souza', email: 'maria@exemplo.com' } };

describe('signup', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(avisarCadastroNoTelegram).mockReset();
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '123:abc');
    vi.stubEnv('TELEGRAM_CHAT_ID', '999');
  });

  it('avisa no Telegram depois de criar a conta', async () => {
    vi.spyOn(prisma.usuario, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prisma.usuario, 'create').mockResolvedValue(criado as any);
    vi.spyOn(prisma.categoria, 'create').mockResolvedValue({ id: 1 } as any);
    vi.spyOn(prisma.usuario, 'count').mockResolvedValue(8);

    const result = await cadastrar();

    expect(result).toEqual(sucesso);
    expect(avisarCadastroNoTelegram).toHaveBeenCalledWith({
      nome: 'Maria Souza',
      email: 'maria@exemplo.com',
      slug: 'maria-souza',
      totalUsuarios: 8,
    });
  });

  it('nao avisa quando o e-mail ja existe', async () => {
    vi.spyOn(prisma.usuario, 'findFirst').mockResolvedValue({ id: 'u0' } as any);
    const create = vi.spyOn(prisma.usuario, 'create');

    const result = await cadastrar();

    expect(result?.message).toBeDefined();
    expect(create).not.toHaveBeenCalled();
    expect(avisarCadastroNoTelegram).not.toHaveBeenCalled();
  });

  it('nao avisa quando a criacao da conta falha', async () => {
    vi.spyOn(prisma.usuario, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prisma.usuario, 'create').mockRejectedValue(new Error('banco fora'));

    const result = await cadastrar();

    expect(result).toEqual({ message: 'An error occurred while creating your account.' });
    expect(avisarCadastroNoTelegram).not.toHaveBeenCalled();
  });

  it('nao avisa quando a categoria inicial nao e criada', async () => {
    vi.spyOn(prisma.usuario, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prisma.usuario, 'create').mockResolvedValue(criado as any);
    vi.spyOn(prisma.categoria, 'create').mockRejectedValue(new Error('banco fora'));

    const result = await cadastrar();

    expect(result).toEqual({ message: 'An error occurred while creating your account.' });
    expect(avisarCadastroNoTelegram).not.toHaveBeenCalled();
  });

  it('avisa sem o total quando a contagem falha', async () => {
    vi.spyOn(prisma.usuario, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prisma.usuario, 'create').mockResolvedValue(criado as any);
    vi.spyOn(prisma.categoria, 'create').mockResolvedValue({ id: 1 } as any);
    vi.spyOn(prisma.usuario, 'count').mockRejectedValue(new Error('timeout'));

    const result = await cadastrar();

    expect(result).toEqual(sucesso);
    expect(avisarCadastroNoTelegram).toHaveBeenCalledWith(expect.objectContaining({ totalUsuarios: null }));
  });

  it('conclui o cadastro mesmo se o aviso falhar', async () => {
    vi.spyOn(prisma.usuario, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prisma.usuario, 'create').mockResolvedValue(criado as any);
    vi.spyOn(prisma.categoria, 'create').mockResolvedValue({ id: 1 } as any);
    vi.spyOn(prisma.usuario, 'count').mockResolvedValue(8);
    vi.mocked(avisarCadastroNoTelegram).mockRejectedValue(new Error('fora do ar'));

    const result = await cadastrar();

    expect(result).toEqual(sucesso);
  });

  it('nem consulta o total de usuarios sem o Telegram configurado', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '');
    vi.spyOn(prisma.usuario, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prisma.usuario, 'create').mockResolvedValue(criado as any);
    vi.spyOn(prisma.categoria, 'create').mockResolvedValue({ id: 1 } as any);
    const count = vi.spyOn(prisma.usuario, 'count');

    await cadastrar();

    expect(count).not.toHaveBeenCalled();
    expect(avisarCadastroNoTelegram).not.toHaveBeenCalled();
  });
});
