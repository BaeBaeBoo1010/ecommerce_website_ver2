// app/components/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, ShoppingCart, User, Loader2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import SearchCommand from "./search-command";
import MobileSidebar from "./sidebar";

/**
 * Sticky, responsive, accessible header component.
 * – Shrinks to a single‑row layout on small screens
 * – Blurred translucent background so content below shines through when scrolling
 * – Prefetches common routes for instant navigation
 * – Renders category list fetched from `/api/categories`
 */
export default function Header() {
  const [cartCount] = useState(3);
  const [categories, setCategories] = useState<
    { name: string; slug: string }[]
  >([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const router = useRouter();

  // ⚡️ Prefetch frequently accessed routes
  useEffect(() => {
    router.prefetch("/products");
    router.prefetch("/introduction");
    router.prefetch("/contact");
  }, [router]);

  // 🔄 Load categories once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories);
      } catch (err) {
        console.error("Lỗi load danh mục:", err);
      } finally {
        setLoadingCats(false);
      }
    })();
  }, []);

  return (
    <header
      id="header"
      className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/80 backdrop-blur-md transition-colors dark:border-neutral-700/70 dark:bg-neutral-900/70"
    >
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-2 px-2 sm:h-20 sm:px-4 lg:h-24 lg:px-6">
        {/* LEFT: Logo + Mobile Sidebar */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile menu button (hidden ≥ lg) */}
          <MobileSidebar />

          {/* Logo */}
          <Link
            href="/"
            aria-label="Trang chủ"
            className="flex shrink-0 items-center gap-2"
          >
            <Image
              src="/images/logo.webp"
              alt="Logo"
              width={64}
              height={64}
              className="hidden text-transparent xl:inline"
              priority
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xs text-gray-500 sm:text-sm">
                Thiết bị điện
              </span>
              <span className="text-lg font-bold whitespace-nowrap text-gray-700 sm:text-2xl dark:text-white">
                Quang&nbsp;Minh
              </span>
              <span className="text-[10px] text-gray-400 italic sm:text-xs">
                Automate your house
              </span>
            </div>
          </Link>

          {/* Category dropdown (hidden < lg) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="hidden cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 active:bg-gray-300 lg:flex dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700"
                aria-label="Danh mục sản phẩm"
              >
                <Menu size={18} />
                <span className="hidden xl:inline">Danh mục</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[60] mt-2 w-64">
              {loadingCats ? (
                <DropdownMenuItem disabled className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Đang tải…
                </DropdownMenuItem>
              ) : categories.length === 0 ? (
                <DropdownMenuItem disabled>Không có danh mục</DropdownMenuItem>
              ) : (
                categories.map((cat) => (
                  <DropdownMenuItem key={cat.slug} asChild>
                    <Link href={`/products?category=${cat.slug}`}>
                      {cat.name}
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* MIDDLE: Nav links & Search (hidden < lg for links) */}
        <div className="flex flex-1 items-center gap-3 overflow-hidden">
          <nav className="hidden shrink-0 items-center gap-2 lg:flex">
            {[
              { href: "/", label: "Trang chủ" },
              { href: "/products", label: "Sản phẩm" },
              { href: "/introduction", label: "Giới thiệu" },
              { href: "/contact", label: "Liên hệ" },
            ].map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                className="text-sm font-medium hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-neutral-800"
                asChild
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
          </nav>

          {/* Search */}
          <div className="min-w-0 flex-1">
            <SearchCommand />
          </div>
        </div>

        {/* RIGHT: Cart & User menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Cart */}
          <Link
            href="/"
            className="relative flex flex-col items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-neutral-800"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart size={20} />
            <span className="hidden text-xs sm:block">Giỏ hàng</span>
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] font-semibold">
                {cartCount}
              </Badge>
            )}
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex cursor-pointer flex-col items-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-neutral-800"
                aria-label="Tài khoản"
              >
                <User size={20} />
                <span className="hidden text-xs sm:block">Tài khoản</span>
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
              <DropdownMenuItem asChild>
                <Link href="/admin/product-management">Quản lý sản phẩm</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
