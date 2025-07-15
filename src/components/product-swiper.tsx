"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface Props {
  title: string;
  products: Product[];
  isLoading?: boolean; // truyền true khi đang fetch
}

export default function ProductSwiper({ title, products, isLoading }: Props) {
  const skeletonCount = 4; // số thẻ skeleton muốn hiển thị
  const showSkeleton = isLoading || !products?.length;

  /* --- Card Skeleton (nằm trong file) --- */
  const SkeletonCard = () => (
    <div className="flex h-64 flex-col rounded-2xl border border-gray-100 bg-white p-3">
      <Skeleton className="relative aspect-square w-full rounded-lg" />
      <div className="mt-3 flex flex-grow flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-auto h-6 w-1/2" />
      </div>
    </div>
  );

  // Nếu không có dữ liệu & không trong trạng thái loading thì ẩn hẳn section
  if (!showSkeleton && !products?.length) return null;

  return (
    <section>
      <h2 className="mb-5 text-2xl font-semibold">{title}</h2>

      <Swiper
        modules={[Navigation]}
        navigation
        watchSlidesProgress
        spaceBetween={2}
        slidesPerView={1.8}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 8 },
          768: { slidesPerView: 2.5, spaceBetween: 10 },
          1024: { slidesPerView: 3, spaceBetween: 12 },
          1280: { slidesPerView: 4, spaceBetween: 12 },
        }}
        className="!overflow-hidden pb-6"
      >
        {showSkeleton
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <SwiperSlide key={`sk_${i}`} className="px-1 sm:px-2 lg:px-3">
                <SkeletonCard />
              </SwiperSlide>
            ))
          : products.map((p) => (
              <SwiperSlide key={p._id} className="px-1 sm:px-2 lg:px-3">
                <Link
                  href={`/products/${p._id}`}
                  className="group flex h-64 flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition duration-200 hover:shadow-md sm:h-96"
                >
                  {/* Ảnh */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      loading="lazy"
                      sizes="(max-width:1024px) 50vw, 260px"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Thông tin */}
                  <div className="mt-3 flex flex-grow flex-col">
                    <h3 className="line-clamp-2 text-[16px] font-bold text-gray-800 transition-colors duration-200 group-hover:text-blue-600">
                      {p.name}
                    </h3>
                    <p className="mt-auto text-lg font-bold text-[#ee4d2d]">
                      {p.price.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
      </Swiper>
    </section>
  );
}
