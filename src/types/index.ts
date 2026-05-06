// types/index.ts
export interface Conteudo {
  id: string
  filename: string
  mimetype: string
  data: Buffer
  createdAt: Date
  name: string
  isTrend: boolean
}

export interface ConteudoWithUrl {
  isTrend: boolean
  id: string 
  name: string | null
  filename: string
  mimetype: string
  link?: string | null
  data: Buffer
  linkext?: string | null 
  fonte: string | null
  url: string
  createdAt: Date
  categorias?: Categoria[]
  mediaType: 'sequence' | 'single';
  mediaUrls: string[]; // Array de URLs (para sequência)
  thumbnailUrl?: string; // Primeira imagem ou thumbnail gerada
}
export interface Categoria {
  id: string
  nome: string
  descricao?: string
  conteudos: Conteudo[]
  isTrend: boolean
  createdAt: Date
}


export interface CategoriaWithUrls {
  id: string
  nome: string | null
  name: string | null
  descricao?: string | null
  isTrend: boolean
  conteudos: ConteudoWithUrl[] 
  createdAt: string
  updatedAt: string
}

export enum StatusCode {//statusAss
  // Pré-pagamento
  INATIVO = 1,           // Cadastrado no sistema, nunca interagiu com Stripe
  TRIAL = 2,             // Em período de teste gratuito
  
  // Processo de pagamento
  PENDENTE = 3,          // Checkout iniciado, aguardando confirmação
  INCOMPLETO = 4,        // Requer ação adicional (autenticação 3D Secure)
  INCOMPLETO_EXPIRADO = 5, // Checkout expirou sem conclusão
  
  // Estados ativos
  ATIVO = 6,             // Assinatura ativa, pagamentos em dia
  PAUSADO = 7,           // Assinatura pausada temporariamente
  
  // Problemas de pagamento
  SUSPENSO = 8,          // Pagamento falhou, em grace period
  INADIMPLENTE = 9,      // Vários pagamentos falhos
  
  // Estados finais
  CANCELADO = 10,        // Usuário cancelou (mantém acesso até fim do período)
  EXPIRADO = 11,         // Acesso finalizado após cancelamento
  REEMBOLSADO = 12       // Pagamento reembolsado
}

export enum PlanoCode {
  INATIVO = 0,   
  MENSAL = 1,     
  TRIMESTRAL = 2,  
  SEMESTRAL = 3,
  ANUAL = 4
}

export const planos = [
    {
      id: 1,
      nome: 'Plano Mensal Lançamento',
      preco: 'R$14,00',
      price: 14.00,
      periodo: '/mês',
      corDestaque: 'red' as const,
      beneficios: [
        'Acesso a todas as funções',
        'Atualização frequente',
        'Acesso 24/7 à plataforma',
        'Suporte por email',
        '⭐'
      ]
    },
    {
      id: 2,
      nome: 'Plano Trimestral Exclusivo',
      preco: 'R$40,00',
      price: 40.00,
      periodo: '/trimestre',
      economia: '5%',
      popular: true,
      corDestaque: 'orange' as const,
      beneficios: [
        'Todos os benefícios do mensal',
        '🔥 Suporte prioritário',
        '🎁 Ofertas exclusivas',
        '⭐⭐⭐'
      ]
    },
    {
      id: 3,
      nome: 'Plano Semestral',
      preco: 'R$75,70',
      price: 75.70,
      periodo: '/semestre',
      economia: '10%',
      corDestaque: 'green' as const,
      beneficios: [
        'Todos os benefícios do trimestral',
        '🚀 Mais Foco no que faz a diferença',
        '⭐⭐⭐⭐⭐⭐'
      ]
    }
  ];

  export const contact_mail = "contact@folioby.me"