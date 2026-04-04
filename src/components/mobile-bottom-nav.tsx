"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Menu,
  Box,
  ShoppingCart,
  User,
  Loader2,
  Store,
  LogOut,
  LayoutDashboard,
  Settings,
  ChevronRight,
  LogIn,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import useSWR from "swr";
import type { Category } from "@/types/product";
import { useMemo, useState } from "react";
import { useCart } from "@/context/cart-context";
import { useSession, signOut } from "next-auth/react";

import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems: cartCount } = useCart();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const { data: products = [], isLoading } = useSWR<any[]>(
    "/api/products", // Reusing the products API for categories as per sidebar logic
    fetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateIfStale: false,
    },
  );

  // Extract unique categories
  const categories: Category[] = useMemo(() => {
    const map = new Map<string, Category>();
    products.forEach((p) => {
      if (p.category?.id && !map.has(p.category.id)) {
        map.set(p.category.id, p.category);
      }
    });
    return Array.from(map.values());
  }, [products]);

  const navItems = [
    { href: "/", label: "Trang chủ", icon: Home },
    // Categories is special, handled separately
    { href: "/products", label: "Sản phẩm", icon: Box },
    { href: "/cart", label: "Giỏ hàng", icon: ShoppingCart, badge: cartCount },
    {
      href: status === "authenticated" ? "/profile" : "/auth/login",
      label: "Tài khoản",
    },
  ];

  // Hide on cart page and product detail pages
  if (pathname === "/cart" || pathname.startsWith("/products/")) return null;

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200/70 bg-white/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden dark:border-neutral-700/70 dark:bg-neutral-900/70">
      <div className="flex h-16 items-center justify-around px-1">
        {/* Home */}
        <Link
          href="/"
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1 p-1 text-[11px] font-bold whitespace-nowrap transition-colors",
            pathname === "/"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          )}
        >
          <Home className="h-6 w-6" />
          <span>Trang chủ</span>
        </Link>

        {/* Categories (Sheet) */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex w-full flex-col items-center justify-center gap-1 p-1 text-[11px] font-bold whitespace-nowrap transition-colors",
                open
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              )}
            >
              <Menu className="h-6 w-6" />
              <span>Danh mục</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="dark:bg-neutral-900">
            <SheetHeader className="text-left">
              <SheetTitle>Danh mục sản phẩm</SheetTitle>
            </SheetHeader>
            <div className="grid max-h-[60vh] grid-cols-2 gap-3 overflow-y-auto p-1">
              {isLoading ? (
                <div className="col-span-2 flex justify-center py-8">
                  <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-gray-500">
                  <p>Không có danh mục nào.</p>
                </div>
              ) : (
                categories.map((cat) => (
                  <SheetClose key={cat.id} asChild>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className="group flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-4 text-center transition-all hover:border-blue-200 hover:bg-blue-50 active:scale-95 dark:border-neutral-800 dark:bg-neutral-800 dark:hover:border-blue-900 dark:hover:bg-neutral-700"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-400">
                        {cat.name}
                      </span>
                    </Link>
                  </SheetClose>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Products */}
        <Link
          href="/products"
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1 p-1 text-[11px] font-bold whitespace-nowrap transition-colors",
            pathname === "/products"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          )}
        >
          <Box className="h-6 w-6" />
          <span>Sản phẩm</span>
        </Link>

        {/* Store Info */}
        <Link
          href="/store-info"
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1 p-1 text-[11px] font-bold whitespace-nowrap transition-colors",
            pathname === "/store-info"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          )}
        >
          <Store className="h-6 w-6" />
          <span>Cửa hàng</span>
        </Link>

        {/* Account (Sheet) */}
        <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex w-full flex-col items-center justify-center gap-1 p-1 text-[11px] font-bold whitespace-nowrap transition-colors",
                accountOpen
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              )}
            >
              {status === "loading" ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <User className="h-6 w-6" />
              )}
              <span>{status === "authenticated" ? "Tôi" : "Tài khoản"}</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="rounded-t-[20px] px-0 pb-8 dark:bg-neutral-900"
          >
            <SheetHeader className="border-b border-gray-100 px-6 pb-4 text-left dark:border-neutral-800">
              <SheetTitle>Tài khoản</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-2 p-4">
              {status === "loading" ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : status === "authenticated" ? (
                <>
                  {/* User Profile Card */}
                  <div className="mb-2 flex items-center gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-neutral-800">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <span className="text-lg font-bold">
                        {session.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {session.user?.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {session.user?.email}
                      </span>
                    </div>
                  </div>

                  {/* Smart Actions */}
                  <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                    {session?.user?.role === "admin" ? (
                      <SheetClose asChild>
                        <Link
                          href="/admin/product-management"
                          className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                              <LayoutDashboard size={18} />
                            </div>
                            <span className="font-medium">
                              Quản lý sản phẩm
                            </span>
                          </div>
                          <ChevronRight size={18} className="text-gray-400" />
                        </Link>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                        <Link
                          href="/profile"
                          className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                              <User size={18} />
                            </div>
                            <span className="font-medium">Hồ sơ cá nhân</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-400" />
                        </Link>
                      </SheetClose>
                    )}

                    <div className="h-[1px] bg-gray-100 dark:bg-neutral-800" />
                  </div>

                  <button
                    onClick={() => {
                      setAccountOpen(false);
                      signOut({ callbackUrl: window.location.origin });
                      toast.success("Đăng xuất thành công");
                    }}
                    className="transition-active mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 p-4 font-medium text-red-600 active:scale-95 dark:bg-red-900/10 dark:text-red-400"
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>
                </>
              ) : (
                // Unauthenticated State
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl bg-blue-50 p-6 text-center dark:bg-blue-900/10">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <User size={32} />
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-gray-900 dark:text-gray-100">
                      Chào bạn!
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Đăng nhập để quản lý đơn hàng và nhận ưu đãi riêng.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <SheetClose asChild>
                      <Link
                        href="/auth/register"
                        className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 p-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800"
                      >
                        <UserPlus size={18} />
                        Đăng ký
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        href="/auth/login"
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 p-3 font-medium text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95"
                      >
                        <LogIn size={18} />
                        Đăng nhập
                      </Link>
                    </SheetClose>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
