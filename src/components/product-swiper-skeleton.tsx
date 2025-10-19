import { Skeleton } from "@/components/ui/skeleton";

export function ProductSwiperSkeleton() {
  const skeletonCount = 4;

  return (
    <section>
      {/* Tiêu đề & nút xem tất cả */}
      <div className="mb-2 flex items-center justify-between gap-2 sm:mb-4">
        <Skeleton className="h-7 w-48 sm:h-9 sm:w-64" />
        <Skeleton className="h-7 w-20 rounded-md sm:h-8 sm:w-28" />
      </div>

      {/* Dãy skeleton card mô phỏng Swiper */}
      <div className="flex gap-3 overflow-hidden sm:gap-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="flex h-64 w-[45%] flex-shrink-0 flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:w-[22%] md:w-[20%] lg:w-[18%]"
          >
            {/* Ảnh */}
            <Skeleton className="aspect-square w-full rounded-lg" />

            {/* Nội dung */}
            <div className="mt-3 flex flex-grow flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-auto h-6 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
