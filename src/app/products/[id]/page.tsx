import ProductDetail from "@/components/product-detail";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const headersList = await headers(); // ✅ await ở đây
  const host = headersList.get("x-forwarded-host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  if (!params?.id) return notFound();

  const res = await fetch(`${baseUrl}/api/products/${params.id}`, {
    cache: "no-store",
  });

  if (!res.ok) return notFound();

  const product = await res.json();

  return <ProductDetail product={product} />;
}
