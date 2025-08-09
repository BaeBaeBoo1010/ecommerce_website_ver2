// components/product-detail-wrapper.tsx
"use client";

import { useSWRConfig } from "swr";
import ProductDetail from "./product-detail";
import type { Product } from "@/types/product";
import Script from "next/script";

export default function ProductDetailWrapper({
  product: initialProduct,
}: {
  product: Product;
}) {
  const { cache } = useSWRConfig();
  const cachedProducts = cache.get("/api/products");
  const product =
    cachedProducts?.data?.find((p: Product) => p._id === initialProduct._id) ||
    initialProduct;

  const schemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.imageUrls,
    description: product.description,
    sku: product.productCode,
    brand: {
      "@type": "Brand",
      name: "Tên thương hiệu của bạn",
    },
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
