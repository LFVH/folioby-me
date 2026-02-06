// lib/db/slug-service.ts

import prisma from "@/prisma"

// Estado global do cache
const slugCache = {
  data: [] as string[],
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutos
  isRefreshing: false // Evita chamadas duplicadas
}

async function fetchSlugsFromDB(): Promise<string[]> {
  
  const users = await prisma.usuario.findMany({
    where: { isPremium: true },
    select: { slug: true }
  })
  
  return users.map(user => user.slug).filter(Boolean)
}

// Pega slugs com cache
export async function getValidUserSlugs(): Promise<string[]> {
  const now = Date.now()
  const isCacheValid = slugCache.data.length > 0 && 
                      (now - slugCache.timestamp) < slugCache.ttl

  if (isCacheValid) {
    return slugCache.data
  }

  // Evita múltiplas chamadas simultâneas
  if (slugCache.isRefreshing) {
    return slugCache.data.length > 0 ? slugCache.data : []
  }

  try {
    slugCache.isRefreshing = true
    const freshSlugs = await fetchSlugsFromDB()
    
    slugCache.data = freshSlugs
    slugCache.timestamp = now
    slugCache.isRefreshing = false
    
    console.log(`Cache atualizado com ${freshSlugs.length} slugs`)
    return freshSlugs
  } catch (error) {
    slugCache.isRefreshing = false
    console.error('❌ Erro ao atualizar cache:', error)
    return slugCache.data // Fallback para cache antigo
  }
}

export async function refreshSlugCache(): Promise<void> {
  console.log('🚀 Forçando atualização do cache...')
  
  try {
    const freshSlugs = await fetchSlugsFromDB()
    
    slugCache.data = freshSlugs
    slugCache.timestamp = Date.now()
      } catch (error) {
    console.error('❌ Falha ao refresh cache:', error)
    // Invalida o cache para forçar nova busca
    slugCache.timestamp = 0
  }
}

// Invalida sem buscar (próxima requisição buscará do banco)
export function invalidateSlugCache(): void {
  console.log('🗑️ Cache invalidado (será refrescado na próxima requisição)')
  slugCache.timestamp = 0
}

// Versão síncrona para middleware (evita async se possível)
export function getCachedSlugsSync(): string[] {
  return slugCache.data
}