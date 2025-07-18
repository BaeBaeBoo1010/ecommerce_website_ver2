// middleware.ts  (thư mục gốc)
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/admin/:path*"],      // chạy cho mọi URL /admin/**
};

export default async function middleware(req: NextRequest) {
  // Lấy token từ cookie (Edge‑safe, không cần crypto Node)
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  console.log("TOKEN:", token);
  // 1️⃣  Chưa đăng nhập  →  /login
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 2️⃣  Đã đăng nhập nhưng KHÔNG phải admin → về trang chủ
  if (token.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 3️⃣  Admin hợp lệ → cho qua
  return NextResponse.next();
}
