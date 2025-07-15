import { Suspense } from "react";
import ProductListClient from "@/components/product-list-client";

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductListClient />
    </Suspense>
  );
}
