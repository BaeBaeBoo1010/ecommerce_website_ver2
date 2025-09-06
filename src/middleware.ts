// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isbot } from "isbot";

export const config = {
  matcher: ["/admin/:path*", "/products/:path*"],
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ 1. Check bot cho trang sản phẩm
  if (pathname.startsWith("/products/")) {
    const res = NextResponse.next();
    const ua = req.headers.get("user-agent") || "";

    // Lấy cookie botCache
    const botCache = req.cookies.get("botCache")?.value ?? "user";

    if (botCache === "bot") {
      // Bot đã được cache → rewrite
      const url = req.nextUrl.clone();
      url.pathname = "/ssr" + pathname;
      return NextResponse.rewrite(url);
    }

    if (botCache === "user") {
      // User đã được cache → cho qua
      return res;
    }

    // Nếu chưa có cookie → detect lần đầu
    if (isbot(ua)) {
      const url = req.nextUrl.clone();
      url.pathname = "/ssr" + pathname;
      const rewriteRes = NextResponse.rewrite(url);
      rewriteRes.cookies.set("botCache", "bot", { path: "/", maxAge: 60 * 60 });
      return rewriteRes;
    } else {
      res.cookies.set("botCache", "user", { path: "/", maxAge: 60 * 60 });
      return res;
    }
  }

  // ✅ 2. Check đăng nhập cho admin
  if (pathname.startsWith("/admin")) {
    const token =
      (await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: "__Secure-authjs.session-token",
      })) ||
      (await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      }));

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}
