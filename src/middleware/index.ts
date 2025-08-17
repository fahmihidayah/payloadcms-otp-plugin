import { NextRequest, NextResponse } from "next/server.js";

export async function middlewareOtp(request: NextRequest): Promise<NextResponse>{
    const url = request.nextUrl
    console.log('middleware : ', url.pathname)
    if (url.pathname === '/admin/login') {
        const redirect = url.searchParams.get('redirect')

        // If already set to 'otp-validation', do nothing
        if (redirect === '/otp-validation') {
            return NextResponse.next()
        }

        // If no redirect param, set to 'otp-validation'
        if (!redirect) {
            return redirectWithInitialParam(url)
        }

        // If redirect param exists and isn't 'otp-validation', add second/another
        return redirectWithChainedParams(url, redirect)
    }
    // else if(url.pathname === '/admin/otp-verification') {
    //     const nextCookies = await cookies();
    //     const otpToken = nextCookies.get("otp-token");
    //     if(!otpToken) {
    //         return NextResponse.redirect("/admin/login")
    //     }
    // }
    return NextResponse.next()
}


// Add ?redirect=otp-validation if missing
function redirectWithInitialParam(url: URL): NextResponse {
  const newUrl = new URL(url.toString())
  newUrl.searchParams.set('redirect', '/otp-validation')
  return NextResponse.redirect(newUrl)
}

// Add ?redirect=otp-validation&second-redirect=<original>&another=redirect
function redirectWithChainedParams(url: URL, originalRedirect: string): NextResponse {
  const newUrl = new URL(url.toString())
  newUrl.searchParams.set('redirect', '/otp-validation')
  newUrl.searchParams.set('admin-redirect', originalRedirect)
  return NextResponse.redirect(newUrl)
}
