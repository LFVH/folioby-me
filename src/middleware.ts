import { NextRequestWithAuth, withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { logNow } from "./utils/Logging"
import { getToken } from "next-auth/jwt"
import { isActuallyChief as isActuallyChief, verifyUser } from "./utils/verifyUserAuth"
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
  
  const publicRoutes = process.env.PUBLIC_ROUTES?.split(',') || [
    '/'
  ];
  const logginRoutes = process.env.DESLOG_ROUTES?.split(',') || [
    '/'
  ];
  const currentPath = request.nextUrl.pathname;
  console.log("currentPath")
  console.log(currentPath)
  if (currentPath.startsWith('/_next') || 
      currentPath.startsWith('/static') ||
      currentPath.includes('.') && !currentPath.includes('/api/')) {
    return NextResponse.next();
  }
  const potentialSlug = currentPath.replace(/^\//, '').replace(/\/profile$/, '');
  console.log(potentialSlug)
  const validSlugs = await getValidUserSlugs()
  if (validSlugs.includes(potentialSlug)) {
    return NextResponse.next()
  }

  const isPublic = publicRoutes.some(route => 
    currentPath === route || currentPath.startsWith(route + '/')
  )
  if(isPublic) {
    console.log(`Rota ignorada: ${currentPath}`);
    return NextResponse.next()
  }

  const isLogginRoutes = logginRoutes.some(route => 
    currentPath === route || currentPath.startsWith(route + '/')
  )

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    if(isLogginRoutes){
      return NextResponse.next()
    }
        return NextResponse.redirect(new URL("/login", request.url));
  }
  const authResult = await verifyUser();
  if (authResult instanceof NextResponse) return authResult;
  const { isPremium } = authResult;
  if(!isPremium){
    return NextResponse.redirect(new URL("/", request.url))
  }
  if(token){
    if(token.user?.status){
      if (!request.nextUrl.pathname.startsWith("/nextsteps/contents") 
       && !request.nextUrl.pathname.startsWith('/api/nextsteps')
       && !request.nextUrl.pathname.startsWith('/nextsteps/profile')) {
        return NextResponse.redirect(new URL("/nextsteps/contents", request.url));
      }
      return NextResponse.next()
    } else{
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  const origin = request.headers.get('origin')
  const allowedDomain = process.env.NEXTAUTH_URL

  if (origin && origin !== allowedDomain) {
    logNow("origin:");
    console.log(origin)
    return new NextResponse('404', { status: 403 })
  }


  // const chiefRoutes = process.env.CHIEF_ROUTES?.split(',') || ['/admin'];
  // const isChiefRoute = chiefRoutes.some(route => 
  //   request.nextUrl.pathname.startsWith(route)
  // );
  // if (isChiefRoute) {
  //   const userRole = (token as any)?.user?.role;
  //   const userId = (token as any)?.user?.id;

  //   if (userRole !== 'chief' || !isActuallyChief(userId)) {
  //     if (request.nextUrl.pathname.startsWith('/api')) {
  //       return new NextResponse(
  //         JSON.stringify({ error: '404 Not Found' }), 
  //         { status: 403 }
  //       );
  //     }
  //     return NextResponse.redirect(new URL('/_not-found', request.url));
  //   }
  //   return NextResponse.next()
  // }

  

  console.log(`possível caso descoberto slug: ${currentPath}`);
  return NextResponse.next()
}