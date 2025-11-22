"use client";

import { Suspense, useEffect } from "react";
import ProductDetailClient from "./product-detail-client";
import Loading from "@/components/loading";
import useSWR, { useSWRConfig } from "swr";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const { slug } = useParams() as { slug: string };
  const { cache } = useSWRConfig();

  // Lấy products từ SWR - với fallback từ layout, data sẽ có ngay lập tức
  const { data: products } = useSWR("/api/products", {
    fallbackData: cache.get("/api/products")?.data,
  });

  // Set title ngay khi có products, không chờ useEffect
  useEffect(() => {
    if (!products) return;

    const product = products.find((p: { slug: string }) => p.slug === slug);

    if (!product) {
      document.title = "Sản phẩm không tồn tại | Thiết bị điện Quang Minh";

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", "Không tìm thấy sản phẩm");

      return;
    }

    const title = `${product.name}${
      product.category?.name ? ` - ${product.category.name}` : ""
    } | Thiết bị điện Quang Minh`;

    const description =
      product.description?.slice(0, 160) ||
      `Mua ${product.name} với giá tốt nhất tại cửa hàng thiết bị điện Quang Minh.`;

    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description);

    const imageUrl = product.imageUrls?.[0];
    if (imageUrl) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute("content", imageUrl);
    }
  }, [products, slug]);

  return (
    <Suspense fallback={<Loading />}>
      <ProductDetailClient slug={slug} />
    </Suspense>
  );
}
