"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types/product";
import ProductCard from "@/components/product-card";
import { useDebounce } from "@/hooks/use-debounce";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

type SortOption = "none" | "priceAsc" | "priceDesc";
const PRODUCTS_PER_PAGE = 16;

/* ------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------*/
const fetcher = async (url: string) => {
  const cacheKey = `products-cache:${url}`;
  if (!navigator.onLine) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    return [];
  }
  const res = await fetch(url);
  const data = await res.json();
  localStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
};

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

/* ------------------------------------------------------------------
 * ProductListClient (default export)
 * ------------------------------------------------------------------*/
export default function ProductListClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search params
  const categorySlug = searchParams.get("category") ?? "all";
  const rawSearchQuery = searchParams.get("search")?.toLowerCase().trim() || "";
  const searchQuery = useDebounce(rawSearchQuery, 300);
  const pageParam = Number(searchParams.get("page"));
  const currentPage = Number.isNaN(pageParam) ? 1 : Math.max(1, pageParam);

  // Local state
  const [categories, setCategories] = useState<Category[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("none");

  // SWR
  const apiUrl =
    categorySlug === "all"
      ? "/api/products"
      : `/api/products?category=${categorySlug}`;

  const fallbackData =
    typeof window === "undefined"
      ? []
      : (() => {
          try {
            return JSON.parse(
              localStorage.getItem(`products-cache:${apiUrl}`) || "[]",
            );
          } catch {
            return [];
          }
        })();

  const { data: productsData, isLoading } = useSWR<Product[]>(apiUrl, fetcher, {
    fallbackData,
    dedupingInterval: 10_000,
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (productsData) {
      localStorage.setItem(
        `products-cache:${apiUrl}`,
        JSON.stringify(productsData),
      );
    }
  }, [productsData, apiUrl]);

  const products = useMemo(() => productsData || [], [productsData]);

  // Load categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error("Lỗi load category:", err));
  }, []);

  /* ------------------ Derive data ------------------ */
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const descMatch = p.description?.toLowerCase().includes(q);
      const catName = typeof p.category === "object" ? p.category.name : "";
      const catSlug = typeof p.category === "object" ? p.category.slug : "";
      const catMatch =
        catName.toLowerCase().includes(q) || catSlug.toLowerCase().includes(q);
      return nameMatch || descMatch || catMatch;
    });
  }, [products, searchQuery]);

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

  /* ------------------ Helpers ------------------ */
  const updateParam = useCallback(
    (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      value ? params.set(key, value) : params.delete(key);
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
  };

  /* ------------------ Render ------------------ */
  return (
    <div className="mx-auto mt-10 mb-20 max-w-7xl px-4">
      {/* Header & Filter */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          {searchQuery
            ? "Kết quả tìm kiếm"
            : categorySlug === "all"
              ? "Tất cả sản phẩm"
              : currentCategory?.name || "Sản phẩm"}
        </h1>

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
          // Skeleton layout
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : filteredProducts.length === 0 ? (
          <p className="col-span-full text-center">Không có sản phẩm nào.</p>
        ) : (
          paginatedProducts.map((p) => <ProductCard key={p._id} product={p} />)
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            « Trước
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                Math.abs(page - currentPage) <= 2 ||
                page === 1 ||
                page === totalPages,
            )
            .map((page, idx, arr) => {
              const prev = arr[idx - 1];
              const showDots = prev && page - prev > 1;
              return (
                <span key={page} className="flex items-center gap-1">
                  {showDots && <span className="px-1">…</span>}
                  <Button
                    variant={page === currentPage ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                </span>
              );
            })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau »
          </Button>
        </div>
      )}
    </div>
  );
}
