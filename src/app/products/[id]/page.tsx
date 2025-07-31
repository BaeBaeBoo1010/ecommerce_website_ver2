import ProductDetail from "@/components/product-detail"
import { notFound } from "next/navigation"
import { headers } from "next/headers"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (!id) return notFound()

  const headersList = await headers()
  const host = headersList.get("x-forwarded-host") || "localhost:3000"
  const isLocalhost = host.includes("localhost") || host.startsWith("127.");
  const protocol = isLocalhost ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/products/${id}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) return notFound()

  const product = await res.json()

  return <ProductDetail product={product} />
}
