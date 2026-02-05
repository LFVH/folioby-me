import { NextRequestWithAuth, withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { logNow } from "./utils/Logging"
import { getToken } from "next-auth/jwt"
import { isActuallyChief as isActuallyChief } from "./utils/verifyUserAuth"
import { getValidUserSlugs } from './lib/db/slug-service'

export const runtime = 'nodejs'


export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
}

const authMiddleware = withAuth({
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login', 
    error: '/',
  },
  callbacks: {
    authorized({ token }) {
      return !!token
    },
  },
})

export async function middleware(request: NextRequest, event: NextFetchEvent) { 
  
  const appRoutes = process.env.APP_ROUTES?.split(',') || [
    '/', '/login'
  ];
  const publicRoutes = ['/login', '/signup', '/auth', '/']

  const currentPath = request.nextUrl.pathname;
  if (currentPath.startsWith('/_next') || 
      currentPath.startsWith('/static') ||
      currentPath.includes('.') && !currentPath.includes('/api/')) {
    return NextResponse.next();
  }
    // Remover a barra inicial para comparar
  const potentialSlug = currentPath.slice(1)
  
  // Obter a lista válida de slugs
  const validSlugs = await getValidUserSlugs()
  
  // Verificar se o slug existe na lista
  if (validSlugs.includes(potentialSlug)) {
    // Slug válido: permitir acesso à página /[slug]
    return NextResponse.next()
  }
  const isAppRoute = appRoutes.some(route => 
    currentPath === route || currentPath.startsWith(route + '/')
  );
  if (!isAppRoute) {
    console.log(`🚫 Rota ignorada: ${currentPath}`);
    return NextResponse.next();
  }
  const isPublic = publicRoutes.some(route => 
    currentPath === route || currentPath.startsWith(route + '/')
  )
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (token && isPublic && currentPath !== '/') {
    return NextResponse.redirect(new URL('/nextsteps', request.url))
  }
  const authResult = await authMiddleware(request as NextRequestWithAuth, event)
  if (authResult) return authResult
  const origin = request.headers.get('origin')
  const allowedDomain = process.env.NEXTAUTH_URL

  if (origin && origin !== allowedDomain) {
    logNow("origin:");
    console.log(origin)
    return new NextResponse('404', { status: 403 })
  }
  if (request.nextUrl.pathname.startsWith('/api/nextsteps') || request.nextUrl.pathname.startsWith('/nextsteps')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  const chiefRoutes = process.env.CHIEF_ROUTES?.split(',') || ['/admin'];
  const isChiefRoute = chiefRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  if (isChiefRoute) {
    const userRole = (token as any)?.user?.role;
    const userId = (token as any)?.user?.id;

    if (userRole !== 'chief' || !isActuallyChief(userId)) {
      if (request.nextUrl.pathname.startsWith('/api')) {
        return new NextResponse(
          JSON.stringify({ error: '404 Not Found' }), 
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL('/_not-found', request.url));
    }
    return NextResponse.next()
  }
  if(token && token.user?.status){
    if (!request.nextUrl.pathname.startsWith("/letsgo")) {
      return NextResponse.redirect(new URL("/letsgo", request.url));
    }
  }
  console.log("possível caso descoberto");
  return NextResponse.next()
}