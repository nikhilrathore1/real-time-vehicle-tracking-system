import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth, isOperatorOrAdmin } from "@/lib/auth-utils"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes protection
  if (pathname.startsWith("/api/admin")) {
    const auth = await verifyAuth(request)

    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    if (!isOperatorOrAdmin(auth.role)) {
      return NextResponse.json({ error: "Admin or operator access required" }, { status: 403 })
    }
  }

  // Protected API routes
  if (
    pathname.startsWith("/api/user") ||
    pathname.startsWith("/api/favorites") ||
    pathname.startsWith("/api/notifications/subscribe")
  ) {
    const auth = await verifyAuth(request)

    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/admin/:path*", "/api/user/:path*", "/api/favorites/:path*", "/api/notifications/subscribe"],
}
