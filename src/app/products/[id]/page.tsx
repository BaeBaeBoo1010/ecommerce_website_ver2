// app/products/[id]/page.tsx
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import type { Metadata } from "next";
import type { Product as ProductType } from "@/types/product";
import ProductDetail from "@/components/product-detail";
import ProductDetailWrapper from "@/components/product-detail-wrapper";
import { headers } from "next/headers";
import { isbot } from "isbot";
import Script from "next/script";

export const revalidate = 120;

// ✅ Hàm check bot dùng isbot
async function isCrawler() {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  return isbot(userAgent);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const crawler = await isCrawler();

  if (!crawler) {
    return {
      title: "Thiết bị điện Quang Minh",
      description:
        "Xem chi tiết sản phẩm tại cửa hàng Thiết bị điện Quang Minh",
    };
  }

  await connectMongoDB();
  const { id } = await params;

  const product = (await Product.findById(id)
    .populate("category", "name slug")
    .lean()) as ProductType | null;

  if (!product) return { title: "Sản phẩm không tồn tại" };

  const title = `${product.name} - ${product.category?.name || "Sản phẩm"}`;
  const description =
    product.description?.slice(0, 160) ||
    `Mua ${product.name} với giá tốt nhất tại cửa hàng.`;
  const imageUrl = product.imageUrls?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    other: {
      "og:type": "product",
      "og:locale": "vi_VN",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const crawler = await isCrawler();

  if (crawler) {
    await connectMongoDB();
    const product = (await Product.findById(id)
      .populate("category", "name slug")
      .lean()) as ProductType | null;

    if (!product) return <div>Sản phẩm không tồn tại</div>;
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
        <ProductDetail product={product} />;
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        ;
      </>
    );
  }

  return <ProductDetailWrapper productId={id} />;
}
