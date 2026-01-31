// types/index.ts
export interface Conteudo {
  id: string
  filename: string
  mimetype: string
  data: Buffer
  createdAt: Date
  nome: string
  name: string
  isTrend: boolean
}

export interface ConteudoWithUrl {
  isTrend: boolean
  id: string 
  nome: string | null
  name: string | null
  filename: string
  mimetype: string
  link?: string | null
  data: Buffer
  linkext?: string | null 
  url: string
  createdAt: Date
  categorias?: Categoria[]
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
  isFree: boolean
  isTrend: boolean
  conteudos: ConteudoWithUrl[] 
  conteudosBloqueados?: number 
  createdAt: string
  updatedAt: string
}

export enum StatusCode {
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