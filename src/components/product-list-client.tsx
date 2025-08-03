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

const fetcher = async (url: string) => {
  const cacheKey = `products-cache:${url}`;
  if (!navigator.onLine) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    return { data: [], total: 0 };
  }
  const res = await fetch(url);
  const data = await res.json();
  localStorage.setItem(cacheKey, JSON.stringify(data));
  return data;
};

export default function ProductListClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categorySlug = searchParams.get("category") ?? "all";
  const rawSearchQuery = searchParams.get("search")?.toLowerCase().trim() || "";
  const searchQuery = useDebounce(rawSearchQuery, 300);
  const pageParam = Number(searchParams.get("page"));
  const currentPage = Number.isNaN(pageParam) ? 1 : Math.max(1, pageParam);

  const [categories, setCategories] = useState<Category[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("none");

  const apiUrl = `/api/products?category=${categorySlug}&page=${currentPage}&limit=${PRODUCTS_PER_PAGE}`;

  const fallbackData =
    typeof window === "undefined"
      ? { data: [], total: 0 }
      : (() => {
          try {
            return JSON.parse(
              localStorage.getItem(`products-cache:${apiUrl}`) ||
                '{"data":[],"total":0}',
            );
          } catch {
            return { data: [], total: 0 };
          }
        })();

  const { data, isLoading } = useSWR<{ data: Product[]; total: number }>(
    apiUrl,
    fetcher,
    {
      fallbackData,
      dedupingInterval: 10_000,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (data) {
      localStorage.setItem(`products-cache:${apiUrl}`, JSON.stringify(data));
    }
  }, [data, apiUrl]);

  const products = useMemo(() => data?.data || [], [data]);
  const totalItems = useMemo(() => data?.total || 0, [data]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error("Lỗi load category:", err));
  }, []);

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

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    if (sortOption === "priceAsc")
      return sorted.sort((a, b) => a.price - b.price);
    if (sortOption === "priceDesc")
      return sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [filteredProducts, sortOption]);

  const currentCategory = categories.find((cat) => cat.slug === categorySlug);
  const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);

  const updateParam = useCallback(
    (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      void (value ? params.set(key, value) : params.delete(key));
      if (key !== "page") params.set("page", "1");
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router],
  );

  const handleCategoryChange = (slug: string) =>
    updateParam("category", slug === "all" ? undefined : slug);
  const handlePageChange = (page: number) =>
    updateParam("page", page.toString());

  return (
    <div className="mx-auto mt-10 mb-20 max-w-7xl px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          {searchQuery
            ? "Kết quả tìm kiếm"
            : categorySlug === "all"
              ? "Tất cả sản phẩm"
              : currentCategory?.name || "Sản phẩm"}
        </h1>

        <div className="flex flex-wrap gap-3">
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

      <div className="grid min-h-[200px] grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : sortedProducts.length === 0 ? (
          <p className="col-span-full text-center">Không có sản phẩm nào.</p>
        ) : (
          sortedProducts.map((p) => <ProductCard key={p._id} product={p} />)
        )}
      </div>

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
