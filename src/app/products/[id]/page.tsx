import ProductDetail from "@/components/product-detail"
import { notFound } from "next/navigation"
import { getProductById } from "@/lib/products";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);

  if (!product) return notFound();

  return <ProductDetail product={product} />;
}
