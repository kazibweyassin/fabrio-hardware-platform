import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

const protectedRoutes = ['/checkout', '/account', '/orders']
const adminRoutes = ['/admin']

function getSessionCookie(request: NextRequest) {
  return (
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token')
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isProtected =
    protectedRoutes.some((route) => pathname.startsWith(route)) || isAdminRoute

  if (!isProtected) {
    return NextResponse.next()
  }

  if (!sessionCookie) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute) {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/checkout/:path*', '/account/:path*', '/orders/:path*', '/admin/:path*'],
}