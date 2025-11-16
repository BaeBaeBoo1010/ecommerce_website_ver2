import { Suspense } from "react";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products";
import ProductDetailClient from "./product-detail-client";
import Loading from "@/components/loading";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại",
      description: "Không tìm thấy sản phẩm",
    };
  }

  const title = `${product.name}${product.category?.name ? ` - ${product.category.name}` : ""} | Thiết bị điện Quang Minh`;
  const description =
    product.description?.slice(0, 160) ||
    `Mua ${product.name} với giá tốt nhất tại cửa hàng thiết bị điện Quang Minh.`;
  const imageUrl = product.imageUrls?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/${slug}`,
      type: "website",
      locale: "vi_VN",
      siteName: "Thiết bị điện Quang Minh",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${siteUrl}/products/${slug}`,
    },
    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": "VND",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <ProductDetailClient params={params} />
    </Suspense>
  );
}
