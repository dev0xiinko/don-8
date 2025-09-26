import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Skip login page
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next()
    }

    // Check for admin session (in a real app, verify JWT token)
    const adminSession = request.cookies.get("admin_session")

    if (!adminSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // Check if accessing donor dashboard routes
  if (request.nextUrl.pathname.startsWith("/donor/dashboard")) {
    // Check for wallet connection (stored in localStorage, but we'll handle this client-side)
    // For now, redirect to login if no wallet connection info in cookies
    const walletConnection = request.cookies.get("wallet_connected")
    
    if (!walletConnection) {
      return NextResponse.redirect(new URL("/login?redirect=" + encodeURIComponent(request.nextUrl.pathname), request.url))
    }
  }

  // Check if accessing NGO dashboard routes
  if (request.nextUrl.pathname.startsWith("/ngo/dashboard")) {
    // Check for wallet connection and NGO verification
    const walletConnection = request.cookies.get("wallet_connected")
    const ngoVerified = request.cookies.get("ngo_verified")
    
    if (!walletConnection) {
      return NextResponse.redirect(new URL("/login?redirect=" + encodeURIComponent(request.nextUrl.pathname), request.url))
    }
    
    if (!ngoVerified) {
      return NextResponse.redirect(new URL("/ngo/verification?redirect=" + encodeURIComponent(request.nextUrl.pathname), request.url))
    }
  }

  // Check if accessing donate routes
  if (request.nextUrl.pathname.startsWith("/donate/")) {
    const walletConnection = request.cookies.get("wallet_connected")
    
    if (!walletConnection) {
      return NextResponse.redirect(new URL("/login?redirect=" + encodeURIComponent(request.nextUrl.pathname), request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/donor/dashboard/:path*", "/ngo/dashboard/:path*", "/donate/:path*"],
}
