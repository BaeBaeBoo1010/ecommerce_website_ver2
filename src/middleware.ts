// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isbot } from "isbot";

export const config = {
  matcher: ["/admin/:path*", "/products/:path*"],
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";

  // ✅ 1. Bot detection + SSR rewrite cho trang sản phẩm
  if (pathname.startsWith("/products/")) {
    const botCache = req.cookies.get("botCache")?.value ?? null;

    // Nếu đã cache là bot
    if (botCache === "bot") {
      const url = req.nextUrl.clone();
      url.pathname = "/ssr" + pathname;
      return NextResponse.rewrite(url);
    }

    // Nếu chưa cache, detect user-agent
    if (!botCache) {
      if (isbot(ua)) {
        const url = req.nextUrl.clone();
        url.pathname = "/ssr" + pathname;
        const rewriteRes = NextResponse.rewrite(url);
        rewriteRes.cookies.set("botCache", "bot", { path: "/products", maxAge: 3600 });
        return rewriteRes;
      } else {
        const res = NextResponse.next();
        res.cookies.set("botCache", "user", { path: "/products", maxAge: 3600 });
        return res;
      }
    }

    // Nếu cache là user → cho qua
    return NextResponse.next();
  }

  // ✅ 2. Check đăng nhập admin
  if (pathname.startsWith("/admin")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}
