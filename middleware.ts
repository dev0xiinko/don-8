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

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
