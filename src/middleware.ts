import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { isbot } from "isbot"

export const config = {
  matcher: ["/admin/:path*", "/products/:path*"],
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const ua = req.headers.get("user-agent") || ""

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
        const isBotRequest =
          isbot(ua) ||
          ua.toLowerCase().includes("bot") ||
          ua.toLowerCase().includes("crawler") ||
          ua.toLowerCase().includes("spider") ||
          req.headers.get("accept")?.includes("text/html") === false

        if (isBotRequest) {
          const url = req.nextUrl.clone()
          url.pathname = "/ssr" + pathname
          const rewriteRes = NextResponse.rewrite(url)

          rewriteRes.cookies.set("botCache", "bot", {
            path: "/products",
            maxAge: 86400 * 7, // 7 days instead of 1 hour
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          })
          return rewriteRes
        } else {
          const res = NextResponse.next()

          res.cookies.set("botCache", "user", {
            path: "/products",
            maxAge: 86400 * 7, // 7 days instead of 1 hour
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          })
          return res
        }
      } catch (error) {
        console.error("[Middleware] Bot detection error:", error)
        // Fallback to treating as user if detection fails
        const res = NextResponse.next()
        res.cookies.set("botCache", "user", {
          path: "/products",
          maxAge: 3600, // Shorter cache for error cases
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })
        return res
      }
    }

    // Nếu cache là user → cho qua
    return NextResponse.next()
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
