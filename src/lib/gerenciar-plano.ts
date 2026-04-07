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
    await prisma.usuario.update({
      where: { mercadoPagoSubscriptionId: subscriptionId },
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