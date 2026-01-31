import { NextRequestWithAuth, withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { logNow } from "./utils/Logging"
import { getToken } from "next-auth/jwt"
import { isActuallyChief as isActuallyChief } from "./utils/verifyUserAuth"

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
  const currentPath = request.nextUrl.pathname;
  if (currentPath.startsWith('/_next') || 
      currentPath.startsWith('/static') ||
      currentPath.includes('.') && !currentPath.includes('/api/')) {
    return NextResponse.next();
  }
  const isAppRoute = appRoutes.some(route => 
    currentPath === route || currentPath.startsWith(route + '/')
  );
  if (!isAppRoute) {
    console.log(`🚫 Rota ignorada: ${currentPath}`);
    return NextResponse.next();
  }
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if(!token && (
    request.nextUrl.pathname.startsWith('/login')  || 
    request.nextUrl.pathname.startsWith('/signup') || 
    request.nextUrl.pathname.startsWith('/auth')   ||
    request.nextUrl.pathname === '/') ){
    return NextResponse.next();
  }
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
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
  if (request.nextUrl.pathname.startsWith('/api/letsgo') || request.nextUrl.pathname.startsWith('/letsgo')) {
    try {
      const response  = await fetch(`${request.nextUrl.origin}/api/auth-v`, { 
        method: "GET",
        headers: { Cookie: request.headers.get("Cookie") || "" }
      });
      const data = await response.json()
      if (!data.userId) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return NextResponse.next()
    } catch(error){
      console.log(error);
      return NextResponse.redirect(new URL('/', request.url))
    }
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