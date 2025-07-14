import { Suspense } from "react";
import ProductListClient from "@/components/product-list-client";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-4">Đang tải sản phẩm...</div>}>
      <ProductListClient />
    </Suspense>
  );
}
