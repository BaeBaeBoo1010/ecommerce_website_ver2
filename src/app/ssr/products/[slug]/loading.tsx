// app/ssr/products/[slug]/loading.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Hình ảnh sản phẩm */}
        <div className="flex-1 space-y-4">
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <div className="flex justify-center gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-md" />
            ))}
          </div>
        </div>

        {/* Thông tin sản phẩm */}
        <div className="flex-1 space-y-6">
          {/* Tên sản phẩm */}
          <Skeleton className="h-10 w-3/4 rounded" />

          {/* Danh mục */}
          <Skeleton className="h-5 w-1/3 rounded" />

          {/* Giá */}
          <Skeleton className="h-10 w-1/2 rounded" />

          {/* Mô tả */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>

          {/* Selector số lượng */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-24 rounded" />
          </div>

          {/* Nút hành động */}
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-12 w-40 rounded-lg" />
            <Skeleton className="h-12 w-40 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

