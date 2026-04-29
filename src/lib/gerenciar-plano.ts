import prisma from '@/prisma';
import { logNow } from '@/utils/Logging';

interface UserPaidParams {
  mercadoPagoPaymentId: string;
  mercadoPagoSubscriptionId: string;
  priceId?: number; // ou string, dependendo de como você armazena
  userId?: string;
  currentPeriodEnd: Date;
}

interface UserCancelPlanParams {
  subscriptionId: string;
}

export async function userPaid({
  mercadoPagoPaymentId,
  mercadoPagoSubscriptionId,
  priceId,
  userId,
  currentPeriodEnd
}: UserPaidParams) {
  try {
    // Mapeie o priceId para o plano correspondente no seu sistema
    const plano = priceId; // Adapte conforme sua lógica de negócio

    await prisma.usuario.update({
      where: { id: userId },
      data: {
        mercadoPagoPreApprovalId: mercadoPagoSubscriptionId,
        mercadoPagoPaymentId: mercadoPagoPaymentId,
        mercadoPagoSubscriptionId: mercadoPagoSubscriptionId,
        plano,
        dtIniPremium: new Date(),
        dtFimPremium: currentPeriodEnd,
        statusAss: 6,
        isPremium: true
      },
    });

    logNow(`User ${userId} successfully paid with Mercado Pago`);
  } catch (error) {
    console.error("Error processing Mercado Pago payment:", error);
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
    console.error("Error canceling Mercado Pago plan:", error);
    throw error;
  }
}

interface SyncMercadoPagoSubscriptionParams {
  userId: string;
  subscriptionId: string;
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
    console.error("Error syncing Mercado Pago subscription:", error);
    throw error;
  }
}
