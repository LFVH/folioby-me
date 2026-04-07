import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { payment } from '@/lib/mercadopago';
import { userPaid, userCancelPlan } from '@/lib/gerenciar-plano';

// --- 1. Função de Validação de Assinatura (HMAC-SHA256) ---
function validateSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string
): boolean {
  const ts = xSignature.split(',')[0].split('=')[1];
  const hash = xSignature.split(',')[1].split('=')[1];

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  );
}

// --- 2. Função de Processamento Assíncrono ---
async function processPaymentNotification(paymentId: string) {
  try {
    // Busca os detalhes do pagamento na API do Mercado Pago
    const paymentData = await payment.get({ id: paymentId });

    // Extrai os metadados que você passou na criação da pré-aprovação
    const userId = paymentData.external_reference;
    if(!paymentData.id){
        console.log("problema payment id")
        throw new Error("problema payment id")
    }
    const subscriptionId = paymentData.id.toString();
    const price = paymentData.transaction_amount;
    if(!paymentData.date_approved){        console.log("problema date_approved")
        throw new Error("problema date_approved");}
    const currentPeriodEnd = new Date(paymentData.date_approved);

    // Verifica o status do pagamento
    if (paymentData.status === 'approved') {
      // Chama a função que você já tem para ativar o plano
      await userPaid({
        mercadoPagoPaymentId: paymentId,
        mercadoPagoSubscriptionId: subscriptionId,
        priceId: price, // Você pode mapear o price para o plano no seu sistema
        userId: userId,
        currentPeriodEnd: currentPeriodEnd,
      });
    } else if (paymentData.status === 'cancelled') {
      await userCancelPlan({ subscriptionId: subscriptionId });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
  }
}

// --- 3. Rota Principal do Webhook --- 
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
    // Obtém os cabeçalhos e o corpo da requisição
    const xSignature = request.headers.get('x-signature');
    const xRequestId = request.headers.get('x-request-id');
    const body = await request.json();

    // Valida a presença dos cabeçalhos e do ID do pagamento
    if (!xSignature || !xRequestId || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    // Valida a assinatura para garantir que a notificação veio do Mercado Pago
    const isValid = validateSignature(
      xSignature,
      xRequestId,
      body.data.id,
      secret
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verifica se é uma notificação de pagamento
    if (body.type === 'payment') {
      // Processa o pagamento de forma assíncrona para responder rápido ao webhook
      processPaymentNotification(body.data.id).catch(console.error);
    }

    // Retorna 200 imediatamente para evitar timeouts e reenvios
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}