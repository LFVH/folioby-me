import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { userPaid, userCancelPlan } from "@/lib/gerenciar-plano";

export async function POST(req: Request) {
  try {
    return;
    // const body = await req.text();
    // const signature = (await headers()).get("stripe-signature");
    // const secret = process.env.STRIPE_WEBHOOK_SECRET;

    // if (!secret || !signature) {
    //   throw new Error("Missing secret or signature");
    // }
    
    // const event = stripe.webhooks.constructEvent(body, signature, secret!);

    // switch (event.type) {
    //   case "checkout.session.completed":
    //     // Handle completed checkout if needed
    //     break;

    //   case "checkout.session.expired":
    //     if (event.data.object.payment_status === "unpaid") {
    //       const userId = event.data.object.metadata?.userId;
    //       if (userId) {
    //         await userCheckoutExpired({ userId });
    //       }
    //     }
    //     break;

    //   case "customer.subscription.deleted":
    //     await userCancelPlan({ subscriptionId: event.data.object.id });
    //     break;

    //   case "invoice.paid":
    //     const invoice = event.data.object as Stripe.Invoice;
    //     const customerId = invoice.customer as string | null;
        
    //     if (customerId) {
    //       const subscriptionId = invoice.lines.data[0].parent?.subscription_item_details?.subscription;
    //       const priceId = invoice.lines.data[0].pricing?.price_details?.price;
    //       const userId = invoice.lines.data[0].metadata.userId;
    //       const currentPeriodEnd = new Date(invoice.lines.data[0].period.end * 1000);

    //       await userPaid({
    //         customerId,
    //         subscriptionId: subscriptionId as string,
    //         priceId: priceId as string,
    //         userId,
    //         currentPeriodEnd
    //       });
    //     }
    //     break;

    //   case "invoice.payment_failed":
    //     const failedInvoice = event.data.object as Stripe.Invoice;
    //     await userPaymentFailed({ invoice: failedInvoice });
    //     break;
    // }

    // return NextResponse.json({ result: event, ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}