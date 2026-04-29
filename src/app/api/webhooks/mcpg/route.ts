import crypto from 'crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/prisma';
import {
  syncMercadoPagoSubscription,
  userCancelPlan,
  userPaid,
} from '@/lib/gerenciar-plano';
import { invoice, payment, preApproval } from '@/lib/mercadopago';
import { saveWebhookRequest, type JsonValue } from '@/lib/webhook-requests';

type MercadoPagoWebhookBody = {
  id?: number | string;
  type?: string;
  action?: string;
  data?: {
    id?: number | string;
  } | null;
  [key: string]: unknown;
};

type MercadoPagoSignature = {
  ts: string;
  v1: string;
};

function toOptionalString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toString();
  }

  return null;
}

function toDateOrNull(value: unknown): Date | null {
  const stringValue = toOptionalString(value);

  if (!stringValue) {
    return null;
  }

  const parsedDate = new Date(stringValue);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function parseSignature(signatureHeader: string): MercadoPagoSignature | null {
  const parsed = signatureHeader
    .split(',')
    .map((part) => part.trim().split('='))
    .reduce<Record<string, string>>((accumulator, [key, value]) => {
      if (key && value) {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});

  if (!parsed.ts || !parsed.v1) {
    return null;
  }

  return {
    ts: parsed.ts,
    v1: parsed.v1,
  };
}

function validateSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string
): boolean {
  const parsedSignature = parseSignature(xSignature);

  if (!parsedSignature) {
    return false;
  }

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${parsedSignature.ts};`;
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  const receivedBuffer = Buffer.from(parsedSignature.v1, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

async function resolveMercadoPagoUserId(params: {
  externalReference?: unknown;
  subscriptionId?: string | null;
  paymentId?: string | null;
}) {
  const externalReference = toOptionalString(params.externalReference);
  if (externalReference) {
    return externalReference;
  }

  if (params.subscriptionId) {
    const user = await prisma.usuario.findFirst({
      where: {
        OR: [
          { mercadoPagoPreApprovalId: params.subscriptionId },
          { mercadoPagoSubscriptionId: params.subscriptionId },
        ],
      },
      select: { id: true },
    });

    if (user) {
      return user.id;
    }
  }

  if (params.paymentId) {
    const user = await prisma.usuario.findFirst({
      where: { mercadoPagoPaymentId: params.paymentId },
      select: { id: true },
    });

    if (user) {
      return user.id;
    }
  }

  return null;
}

async function processPaymentNotification(paymentId: string) {
  const paymentData = await payment.get({ id: paymentId });
  const userId = await resolveMercadoPagoUserId({
    externalReference: paymentData.external_reference,
    paymentId: toOptionalString(paymentData.id),
  });

  if (!userId) {
    console.warn(
      '[mercadopago webhook] Payment notification received without a resolvable user',
      { paymentId }
    );
    return;
  }

  if (paymentData.status !== 'approved') {
    return;
  }

  const user = await prisma.usuario.findUnique({
    where: { id: userId },
    select: {
      mercadoPagoPreApprovalId: true,
      mercadoPagoSubscriptionId: true,
    },
  });

  const subscriptionId =
    user?.mercadoPagoSubscriptionId ?? user?.mercadoPagoPreApprovalId;

  const currentPeriodEnd = toDateOrNull(paymentData.date_approved) ?? new Date();

  if (!subscriptionId) {
    console.warn(
      '[mercadopago webhook] Approved payment without subscription reference',
      { paymentId, userId }
    );
    return;
  }

  await userPaid({
    mercadoPagoPaymentId: paymentId,
    mercadoPagoSubscriptionId: subscriptionId,
    priceId: paymentData.transaction_amount,
    userId,
    currentPeriodEnd,
  });
}

async function processSubscriptionPreapprovalNotification(subscriptionId: string) {
  const subscription = await preApproval.get({ id: subscriptionId });
  const resolvedSubscriptionId = toOptionalString(subscription.id);

  if (!resolvedSubscriptionId) {
    console.warn(
      '[mercadopago webhook] Subscription notification without preapproval id',
      { subscriptionId }
    );
    return;
  }

  const userId = await resolveMercadoPagoUserId({
    externalReference: subscription.external_reference,
    subscriptionId: resolvedSubscriptionId,
  });

  if (!userId) {
    console.warn(
      '[mercadopago webhook] Subscription notification received without a resolvable user',
      { subscriptionId: resolvedSubscriptionId }
    );
    return;
  }

  await syncMercadoPagoSubscription({
    userId,
    subscriptionId: resolvedSubscriptionId,
  });

  if (subscription.status === 'cancelled') {
    await userCancelPlan({ subscriptionId: resolvedSubscriptionId });
  }
}

async function processAuthorizedPaymentNotification(authorizedPaymentId: string) {
  const invoiceData = await invoice.get({ id: authorizedPaymentId });
  const subscriptionId = toOptionalString(invoiceData.preapproval_id);
  const paymentId = toOptionalString(invoiceData.payment?.id);

  if (!subscriptionId) {
    console.warn(
      '[mercadopago webhook] Authorized payment without subscription reference',
      { authorizedPaymentId }
    );
    return;
  }

  const userId = await resolveMercadoPagoUserId({
    externalReference: invoiceData.external_reference,
    subscriptionId,
    paymentId,
  });

  if (!userId) {
    console.warn(
      '[mercadopago webhook] Authorized payment notification received without a resolvable user',
      { authorizedPaymentId, subscriptionId }
    );
    return;
  }

  await syncMercadoPagoSubscription({ userId, subscriptionId });

  if (invoiceData.payment?.status !== 'approved' || !paymentId) {
    return;
  }

  const subscription = await preApproval.get({ id: subscriptionId });
  const currentPeriodEnd =
    toDateOrNull(subscription.next_payment_date) ??
    toDateOrNull(invoiceData.debit_date) ??
    new Date();

  await userPaid({
    mercadoPagoPaymentId: paymentId,
    mercadoPagoSubscriptionId: subscriptionId,
    priceId: invoiceData.transaction_amount,
    userId,
    currentPeriodEnd,
  });
}

async function processWebhookNotification(type: string | undefined, resourceId: string) {
  switch (type) {
    case 'payment':
      await processPaymentNotification(resourceId);
      break;
    case 'subscription_preapproval':
      await processSubscriptionPreapprovalNotification(resourceId);
      break;
    case 'subscription_authorized_payment':
      await processAuthorizedPaymentNotification(resourceId);
      break;
    default:
      console.log('[mercadopago webhook] Notification received without mapped action', {
        type,
        resourceId,
      });
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (!secret) {
    console.error('Webhook secret is not defined');
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }

  try {
    const rawBody = await request.text();
    let parsedBody: unknown = {};

    if (rawBody) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON payload' },
          { status: 400 }
        );
      }
    }

    if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    const body = parsedBody as MercadoPagoWebhookBody;
    const dataId = toOptionalString(body.data?.id);
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');

    if (!xSignature || !xRequestId || !dataId) {
      return NextResponse.json(
        { error: 'Missing webhook signature metadata' },
        { status: 400 }
      );
    }

    const isValid = validateSignature(xSignature, xRequestId, dataId, secret);

    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await saveWebhookRequest({
      provider: 'mercado_pago',
      path: request.nextUrl.pathname,
      method: request.method,
      authenticated: true,
      externalRequestId: xRequestId,
      notificationId: toOptionalString(body.id),
      eventType: body.type ?? null,
      action: body.action ?? null,
      resourceId: dataId,
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      payload: body as JsonValue,
      rawBody,
    });

    void processWebhookNotification(body.type, dataId).catch((error) => {
      console.error('[mercadopago webhook] Error processing notification:', error);
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
