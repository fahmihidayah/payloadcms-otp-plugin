
import { NextRequest, NextResponse } from 'next/server.js'
import { middlewareOtp } from '../src/middleware/index.js'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Apply OTP middleware for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return await middlewareOtp(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}