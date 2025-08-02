import ProductDetail from "@/components/product-detail"
import { notFound } from "next/navigation"
import { getProductById } from "@/lib/products";

export default async function ProductDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const product = await getProductById(params.id);

  if (!product) return notFound();

  return <ProductDetail product={product} />;
}
