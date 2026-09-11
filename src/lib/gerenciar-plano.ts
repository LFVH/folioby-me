import prisma from '@/prisma';
import { planos } from '@/types';
import { logNow } from '@/utils/Logging';

interface UserPaidParams {
  mercadoPagoPaymentId?: string;
  mercadoPagoSubscriptionId: string;
  priceId?: number;
  userId?: string;
  currentPeriodEnd: Date;
}

interface UserCancelPlanParams {
  subscriptionId: string;
}

interface SyncMercadoPagoSubscriptionParams {
  userId: string;
  subscriptionId: string;
}

function normalizeCurrencyAmount(value: number) {
  return Number(value.toFixed(2));
}

function resolvePlanoByAmount(priceId?: number) {
  if (typeof priceId !== 'number' || !Number.isFinite(priceId)) {
    return null;
  }

  const normalizedPriceId = normalizeCurrencyAmount(priceId);

  return (
    planos.find(
      (plano) => normalizeCurrencyAmount(plano.price) === normalizedPriceId
    ) ?? null
  );
}

export async function userPaid({
  mercadoPagoPaymentId,
  mercadoPagoSubscriptionId,
  priceId,
  userId,
  currentPeriodEnd,
}: UserPaidParams) {
  try {
    const planoResolvido = resolvePlanoByAmount(priceId);
    const valorPago =
      typeof priceId === 'number' && Number.isFinite(priceId)
        ? normalizeCurrencyAmount(priceId)
        : undefined;

    if (priceId !== undefined && !planoResolvido) {
      console.warn(
        `Mercado Pago payment amount ${priceId} does not match any configured plan`
      );
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.usuario.update({
        where: { id: userId },
        data: {
          mercadoPagoPreApprovalId: mercadoPagoSubscriptionId,
          mercadoPagoSubscriptionId: mercadoPagoSubscriptionId,
          ...(planoResolvido ? { plano: planoResolvido.id } : {}),
          ...(valorPago !== undefined ? { valorPago } : {}),
          dtIniPremium: new Date(),
          dtFimPremium: currentPeriodEnd,
          statusAss: 6,
          isPremium: true,
          ...(mercadoPagoPaymentId
            ? { mercadoPagoPaymentId: mercadoPagoPaymentId }
            : {}),
        },
      });

      const existingCategoria = await tx.categoria.findFirst({
        where: { userId },
        select: { id: true },
      });

      if (!existingCategoria) {
        await tx.categoria.create({
          data: {
            name: "My Work",
            user: {
              connect: {
                id: userId,
              },
            },
          },
        });
      }
    });

    logNow(`User ${userId} successfully paid with Mercado Pago`);
  } catch (error) {
    console.error('Error processing Mercado Pago payment:', error);
    throw error;
  }
}

export async function userCancelPlan({ subscriptionId }: UserCancelPlanParams) {
  try {
    const user = await prisma.usuario.findFirst({
      where: {
        OR: [
          { mercadoPagoSubscriptionId: subscriptionId },
          { mercadoPagoPreApprovalId: subscriptionId },
        ],
      },
      select: { id: true },
    });

    if (!user) {
      logNow(
        `No user found for Mercado Pago subscription ${subscriptionId} during cancellation`
      );
      return;
    }

    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        statusAss: 10,
      },
    });

    logNow(`User with Mercado Pago subscription ${subscriptionId} canceled their plan`);
  } catch (error) {
    console.error('Error canceling Mercado Pago plan:', error);
    throw error;
  }
}

export async function syncMercadoPagoSubscription({
  userId,
  subscriptionId,
}: SyncMercadoPagoSubscriptionParams) {
  try {
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        mercadoPagoPreApprovalId: subscriptionId,
        mercadoPagoSubscriptionId: subscriptionId,
      },
    });

    logNow(`Mercado Pago subscription ${subscriptionId} synced for user ${userId}`);
  } catch (error) {
    console.error('Error syncing Mercado Pago subscription:', error);
    throw error;
  }
}
