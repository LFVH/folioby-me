// app/api/stripe/create-portal-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import stripe from "@/lib/stripe";
import { verifyUser } from '@/utils/verifyUserAuth';
import prisma from '@/database/prisma';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyUser();
    if (authResult instanceof NextResponse) return authResult;
    const { userId, isPremium } = authResult;

    const { return_url } = await request.json();

    const userDB = await prisma.usuario.findUnique({
      where: { id: userId },
    });
    if(!userDB) return NextResponse.json(
      { error: 'Usuário não encontrado' },
      { status: 401 }
    );
    if(!userDB.stripeCliId) return NextResponse.json(
      { error: 'Id não encontrado' },
      { status: 401 }
    );
    
    // Se você não tiver o customerId armazenado, pode buscar pelas assinaturas
    const subscriptions = await stripe.subscriptions.list({
      customer: userDB.stripeCliId, 
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const customerId = subscriptions.data[0].customer as string;

    // Criar sessão do portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: return_url || `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('portal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}