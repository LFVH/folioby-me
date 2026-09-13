import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import prisma from '@/prisma';
import AuthHandler from './nextAuthHandler';

describe('AuthHandler credentials flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.CHIEF_USER_IDS = '';
  });

  it('returns the user payload when credentials are valid', async () => {
    const password = 'SenhaSegura123';
    const hashedPassword = await bcrypt.hash(password, 10);

    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({
      id: 'user-123',
      name: 'Maria',
      email: 'maria@email.com',
      password: hashedPassword,
      slug: 'maria',
      image: null,
      isBlocked: false,
      isPremium: true,
      statusAss: 1,
      plano: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
      storageUsedBytes: 0n,
      stripeCliId: null,
      stripeSubId: null,
      mercadoPagoPreApprovalId: null,
      mercadoPagoPaymentId: null,
      mercadoPagoSubscriptionId: null,
      valorPago: null,
      refreshPasswordToken: null,
      refreshPasswordTokenExpires: null,
      dtIniPremium: null,
      dtFimPremium: null,
      desc: null,
      links: null,
    } as any);

    const provider: any = AuthHandler.providers[0]?.options;
    const result = await provider.authorize({
      email: 'maria@email.com',
      password,
    });

    expect(result).toMatchObject({
      id: 'user-123',
      email: 'maria@email.com',
      name: 'Maria',
      status: true,
      role: 'user',
    });
  });

  it('rejects invalid password with a user-friendly error', async () => {
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({
      id: 'user-456',
      name: 'Joao',
      email: 'joao@email.com',
      password: await bcrypt.hash('CorrectPassword123', 10),
      slug: 'joao',
      image: null,
      isBlocked: false,
      isPremium: false,
      statusAss: 1,
      plano: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
      storageUsedBytes: 0n,
      stripeCliId: null,
      stripeSubId: null,
      mercadoPagoPreApprovalId: null,
      mercadoPagoPaymentId: null,
      mercadoPagoSubscriptionId: null,
      valorPago: null,
      refreshPasswordToken: null,
      refreshPasswordTokenExpires: null,
      dtIniPremium: null,
      dtFimPremium: null,
      desc: null,
      links: null,
    } as any);

    const provider: any = AuthHandler.providers[0]?.options;

    await expect(
      provider.authorize({
        email: 'joao@email.com',
        password: 'WrongPassword123',
      })
    ).rejects.toThrow('Usuário ou senha incorreta.');
  });

  it('blocks users marked as blocked', async () => {
    vi.spyOn(prisma.usuario, 'findUnique').mockResolvedValue({
      id: 'user-789',
      name: 'Ana',
      email: 'ana@email.com',
      password: await bcrypt.hash('SenhaValida123', 10),
      slug: 'ana',
      image: null,
      isBlocked: true,
      isPremium: false,
      statusAss: 1,
      plano: 0,
      updatedAt: new Date(),
      createdAt: new Date(),
      storageUsedBytes: 0n,
      stripeCliId: null,
      stripeSubId: null,
      mercadoPagoPreApprovalId: null,
      mercadoPagoPaymentId: null,
      mercadoPagoSubscriptionId: null,
      valorPago: null,
      refreshPasswordToken: null,
      refreshPasswordTokenExpires: null,
      dtIniPremium: null,
      dtFimPremium: null,
      desc: null,
      links: null,
    } as any);

    const provider: any = AuthHandler.providers[0]?.options;

    await expect(
      provider.authorize({
        email: 'ana@email.com',
        password: 'SenhaValida123',
      })
    ).rejects.toThrow('Código 101');
  });
});
