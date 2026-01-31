'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { loadStripe } from "@stripe/stripe-js";
import { PricingCard } from './PricingCard';

interface CheckoutProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export default function PricingSection({ 
  onSuccess, 
  onCancel,
  className = "" 
}: CheckoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [assinatura, setAssinatura] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const assinaturaFromUrl = searchParams.get('plan');

  useEffect(() => {
    if (session && assinatura) {
      handlePayment(assinatura);
    } 
    if (!session && assinatura) {
      router.push(`/auth?plan=${assinatura}`);
    } 
  }, [status, assinatura]);

  useEffect(() => {
    if (assinaturaFromUrl && session && status === 'authenticated') {
      handlePayment(Number(assinaturaFromUrl));
    }
  }, [session, status, assinaturaFromUrl]);

  const handlePayment = async (assinatura: number) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const checkoutResponse = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assinatura }),
      });

      const stripeClient = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUB_KEY as string
      );

      if (!stripeClient) throw new Error("Stripe failed to initialize.");

      const { sessionId } = await checkoutResponse.json();
      await stripeClient.redirectToCheckout({ sessionId });
      
      // Chama callback de sucesso se fornecido
      onSuccess?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

    const planos = [
    {
      id: 1,
      nome: 'Plano Mensal',
      preco: 'R$30,00',
      periodo: '/mês',
      corDestaque: 'red' as const,
      beneficios: [
        'Referências apuradas e valiosas',
        'Criatividade ilimitada',
        'Atualização diária de conteúdo',
        'Acesso 24/7 à plataforma',
        'Suporte por email'
      ]
    },
    {
      id: 2,
      nome: 'Plano Trimestral',
      preco: 'R$85,00',
      periodo: '/trimestre',
      economia: '20%',
      popular: true,
      corDestaque: 'orange' as const,
      beneficios: [
        'Todos os benefícios do mensal',
        '🔥 Suporte prioritário',
        '🎁 Ofertas exclusivas',
        '⭐⭐⭐⭐⭐'
      ]
    },
    {
      id: 3,
      nome: 'Plano Semestral',
      preco: 'R$160,00',
      periodo: '/semestre',
      economia: '40%',
      corDestaque: 'green' as const,
      beneficios: [
        'Todos os benefícios do trimestral',
        '🚀 Mais Foco no que faz a diferença',
        '⭐⭐⭐⭐⭐'
      ]
    }
  ];

  if (isProcessing) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center">Redirecionando para pagamento...</h2>
          <p className="text-center">Por favor, aguarde enquanto processamos sua requisição.</p>
        </div>
      </div>
    );
  }
  if (session?.status) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center">Assinatura ativa!</h2>
        </div>
      </div>
    );
  }

   return (
      <div className={`px-4 sm:px-6 lg:px-8 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl">
              Escolha seu <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">Plano</span>
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Assine agora e transforme sua criatividade com conteúdos exclusivos de editores de sucesso
            </p>
          </div>
  
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
            {planos.map((plano) => (
              <PricingCard
                key={plano.id}
                plano={plano}
                assinaturaSelecionada={assinatura}
                onSelecionar={setAssinatura}
              />
            ))}
          </div>
  
          {/* Ações */}
          <div className="mt-12 text-center space-y-6">
            {assinatura && (
              <div className="space-y-4">
                <button
                  onClick={() => handlePayment(assinatura)}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-lg rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-green-500/25 transform hover:scale-105"
                >
                  🚀 Continuar para Pagamento Seguro
                </button>
                <p className="text-green-400 font-semibold">
                  ✅ Plano selecionado: {planos.find(p => p.id === assinatura)?.nome}
                </p>
              </div>
            )}
  
            {onCancel && (
              <div>
                <button
                  onClick={onCancel}
                  className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium border border-gray-600 rounded-lg hover:border-gray-400"
                >
                  Voltar
                </button>
              </div>
            )}
  
          </div>
        </div>
      </div>
    );
}