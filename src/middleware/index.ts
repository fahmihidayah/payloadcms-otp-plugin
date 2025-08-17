import { NextRequest, NextResponse } from "next/server.js";

export async function middlewareOtp(request: NextRequest): Promise<NextResponse>{
    const url = request.nextUrl
    console.log('OTP Middleware:', url.pathname)
    
    if (url.pathname === '/admin/login') {
        const redirect = url.searchParams.get('redirect')

        // If already set to '/admin/otp-validation', do nothing
        if (redirect === '/otp-validation') {
            return NextResponse.next()
        }

        // If no redirect param, set to '/admin/otp-validation'
        if (!redirect) {
            return redirectWithInitialParam(url)
        }

        // If redirect param exists and isn't '/admin/otp-validation', add admin-redirect
        return redirectWithChainedParams(url, redirect)
    }
    
    // Handle OTP validation page access
    if (url.pathname === '/otp-validation') {
        // Allow access to OTP validation page
        return NextResponse.next()
    }
    
    return NextResponse.next()
}


// Add ?redirect=/admin/otp-validation if missing
function redirectWithInitialParam(url: URL): NextResponse {
  const newUrl = new URL(url.toString())
  newUrl.searchParams.set('redirect', '/otp-validation')
  return NextResponse.redirect(newUrl)
}

// Add ?redirect=/admin/otp-validation&admin-redirect=<original>
function redirectWithChainedParams(url: URL, originalRedirect: string): NextResponse {
  const newUrl = new URL(url.toString())
  newUrl.searchParams.set('redirect', '/otp-validation')
  newUrl.searchParams.set('admin-redirect', originalRedirect)
  return NextResponse.redirect(newUrl)
}
