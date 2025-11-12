import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { isbot } from "isbot"

export const config = {
  matcher: [
    "/admin/:path*",
    "/products/:path*",
    "/api/categories/:path*",
    "/api/products/:path*",
    "/api/revalidate",
  ],
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ua = req.headers.get("user-agent") || ""
  const method = req.method

  // ✅ 1. Bot detection + SSR rewrite cho trang sản phẩm
  if (pathname.startsWith("/products/")) {
    const botCache = req.cookies.get("botCache")?.value ?? null

    // Nếu đã cache là bot
    if (botCache === "bot") {
      const url = req.nextUrl.clone()
      url.pathname = "/ssr" + pathname
      return NextResponse.rewrite(url)
    }

    // Nếu chưa cache, detect user-agent
    if (!botCache) {
      try {
        const acceptHeader = req.headers.get("accept") || ""
        const isHtmlRequest = acceptHeader.includes("text/html")
        const isGetRequest = req.method === "GET"

        const isBotRequest =
          isGetRequest &&
          isHtmlRequest &&
          (isbot(ua) ||
            ua.toLowerCase().includes("bot") ||
            ua.toLowerCase().includes("crawler") ||
            ua.toLowerCase().includes("spider"))

        if (isBotRequest) {
          const url = req.nextUrl.clone()
          url.pathname = "/ssr" + pathname
          const rewriteRes = NextResponse.rewrite(url)

          rewriteRes.cookies.set("botCache", "bot", {
            path: "/products",
            maxAge: 86400 * 7, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          })
          return rewriteRes
        } else {
          const res = NextResponse.next()
          res.cookies.set("botCache", "user", {
            path: "/products",
            maxAge: 86400 * 7, // 7 days
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          })
          return res
        }
      } catch (error) {
        console.error("[Middleware] Bot detection error:", error)
        const res = NextResponse.next()
        res.cookies.set("botCache", "user", {
          path: "/products",
          maxAge: 3600,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })
        return res
      }
    }

    return NextResponse.next()
  }


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

        if (!secret || headerSecret !== secret) {
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
