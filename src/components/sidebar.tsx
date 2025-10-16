"use client";

import { useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, Home, Box, Info, Phone } from "lucide-react";
import type { Product, Category } from "@/types/product";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MobileSidebar() {
  const { data: products = [], isLoading } = useSWR<Product[]>(
    "/api/products",
    fetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  // Lấy danh sách category duy nhất từ products
  const categories: Category[] = useMemo(() => {
    const map = new Map<string, Category>();
    products.forEach((p) => {
      if (p.category?._id && !map.has(p.category._id)) {
        map.set(p.category._id, p.category);
      }
    });
    return Array.from(map.values());
  }, [products]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Mở menu"
          className="mx-2 flex cursor-pointer items-center rounded-lg p-2 transition hover:bg-gray-100 active:bg-gray-200 lg:hidden dark:hover:bg-neutral-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-72 flex-col bg-white px-0 pt-4 pb-6 dark:bg-neutral-900"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-lg font-semibold tracking-wide">
            Menu
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col overflow-y-auto px-6">
          {[
            { href: "/", label: "Trang chủ", icon: Home },
            { href: "/products", label: "Sản phẩm", icon: Box },
            { href: "/introduction", label: "Giới thiệu", icon: Info },
            { href: "/contact", label: "Liên hệ", icon: Phone },
          ].map(({ href, label, icon: Icon }) => (
            <SheetClose asChild key={href}>
              <Link
                href={href}
                className="mb-2 flex items-center gap-3 rounded-md px-3 py-2 text-[15px] font-medium text-gray-700 transition hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-neutral-800"
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            </SheetClose>
          ))}

          <div className="my-3 border-t border-gray-200 dark:border-neutral-700" />

          <p className="mb-2 px-1 text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400">
            DANH MỤC SẢN PHẨM
          </p>

          {isLoading ? (
            <div className="flex items-center gap-2 px-1 text-sm text-gray-500">
              <Menu className="h-4 w-4 animate-spin" /> Đang tải…
            </div>
          ) : categories.length === 0 ? (
            <span className="px-1 text-sm text-gray-500">
              Không có danh mục
            </span>
          ) : (
            categories.map((cat) => (
              <SheetClose asChild key={cat._id}>
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="mb-1 flex items-center rounded-md px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-neutral-800"
                >
                  {cat.name}
                </Link>
              </SheetClose>
            ))
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
