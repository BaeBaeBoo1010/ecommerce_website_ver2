"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, Category } from "@/types/product";
import ProductCard from "@/components/product-card";
import Link from "next/link";
import { Package } from "lucide-react";

type SortOption = "none" | "priceAsc" | "priceDesc";
const PRODUCTS_PER_PAGE = 16;

/* ----------------- Helpers ----------------- */
const sortProducts = (products: Product[], sort: SortOption) => {
  const sorted = [...products];
  if (sort === "priceAsc") return sorted.sort((a, b) => a.price - b.price);
  if (sort === "priceDesc") return sorted.sort((a, b) => b.price - a.price);
  return sorted;
};

const paginate = (products: Product[], page: number) => {
  const start = (page - 1) * PRODUCTS_PER_PAGE;
  return products.slice(start, start + PRODUCTS_PER_PAGE);
};

export default function ProductListClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { fallback } = useSWRConfig();

  // Params
  const categorySlug = searchParams.get("category") ?? "all";
  const searchQuery = searchParams.get("search")?.toLowerCase().trim() || "";
  const pageParam = Number(searchParams.get("page"));
  const currentPage = Number.isNaN(pageParam) ? 1 : Math.max(1, pageParam);

  // State
  const [sortOption, setSortOption] = useState<SortOption>("none");

  // Lấy data từ SWR cache đã được inject ở layout
  const { data: productsData, isLoading } = useSWR<Product[]>("/api/products", {
    fallbackData: fallback["/api/products"],
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const products = useMemo(() => productsData || [], [productsData]);

  // Lấy categories từ products
  const categories: Category[] = useMemo(() => {
    const seen = new Map<string, Category>();
    products.forEach((p) => {
      if (p.category && typeof p.category === "object") {
        seen.set(p.category._id, p.category);
      }
    });
    return Array.from(seen.values());
  }, [products]);

  /* ----------------- Derive data ----------------- */
  const filteredProducts = useMemo(() => {
    let list = products;
    if (categorySlug !== "all") {
      list = list.filter(
        (p) =>
          typeof p.category === "object" && p.category.slug === categorySlug,
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const catName = typeof p.category === "object" ? p.category.name : "";
        const catSlug = typeof p.category === "object" ? p.category.slug : "";
        const catMatch =
          catName.toLowerCase().includes(q) ||
          catSlug.toLowerCase().includes(q);
        return nameMatch || descMatch || catMatch;
      });
    }
    return list;
  }, [products, categorySlug, searchQuery]);

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sortOption),
    [filteredProducts, sortOption],
  );

  const paginatedProducts = useMemo(
    () => paginate(sortedProducts, currentPage),
    [sortedProducts, currentPage],
  );

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const currentCategory = categories.find((cat) => cat.slug === categorySlug);

  /* ----------------- Helpers ----------------- */
  const updateParam = useCallback(
    (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router],
  );

  const handleCategoryChange = (slug: string) =>
    updateParam("category", slug === "all" ? undefined : slug);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/products?${params.toString()}`);

    // Đợi router render rồi mới scroll
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 150);
  };


  /* ----------------- Render ----------------- */
  return (
    <div className="mx-auto mt-10 mb-20 max-w-7xl px-4">
      {/* Header & Filter */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">
            {searchQuery
              ? `Kết quả tìm kiếm của "${searchQuery}"`
              : categorySlug === "all"
                ? "Tất cả sản phẩm"
                : currentCategory?.name || "Sản phẩm"}
          </h1>

          {/* Nút "Xem tất cả sản phẩm" chỉ khi đang search */}
          {searchQuery && (
            <Link
              href="/products"
              className="inline-flex items-center gap-1 rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
            >
              Xem tất cả sản phẩm
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Danh mục */}
          <Select value={categorySlug} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">-- Tất cả danh mục --</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sắp xếp */}
          <Select
            value={sortOption}
            onValueChange={(val) => setSortOption(val as SortOption)}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sắp xếp giá" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Sắp xếp giá --</SelectItem>
              <SelectItem value="priceAsc">Giá thấp → cao</SelectItem>
              <SelectItem value="priceDesc">Giá cao → thấp</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid sản phẩm */}
      <div className="grid min-h-[200px] grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-4 py-20">
            <div className="bg-muted rounded-full p-6">
              <Package className="text-muted-foreground h-12 w-12" />
            </div>
            <div className="text-center">
              <p className="text-foreground text-lg font-medium">
                Không tìm thấy sản phẩm
              </p>
              <p className="text-muted-foreground text-sm">
                Thử thay đổi bộ lọc hoặc tìm kiếm sản phẩm khác
              </p>
            </div>
          </div>
        ) : (
          paginatedProducts.map((p) => <ProductCard key={p.slug} product={p} />)
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 pt-10 sm:flex-row sm:justify-between">
          <p className="text-muted-foreground text-sm">
            Trang {currentPage} / {totalPages} • Hiển thị{" "}
            {paginatedProducts.length} / {filteredProducts.length} sản phẩm
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="gap-1 transition-all hover:shadow-sm disabled:opacity-50"
            >
              ← Trước
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNum)}
                    className="h-9 w-9 p-0 transition-all hover:shadow-sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="gap-1 transition-all hover:shadow-sm disabled:opacity-50"
            >
              Sau →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
