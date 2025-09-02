"use client";

import { useSWRConfig } from "swr";
import useSWR from "swr";
import ProductDetail from "./product-detail";
import type { Product } from "@/types/product";
import Script from "next/script";
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

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.imageUrls,
    description: product.description,
    sku: product.productCode,
    brand: { "@type": "Brand", name: "Thiết bị điện Quang Minh" },
    offers: {
      "@type": "Offer",
      url: typeof window !== "undefined" ? window.location.href : "",
      priceCurrency: "VND",
      price: product.price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <>
      <ProductDetail product={product} />
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </>
  );
}
