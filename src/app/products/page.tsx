import { Suspense } from "react";
import ProductListClient from "@/components/product-list-client";
import Loading from "@/components/loading";
import type { Metadata } from "next";
import { getAllProducts } from "@/lib/product-service";
import { unstable_cache } from "next/cache";

// Force dynamic rendering to ensure fresh data (cached via unstable_cache)
export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.me";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description:
    "Khám phá bộ sưu tập thiết bị cảm ứng, thiết bị thông minh đa dạng với giá tốt nhất. Sản phẩm chất lượng cao, đảm bảo chính hãng.",
  keywords: [
    "thiết bị điện",
    "sản phẩm",
    "thiết bị thông minh",
    "smart home",
    "điện dân dụng",
  ],
  openGraph: {
    title: "Sản phẩm | Thiết bị cảm ứng Quang Minh",
    description:
      "Khám phá bộ sưu tập thiết bị cảm ứng, thiết bị thông minh đa dạng với giá tốt nhất.",
    url: `${siteUrl}/products`,
    type: "website",
    locale: "vi_VN",
    images: [
      {
        url: `${siteUrl}/images/logo.webp`,
        width: 1200,
        height: 630,
        alt: "Sản phẩm thiết bị cảm ứng",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sản phẩm | Thiết bị cảm ứng Quang Minh",
    description:
      "Khám phá bộ sưu tập thiết bị cảm ứng, thiết bị thông minh đa dạng với giá tốt nhất.",
  },
  alternates: {
    canonical: `${siteUrl}/products`,
  },
};

export default async function ProductsPage() {
  const getCachedProducts = unstable_cache(
    async () => getAllProducts(),
    ["public-products-list"],
    { tags: ["products"], revalidate: 60 },
  );

  const products = await getCachedProducts();

  return (
    <Suspense fallback={<Loading />}>
      <ProductListClient initialProducts={products} />
    </Suspense>
  );
}
