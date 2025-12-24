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
import { useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems: cartCount } = useCart();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

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

        {/* Account */}
        <Link
          href={status === "authenticated" ? "/profile" : "/auth/login"}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1 p-1 text-[11px] font-bold whitespace-nowrap transition-colors",
            pathname === "/profile" || pathname === "/auth/login"
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
          )}
        >
          {status === "loading" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <User className="h-6 w-6" />
          )}
          <span>
            {status === "authenticated" && session?.user?.name
              ? session.user.name.split(" ").slice(-1).join(" ")
              : "Tài khoản"}
          </span>
        </Link>
      </div>
    </div>
  );
}
