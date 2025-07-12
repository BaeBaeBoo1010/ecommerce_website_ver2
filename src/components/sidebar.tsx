"use client";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, Home, Box, Info, Phone } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useState } from "react";

export default function MobileSidebar() {
  const [categories, setCategories] = useState<
    { name: string; slug: string }[]
  >([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error("Lỗi load danh mục:", err));
  }, []);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="mx-2 flex cursor-pointer items-center rounded-2xl p-2 hover:bg-gray-100 active:bg-gray-200 lg:hidden">
          <Menu />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle className="text-left text-lg font-bold">Menu</SheetTitle>
        </SheetHeader>

        <nav className="mt-0 ml-5 flex flex-col space-y-4 overflow-scroll">
          <SheetClose asChild>
            <Link href="/" className="flex gap-2 text-base hover:underline">
              <Home />
              Trang chủ
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/products"
              className="flex gap-2 text-base hover:underline"
            >
              <Box />
              Sản phẩm
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/introduction"
              className="flex gap-2 text-base hover:underline"
            >
              <Info />
              Giới thiệu
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/contact"
              className="flex gap-2 text-base hover:underline"
            >
              <Phone />
              Liên hệ
            </Link>
          </SheetClose>
          <div className="mt-3 flex flex-col gap-2 border-t pt-3">
            <p className="text-muted-foreground mb-2 text-xs">
              DANH MỤC SẢN PHẨM
            </p>
            {categories.length === 0 ? (
              <SheetClose asChild>Không có danh mục</SheetClose>
            ) : (
              categories.map((cat) => (
                <SheetClose key={cat.slug} asChild>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="flex items-center gap-2 hover:underline"
                  >
                    {cat.name}
                  </Link>
                </SheetClose>
              ))
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
