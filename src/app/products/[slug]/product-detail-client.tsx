"use client";

import { useEffect } from "react";
import ProductDetail from "@/components/product-detail";
import type { Product } from "@/types/product";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product.slug]);

  return <ProductDetail product={product} />;
}
