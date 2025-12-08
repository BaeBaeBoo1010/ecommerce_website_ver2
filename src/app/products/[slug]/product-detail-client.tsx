"use client";

import { useEffect } from "react";
import useSWR from "swr";
import ProductDetail from "@/components/product-detail";
import Loading from "@/components/loading";
import type { Product } from "@/types/product";

export default function ProductDetailClient({ slug }: { slug: string }) {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Products đã có trong SWR fallback → không gọi API
  const { data: products } = useSWR<Product[]>("/api/products");

  const product = products?.find((p) => p.slug === slug);

  if (!product) return <Loading />;

  return <ProductDetail product={product} />;
}
