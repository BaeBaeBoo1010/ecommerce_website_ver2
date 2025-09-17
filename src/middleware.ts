import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export const config = {
  matcher: ["/admin/:path*", "/products/:path*"],
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ 1. Rewrite toàn bộ trang sản phẩm sang SSR
  if (pathname.startsWith("/products/")) {
    const url = req.nextUrl.clone()
    url.pathname = "/ssr" + pathname
    return NextResponse.rewrite(url)
  }

  // ✅ 2. Check đăng nhập cho admin
  if (pathname.startsWith("/admin")) {
    try {
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
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }

      if (token.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url))
      }
    } catch (error) {
      console.error("[Middleware] Auth error:", error)
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }
  }

  return NextResponse.next()
}
