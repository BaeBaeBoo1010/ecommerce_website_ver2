import { Suspense } from "react";
import ProductListClient from "@/components/product-list-client";
import Loading from "@/components/loading";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description: "Khám phá bộ sưu tập thiết bị điện, thiết bị thông minh đa dạng với giá tốt nhất. Sản phẩm chất lượng cao, đảm bảo chính hãng.",
  keywords: ["thiết bị điện", "sản phẩm", "thiết bị thông minh", "smart home", "điện dân dụng"],
  openGraph: {
    title: "Sản phẩm | Thiết bị điện Quang Minh",
    description: "Khám phá bộ sưu tập thiết bị điện, thiết bị thông minh đa dạng với giá tốt nhất.",
    url: `${siteUrl}/products`,
    type: "website",
    locale: "vi_VN",
    images: [
      {
        url: `${siteUrl}/images/logo.webp`,
        width: 1200,
        height: 630,
        alt: "Sản phẩm thiết bị điện",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sản phẩm | Thiết bị điện Quang Minh",
    description: "Khám phá bộ sưu tập thiết bị điện, thiết bị thông minh đa dạng với giá tốt nhất.",
  },
  alternates: {
    canonical: `${siteUrl}/products`,
  },
};

export default async function ProductsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductListClient  />
    </Suspense>
  );
}
