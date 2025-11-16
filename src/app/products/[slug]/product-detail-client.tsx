"use client";

import { use } from "react";
import useSWR from "swr";
import ProductDetail from "@/components/product-detail";
import Loading from "@/components/loading";
import type { Product } from "@/types/product";

export default function ProductDetailClient({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  // Lấy danh sách sản phẩm từ SWR fallback đã set ở layout
  const { data: products } = useSWR<Product[]>("/api/products");

  const product = products?.find((p) => p.slug === slug);

  if (!product) return <Loading />;

  return <ProductDetail product={product} />;
}

