// app/products/[id]/page.tsx
"use client";

import { useSWRConfig } from "swr";
import useSWR from "swr";
import ProductDetail from "@/components/product-detail";
import type { Product } from "@/types/product";
import Loading from "@/components/loading";
import { useEffect, useState } from "react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState<string | null>(null);
  const { cache } = useSWRConfig();

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  const cachedProducts = cache.get("/api/products");
  const cachedProduct = cachedProducts?.data?.find(
    (p: Product) => p._id === id,
  );

  const { data: product } = useSWR<Product>(
    cachedProduct || !id ? null : `/api/products/${id}`, // chỉ fetch nếu chưa có và có id
    (url) => fetch(url).then((res) => res.json()),
    { fallbackData: cachedProduct },
  );

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | Thiết bị điện Quang Minh`;
    }
  }, [product]);

  if (!id || !product) return <Loading />;

  return <ProductDetail product={product} />;
}
