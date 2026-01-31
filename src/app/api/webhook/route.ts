import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";
import { logNow } from "@/utils/Logging";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secret || !signature) {
      throw new Error("Missing secret or signature");
    }
    
    const event = stripe.webhooks.constructEvent(body, signature, secret!);

    switch (event.type) {
      case "checkout.session.completed":
      break;

      case "checkout.session.expired":
        if (event.data.object.payment_status === "unpaid") {
          const userId = event.data.object.metadata?.userId;
        }
      break;

      case "customer.subscription.deleted":
        await prisma.usuario.update({
          where: { stripeSubId: event.data.object.id },
          data: { 
            statusAss: 10,
          },
        });
      break;
      case "invoice.paid":
        const invoice = event.data.object as Stripe.Invoice;
        
        const customerId = invoice.customer as string | null;
        if (customerId) {
          try {
            const subscriptionId = invoice.lines.data[0].parent?.subscription_item_details?.subscription;  // sub_12

            // 2. Buscar detalhes da assinatura via invoice
            const priceId = invoice.lines.data[0].pricing?.price_details?.price;
            const userId = invoice.lines.data[0].metadata.userId
            const currentPeriodEnd = new Date(invoice.lines.data[0].period.end * 1000);

            const plano = (() => {
              switch(priceId) {
                case process.env.STRIPE_SUBSCRIPTION_PRICEMONTH_ID:
                  return 1;
                case process.env.STRIPE_SUBSCRIPTION_PRICETRIME_ID:
                  return 2;
                case process.env.STRIPE_SUBSCRIPTION_PRICESEMES_ID:
                  return 3;
                case process.env.STRIPE_SUBSCRIPTION_PRICEANUAL_ID:
                  return 4;
                default:
                  throw new Error("Price not found");
              }
            })()
            
          await prisma.usuario.update({
          where: { id: userId },
          data: {
            stripeCliId: customerId,
            stripeSubId: subscriptionId,
            plano,
            dtIniPremium: new Date(),
            dtFimPremium: currentPeriodEnd,
            statusAss: 6,
            isPremium: true
          },
        });

          } catch (error) {
            console.error("Error processing subscription:", error);
          }
        }
    break;
    case "invoice.payment_failed":
      // Falha no pagamento (atualize status para "pendente")
    break;
  }

    return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}