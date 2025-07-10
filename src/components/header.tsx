// app/components/Header.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, ShoppingCart, User } from "lucide-react";
import Image from "next/image";
import SearchCommand from "./search-command";
import MobileSidebar from "./sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Header() {
  const [cartCount] = useState(3);

  const router = useRouter();
  useEffect(() => {
    router.prefetch("/products");
    router.prefetch("/introduction");
    router.prefetch("/contact");
  });

  return (
    <header id="header" className="flex h-15 justify-between bg-white sm:h-25">
      <div id="header-left" className="flex items-center">
        {/* Menu icon - ẩn */}
        <MobileSidebar />

        {/* Logo + tên shop */}
        <Link
          id="shop-name-container"
          className="flex cursor-pointer items-center justify-center"
          href={"/"}
        >
          <Image
            src="/images/logo.webp"
            alt="Logo"
            width={80}
            height={80}
            className="ml-5 hidden flex-shrink-0 xl:flex"
          />
          <div
            id="shop-name"
            className="ml-0 flex flex-col items-center space-y-[-2px] font-bold whitespace-nowrap lg:ml-5"
          >
            <div className="text-[12px] text-gray-500 sm:text-[16px]">
              Thiết bị điện
            </div>
            <div className="text-xl text-gray-500 sm:text-3xl">Quang Minh</div>
            <div id="shop-slogan" className="text-[8px] italic sm:text-[14px]">
              Automate your house
            </div>
          </div>
        </Link>

        {/* Danh mục dùng DropdownMenu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              id="product-list-button"
              className="ml-5 hidden cursor-pointer items-center justify-center rounded-xl border border-gray-800 bg-gray-100 px-4 py-2 font-bold transition-all hover:bg-gray-200 active:bg-gray-300 lg:flex"
            >
              <Menu />
              <span id="button-text" className="ml-2 whitespace-nowrap hidden xl:flex">
                Danh mục
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            align="start"
            className="z-[60] mt-2 w-64"
          >
            <DropdownMenuItem>Công tắc điều khiển từ xa</DropdownMenuItem>
            <DropdownMenuItem>Công tắc cảm ứng hồng ngoại</DropdownMenuItem>
            <DropdownMenuItem>Đèn cảm ứng</DropdownMenuItem>
            <DropdownMenuItem>Chuông cửa</DropdownMenuItem>
            <DropdownMenuItem>Công tắc hẹn giờ</DropdownMenuItem>
            <DropdownMenuItem>Thiết bị báo trộm</DropdownMenuItem>
            <DropdownMenuItem>Cảm biến hiện diện</DropdownMenuItem>
            <DropdownMenuItem>Thiết bị báo khách</DropdownMenuItem>
            <DropdownMenuItem>Thiết bị nhà thông minh</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div id="header-middle" className="flex min-w-0 flex-1 items-center">
        <nav className="hidden items-center lg:flex">
          <Button variant="ghost" className="text-[16px]" asChild>
            <Link href="/">Trang chủ</Link>
          </Button>
          <Button variant="ghost" className="text-[16px]" asChild>
            <Link href="/products">Sản phẩm</Link>
          </Button>
          <Button variant="ghost" className="text-[16px]" asChild>
            <Link href="/introduction">Giới thiệu</Link>
          </Button>
          <Button variant="ghost" className="text-[16px]" asChild>
            <Link href="/contact">Liên hệ</Link>
          </Button>
        </nav>
        <div className="ml-5 max-w-70 min-w-40 grow-1">
          <SearchCommand />
        </div>
      </div>

      <div
        id="header-right"
        className="flex w-50 items-center justify-end space-x-4 pr-4"
      >
        {/* Cart */}
        <Link
          href={"/"}
          className="relative flex flex-col items-center justify-center rounded-xl p-2 text-sm whitespace-nowrap transition-all hover:bg-gray-100"
        >
          <ShoppingCart className="mb-0.5"></ShoppingCart>
          <div className="hidden sm:flex">Giỏ hàng</div>
          {cartCount > 0 && (
            <Badge className="absolute top-0 -right-2 flex h-5 w-5 items-center justify-center p-0 text-xs sm:-top-2">
              {cartCount}
            </Badge>
          )}
        </Link>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex cursor-pointer flex-col items-center justify-center rounded-xl p-2 text-sm whitespace-nowrap transition-all hover:bg-gray-100">
              <User className="mb-0.5" />
              <div className="hidden sm:flex">Tài khoản</div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/auth/login">Đăng nhập</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/auth/register">Tạo tài khoản</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
