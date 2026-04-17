import { auth } from '@/lib/auth'
import { NextResponse, type NextRequest } from 'next/server'

const protectedPrefixes = [
  '/dashboard',
  '/propiedades',
  '/consultas',
  '/sitio-web',
  '/campos-personalizados',
  '/configuracion',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  const session = await auth()

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon\\.ico|icon-|apple-icon|portal|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
