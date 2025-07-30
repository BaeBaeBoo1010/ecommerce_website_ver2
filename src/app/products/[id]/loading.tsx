// app/products/[id]/loading.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 p-4 md:grid-cols-2">
      {/* Skeleton cho hình ảnh */}
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full rounded-xl" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-20 rounded-md" />
          ))}
        </div>
      </div>

      {/* Skeleton cho thông tin sản phẩm */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" /> {/* Tên sản phẩm */}
        <Skeleton className="h-8 w-1/3" /> {/* Giá */}
        <Skeleton className="h-24 w-full" /> {/* Mô tả */}
        <Skeleton className="h-10 w-1/2" /> {/* Selector */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" /> {/* Nút mua */}
          <Skeleton className="h-10 w-32" /> {/* Nút thêm giỏ */}
        </div>
      </div>
    </div>
  );
}
