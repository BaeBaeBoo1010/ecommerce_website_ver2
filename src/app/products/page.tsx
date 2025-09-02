import { Suspense } from "react";
import ProductListClient from "@/components/product-list-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sản phẩm | Thiết bị điện Quang Minh",
  description: "Xem tất cả sản phẩm mới nhất tại cửa hàng",
};

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductListClient />
    </Suspense>
  );
}
