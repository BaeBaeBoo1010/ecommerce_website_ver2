// app/products/[id]/page.tsx
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
// import type { Metadata } from "next";
import type { Product as ProductType } from "@/types/product";
import ProductDetail from "@/components/product-detail";
import ProductDetailWrapper from "@/components/product-detail-wrapper";
import { headers } from "next/headers";

export const revalidate = 120;

// export async function generateMetadata({
//   params,
// }: {
//   params: Promise<{ id: string }>;
// }): Promise<Metadata> {
//   await connectMongoDB();
//   const { id } = await params;

//   const product = (await Product.findById(id)
//     .populate("category", "name slug")
//     .lean()) as ProductType | null;

//   if (!product) return { title: "Sản phẩm không tồn tại" };

//   const title = `${product.name} - ${product.category?.name || "Sản phẩm"}`;
//   const description =
//     product.description?.slice(0, 160) ||
//     `Mua ${product.name} với giá tốt nhất tại cửa hàng.`;
//   const imageUrl = product.imageUrls?.[0];

//   return {
//     title,
//     description,
//     openGraph: {
//       title,
//       description,
//       images: imageUrl ? [{ url: imageUrl }] : [],
//       type: "website",
//     },
//     twitter: {
//       card: "summary_large_image",
//       title,
//       description,
//       images: imageUrl ? [imageUrl] : [],
//     },
//     other: {
//       "og:type": "product",
//       "og:locale": "vi_VN",
//     },
//   };
// }

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ✅ Check bot Google chỉ 1 lần khi server render
  const userAgent = (await headers()).get("user-agent") || "";
  const isCrawler =
    /(googlebot|facebookexternalhit|facebookcatalog|tiktokbot|zalo|zbot)/i.test(
      userAgent,
    );


  if (isCrawler) {
    await connectMongoDB();
    const product = (await Product.findById(id)
      .populate("category", "name slug")
      .lean()) as ProductType | null;

    if (!product) return <div>Sản phẩm không tồn tại</div>;

    return <ProductDetail product={product} />;
  }

  return <ProductDetailWrapper productId={id} />;
}
