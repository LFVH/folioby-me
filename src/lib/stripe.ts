import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is missing. Please set the environment variable."
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
});

export default stripe;


// // lib/services/stripeService.ts

// import { PrismaClient } from '@prisma/client';
// import Stripe from 'stripe';
// import { CustomerStatusCode, STRIPE_STATUS_CONFIG } from '@/lib/constants/stripeStatus';

// const prisma = new PrismaClient();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2024-09-30.acacia',
// });

// export class StripeCustomerService {
  
//   // Sincronizar status baseado no webhook do Stripe
//   static async syncSubscriptionStatus(stripeSubscription: Stripe.Subscription) {
//     const customer = await prisma.customer.findFirst({
//       where: { stripeCustomerId: stripeSubscription.customer as string }
//     });

//     if (!customer) {
//       throw new Error('Cliente não encontrado');
//     }

//     const newStatusCode = this.mapStripeStatusToInternal(stripeSubscription.status);
    
//     // Registrar mudança de status
//     await prisma.subscriptionEvent.create({
//       data: {
//         customerId: customer.id,
//         stripeEventId: `sub_${stripeSubscription.id}`,
//         eventType: 'subscription.updated',
//         oldStatus: customer.statusId,
//         newStatus: newStatusCode,
//         metadata: stripeSubscription
//       }
//     });

//     // Atualizar cliente
//     const updatedCustomer = await prisma.customer.update({
//       where: { id: customer.id },
//       data: {
//         statusId: newStatusCode,
//         stripeSubscriptionId: stripeSubscription.id,
//         currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
//         cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
//         trialEndsAt: stripeSubscription.trial_end ? 
//           new Date(stripeSubscription.trial_end * 1000) : null
//       },
//       include: { status: true }
//     });

//     return updatedCustomer;
//   }

//   // Mapear status do Stripe para interno
//   private static mapStripeStatusToInternal(stripeStatus: string): CustomerStatusCode {
//     const statusMap: { [key: string]: CustomerStatusCode } = {
//       // Stripe status -> Nosso status
//       'incomplete': CustomerStatusCode.INCOMPLETO,
//       'incomplete_expired': CustomerStatusCode.INCOMPLETO_EXPIRADO,
//       'trialing': CustomerStatusCode.TRIAL,
//       'active': CustomerStatusCode.ATIVO,
//       'past_due': CustomerStatusCode.SUSPENSO,
//       'canceled': CustomerStatusCode.CANCELADO,
//       'unpaid': CustomerStatusCode.INADIMPLENTE,
//       'paused': CustomerStatusCode.PAUSADO
//     };

//     return statusMap[stripeStatus] || CustomerStatusCode.INATIVO;
//   }

//   // Criar cliente no Stripe e atualizar nosso banco
//   static async createStripeCustomer(email: string, name?: string) {
//     // Criar no Stripe
//     const stripeCustomer = await stripe.customers.create({
//       email,
//       name,
//       metadata: {
//         created_via: 'website'
//       }
//     });

//     // Criar no nosso banco
//     const customer = await prisma.customer.create({
//       data: {
//         email,
//         name,
//         stripeCustomerId: stripeCustomer.id,
//         statusId: CustomerStatusCode.INATIVO // Começa como inativo
//       },
//       include: { status: true }
//     });

//     return customer;
//   }

//   // Verificar acesso do usuário
//   static async checkUserAccess(customerId: string): Promise<boolean> {
//     const customer = await prisma.customer.findUnique({
//       where: { id: customerId },
//       include: { status: true }
//     });

//     if (!customer) return false;

//     const statusConfig = STRIPE_STATUS_CONFIG[customer.status.code as CustomerStatusCode];
//     return statusConfig?.canAccess || false;
//   }

//   // Buscar status atual do subscription no Stripe
//   static async refreshSubscriptionStatus(stripeSubscriptionId: string) {
//     const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
//     return this.syncSubscriptionStatus(subscription);
//   }
// }