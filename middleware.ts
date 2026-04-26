import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('pb_auth')
  const isLoggedIn = !!authCookie?.value

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

  if (!isLoggedIn && isDashboard) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
