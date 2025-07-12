  "use client";

  import { useEffect, useState } from "react";
  import { useRouter, useSearchParams } from "next/navigation";
  import useSWR from "swr";
  import ProductCard, { Product } from "@/components/product-card";

  interface Category {
    _id: string;
    name: string;
    slug: string;
  }

  type SortOption = "none" | "priceAsc" | "priceDesc";
  const PRODUCTS_PER_PAGE = 10;

  // ---------- Helpers ----------

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

  // ---------- Component ----------

  export default function ProductListPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const categorySlug = searchParams.get("category") ?? "all";
    const currentPage = parseInt(searchParams.get("page") ?? "1");

    const [categories, setCategories] = useState<Category[]>([]);
    const [sortOption, setSortOption] = useState<SortOption>("none");

    const apiUrl =
      categorySlug === "all"
        ? "/api/products"
        : `/api/products?category=${categorySlug}`;

    const { data: productsData, isLoading } = useSWR<Product[]>(apiUrl, fetcher);
    const products = productsData || [];

    useEffect(() => {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => setCategories(data.categories))
        .catch((err) => console.error("Lỗi load category:", err));
    }, []);

    const sortedProducts = sortProducts(products, sortOption);
    const paginatedProducts = paginate(sortedProducts, currentPage);
    const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);

    const currentCategory = categories.find((cat) => cat.slug === categorySlug);

    // ---------- Event Handlers ----------

    const updateParam = (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      value ? params.set(key, value) : params.delete(key);
      params.set("page", "1");
      router.push(`/products?${params.toString()}`);
    };

    const handleCategoryChange = (slug: string) => {
      updateParam("category", slug === "all" ? undefined : slug);
    };

    const handlePageChange = (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`/products?${params.toString()}`);
    };

    // ---------- Render ----------

    return (
      <div className="mx-auto mt-10 max-w-7xl px-4">
        {/* Header + Filter */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">
            {categorySlug === "all"
              ? "Tất cả sản phẩm"
              : currentCategory?.name || "Sản phẩm"}
          </h1>

          <div className="flex gap-2">
            <select
              value={categorySlug}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="cursor-pointer rounded border px-3 py-1 text-sm"
            >
              <option value="all">-- Tất cả danh mục --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="cursor-pointer rounded border px-3 py-1 text-sm"
            >
              <option value="none">-- Sắp xếp giá --</option>
              <option value="priceAsc">Giá thấp → cao</option>
              <option value="priceDesc">Giá cao → thấp</option>
            </select>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="grid min-h-[200px] grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[300px] animate-pulse rounded bg-gray-100"
              />
            ))
          ) : products.length === 0 ? (
            <p className="col-span-full text-center">Không có sản phẩm nào.</p>
          ) : (
            paginatedProducts.map((p) => <ProductCard key={p._id} product={p} />)
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            >
              « Trước
            </button>

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
                    {showDots && <span className="px-1">...</span>}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`rounded border px-3 py-1 text-sm ${
                        page === currentPage ? "bg-gray-200 font-bold" : ""
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded border px-3 py-1 text-sm disabled:opacity-50"
            >
              Sau »
            </button>
          </div>
        )}
      </div>
    );
  }
