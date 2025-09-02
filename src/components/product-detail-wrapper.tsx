"use client";

import { useSWRConfig } from "swr";
import useSWR from "swr";
import ProductDetail from "./product-detail";
import type { Product } from "@/types/product";
import Loading from "@/components/loading"
import { useEffect } from "react";

export default function ProductDetailWrapper({
  productId,
}: {
  productId: string;
}) {
  const { cache } = useSWRConfig();
  const cachedProducts = cache.get("/api/products");
  const cachedProduct = cachedProducts?.data?.find(
    (p: Product) => p._id === productId,
  );

  const { data: product } = useSWR<Product>(
    cachedProduct ? null : `/api/products/${productId}`, // chỉ fetch nếu chưa có
    (url) => fetch(url).then((res) => res.json()),
    { fallbackData: cachedProduct },
  );

  useEffect(() => {
    if (product) {
      const title = `${product.name} | Thiết bị điện Quang Minh`;
      document.title = title;
    }
  }, [product]);

  if (!product) {
    return <Loading/>
  }

  return <ProductDetail product={product} />
}
