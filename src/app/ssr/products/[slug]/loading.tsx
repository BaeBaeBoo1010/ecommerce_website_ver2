// app/ssr/products/[slug]/loading.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="mx-auto w-full max-w-7xl px-0 py-0 md:px-4 md:py-4">
        <div className="rounded-lg bg-white">
          <div className="flex flex-col lg:flex-row">
            {/* Image Gallery Skeleton */}
            <div className="flex items-center justify-center md:max-w-[600px] md:flex-1">
              <div className="w-full max-w-[600px]">
                {/* Main image */}
                <Skeleton className="h-[250px] w-full rounded-sm bg-gray-200 sm:h-[300px] md:h-[400px]" />

                {/* Thumbnails */}
                <div className="mt-2 flex justify-center gap-2 md:mt-4 md:gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-[30px] w-[30px] rounded-xl bg-gray-200 lg:h-[70px] lg:w-[70px]"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Product Info Skeleton */}
            <section className="flex flex-col justify-between p-6 md:flex-1">
              <div>
                {/* Product name */}
                <Skeleton className="mb-5 h-10 w-3/4 rounded bg-gray-200" />

                {/* Category */}
                <Skeleton className="mb-4 h-6 w-1/3 rounded bg-gray-200" />

                {/* Price */}
                <Skeleton className="mb-6 h-10 w-1/2 rounded bg-gray-200" />

                {/* Description lines */}
                <div className="mb-8 space-y-2">
                  <Skeleton className="h-4 w-full rounded bg-gray-200" />
                  <Skeleton className="h-4 w-5/6 rounded bg-gray-200" />
                  <Skeleton className="h-4 w-4/6 rounded bg-gray-200" />
                </div>

                {/* Quantity selector - desktop only */}
                <div className="hidden items-center gap-4 md:flex">
                  <Skeleton className="h-6 w-20 rounded bg-gray-200" />
                  <Skeleton className="h-10 w-40 rounded-lg bg-gray-200" />
                </div>
              </div>

              {/* Action buttons - desktop only */}
              <div className="mt-6 hidden flex-col gap-4 md:flex md:flex-row md:gap-6">
                <Skeleton className="h-14 flex-1 rounded-lg bg-gray-200" />
                <Skeleton className="h-14 flex-1 rounded-lg bg-gray-200" />
              </div>
            </section>
          </div>

          {/* Article section skeleton */}
          <section className="mt-2 min-h-[200px] rounded-lg bg-white p-6 shadow-sm">
            <Skeleton className="mb-4 h-8 w-1/3 rounded bg-gray-200" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded bg-gray-200" />
              <Skeleton className="h-4 w-full rounded bg-gray-200" />
              <Skeleton className="h-4 w-3/4 rounded bg-gray-200" />
            </div>
          </section>
        </div>
      </main>

      {/* Mobile action buttons skeleton */}
      <div className="fixed right-0 bottom-0 left-0 z-10 flex items-center justify-between gap-2 bg-white p-4 shadow-md md:hidden">
        <Skeleton className="h-12 flex-1 rounded-lg bg-gray-200" />
        <Skeleton className="h-12 flex-1 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
