import { NextResponse } from 'next/server';
import { preApproval } from '@/lib/mercadopago';
import prisma from '@/prisma';
import { planos } from '@/types';
import { userExists } from '@/utils/verifyUserAuth';

export async function POST(req: Request) {
  try {
    const userDB = await userExists();
    if (userDB instanceof NextResponse) return userDB;
    const userId =  userDB.id;
    const { planType } = await req.json();

     const planoSelecionado = planos.find(plano => plano.id === planType);
    
    if (!planoSelecionado) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 400 }
      );
    }

    const frequencyMap = {
      1: { type: 'months', value: 1 },
      2: { type: 'months', value: 3 },
      3: { type: 'months', value: 6 },
      4: { type: 'years', value: 1 },
    } as const;

    const frequency = frequencyMap[planType as keyof typeof frequencyMap];

    if (!frequency) {
      return NextResponse.json(
        { error: 'Tipo de plano inválido' },
        { status: 400 }
      );
    }

    const subscription = await preApproval.create({
      body: {
        reason: `Assinatura ${planoSelecionado.nome} - Usuário ${userDB.name}`,
        auto_recurring: {
          frequency: frequency.value,
          frequency_type: frequency.type,
          transaction_amount: planoSelecionado.price,
          currency_id: 'BRL',
        },
        back_url: `https://folioby.me/nextsteps/contents`,
        
        payer_email: `test_user_5727595662563318073@testuser.com`,
        status: 'pending',
      },
    });

    // 4. Salvar o ID da assinatura no seu banco de dados
    await prisma.usuario.update({
      where: { id: userId },
      data: {
        mercadoPagoPreApprovalId: subscription.id, // Você precisará criar este campo no seu modelo
        statusAss: 5, // Status de "Aguardando pagamento"
      },
    });

    // 5. Retornar o link de pagamento para o frontend
    return NextResponse.json({
      initPoint: subscription.init_point,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}