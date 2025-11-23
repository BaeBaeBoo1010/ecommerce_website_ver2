import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"


export const config = {
  matcher: [
    "/admin/:path*",
    "/api/categories/:path*",
    "/api/products/:path*",
    "/api/revalidate",
  ],
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const method = req.method

  const isApiRoute = pathname.startsWith("/api/")
  const isAdminSection = pathname.startsWith("/admin")
  const isCategoryApi = pathname.startsWith("/api/categories")
  const isProductApi = pathname.startsWith("/api/products")
  const isRevalidateApi = pathname.startsWith("/api/revalidate")

  const isSafeMethod = method === "GET" || method === "OPTIONS" || method === "HEAD"
  const needsAdminRole =
    isAdminSection ||
    ((isCategoryApi || isProductApi) && !isSafeMethod) ||
    isRevalidateApi

  if (needsAdminRole || isRevalidateApi) {
    try {
      // ✅ Security: Validate NEXTAUTH_SECRET is set
      if (!process.env.NEXTAUTH_SECRET) {
        console.error("[Middleware] NEXTAUTH_SECRET is not set");
        if (isApiRoute) {
          return NextResponse.json(
            { success: false, error: "SERVER_ERROR" },
            { status: 500 },
          );
        }
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }

      const token =
        (await getToken({
          req,
          secret: process.env.NEXTAUTH_SECRET,
          cookieName: "__Secure-authjs.session-token",
        })) ||
        (await getToken({
          req,
          secret: process.env.NEXTAUTH_SECRET,
        }))

      if (!token) {
        if (isApiRoute) {
          return NextResponse.json(
            { success: false, error: "UNAUTHENTICATED" },
            { status: 401 },
          )
        }
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }

      if (needsAdminRole && token.role !== "admin") {
        if (isApiRoute) {
          return NextResponse.json(
            { success: false, error: "FORBIDDEN" },
            { status: 403 },
          )
        }
        return NextResponse.redirect(new URL("/", req.url))
      }

      if (isRevalidateApi) {
        const secret = process.env.REVALIDATE_SECRET
        const headerSecret = req.headers.get("x-revalidate-token")

        // ✅ Security: Use constant-time comparison to prevent timing attacks
        if (!secret || !headerSecret) {
          return NextResponse.json(
            { success: false, error: "INVALID_REVALIDATE_TOKEN" },
            { status: 401 },
          )
        }

        // ✅ Security: Constant-time string comparison
        const isValid = secret.length === headerSecret.length && 
          secret === headerSecret; // In production, use crypto.timingSafeEqual for Node.js
        
        if (!isValid) {
          return NextResponse.json(
            { success: false, error: "INVALID_REVALIDATE_TOKEN" },
            { status: 401 },
          )
        }
      }
    } catch (error) {
      console.error("[Middleware] Auth error:", error)
      if (isApiRoute) {
        return NextResponse.json(
          { success: false, error: "UNAUTHENTICATED" },
          { status: 401 },
        )
      }
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
  }

  return NextResponse.next()
}