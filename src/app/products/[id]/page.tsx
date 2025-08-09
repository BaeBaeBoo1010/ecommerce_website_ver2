// products/[id]/page.tsx
import { notFound } from "next/navigation";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import type { Metadata } from "next";
import ProductDetailWrapper from "@/components/product-detail-wrapper";
import type { Product as ProductType } from "@/types/product";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  await connectMongoDB();

  const { id } = await params; // ✅ Lấy id từ Promise
  const product = (await Product.findById(id)
    .populate("category", "name slug")
    .lean()) as ProductType | null;

  if (!product) {
    return { title: "Sản phẩm không tồn tại" };
  }

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
      type: "website", // TS hợp lệ
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    other: {
      "og:type": "product", // SEO vẫn là product
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connectMongoDB();

  const { id } = await params; // ✅ Lấy id từ Promise
  const product = await Product.findById(id).lean();

  if (!product) return notFound();

  return <ProductDetailWrapper product={JSON.parse(JSON.stringify(product))} />;
}

