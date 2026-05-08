import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { verifyUserById } from "./utils/verifyUserAuth"
import { getValidUserSlugs } from "./lib/db/slug-service"
import { ratelimit } from "./lib/ratelimit"
import { isFileLikePathname } from "./lib/user-slug"

export const runtime = "nodejs"

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
}

function getRateLimitKey(request: NextRequest, userId?: string) {
  if (userId) {
    return `user:${userId}`
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const realIp = request.headers.get("x-real-ip")?.trim()
  const clientIp = forwardedFor || realIp || "anonymous"

  return `ip:${clientIp}`
}

export async function middleware(request: NextRequest) {
  const publicRoutes = process.env.PUBLIC_ROUTES?.split(",") || ["/"]
  const logginRoutes = process.env.DESLOG_ROUTES?.split(",") || ["/"]
  const currentPath = request.nextUrl.pathname

  console.log("currentPath")
  console.log(currentPath)

  if (currentPath.startsWith("/_next") || currentPath.startsWith("/static") || isFileLikePathname(currentPath)) {
    return NextResponse.next()
  }

  const isPublic = publicRoutes.some(
    (route) => currentPath === route || currentPath.startsWith(route + "/")
  )

  if (isPublic) {
    console.log(`Rota ignorada: ${currentPath}`)
    return NextResponse.next()
  }

  const potentialSlug = currentPath.replace(/^\//, "").replace(/\/profile$/, "")
  console.log(potentialSlug)

  const validSlugs = await getValidUserSlugs()
  console.log(validSlugs)
  console.log("validSlugs")
  if (validSlugs.includes(potentialSlug)) {
    return NextResponse.next()
  }

  const isLogginRoutes = logginRoutes.some(
    (route) => currentPath === route || currentPath.startsWith(route + "/")
  )

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const tokenUserId = token?.user?.id
  if(process.env.NODE_ENV && process.env.NODE_ENV !== "development")
  {  const rateLimitKey = getRateLimitKey(request, tokenUserId)
  const { success } = await ratelimit.limit(rateLimitKey)

  if (!success) {
    return new NextResponse("Too Many Requests", { status: 429 })
  }
}
  if (!tokenUserId) {
    if (isLogginRoutes) {
      return NextResponse.next()
    }

    return NextResponse.redirect(new URL("/login", request.url))
  }

  const authResult = await verifyUserById(tokenUserId)
  if (authResult instanceof NextResponse) {
    console.log("1")
    return authResult
  }

  if (!authResult.isPremium) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (
    !request.nextUrl.pathname.startsWith("/nextsteps/contents") &&
    !request.nextUrl.pathname.startsWith("/nextsteps/categorias") &&
    !request.nextUrl.pathname.startsWith("/api/nextsteps") &&
    !request.nextUrl.pathname.startsWith("/nextsteps/profile") &&
    !request.nextUrl.pathname.startsWith("/nextsteps/user/profile")
  ) {
    return NextResponse.redirect(new URL("/nextsteps/contents", request.url))
  }

  return NextResponse.next()

  //----------------------------

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

  //----------------------------
}
