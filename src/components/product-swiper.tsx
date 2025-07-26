"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import "swiper/css";
import "swiper/css/navigation";

export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface Props {
  title: string;
  slug: string; // ✅ slug được truyền từ phía cha
  products: Product[];
  isLoading?: boolean;
}

export default function ProductSwiper({
  title,
  slug,
  products,
  isLoading,
}: Props) {
  const skeletonCount = 4;
  const showSkeleton = isLoading || !products?.length;

  const limitedProducts = products?.slice(0, 12);

  const SkeletonCard = () => (
    <div className="flex h-64 flex-col rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <Skeleton className="relative aspect-square w-full rounded-lg" />
      <div className="mt-3 flex flex-grow flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="mt-auto h-6 w-1/2" />
      </div>
    </div>
  );

  if (!showSkeleton && !products?.length) return null;

  return (
    <section className="relative px-2 md:px-0">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">
          {title}
        </h2>
        <Link
          href={`/products?category=${slug}`}
          className="inline-flex items-center gap-1 rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
        >
          Xem tất cả
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation
        watchSlidesProgress
        spaceBetween={2}
        slidesPerView={1.5}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 10 },
          768: { slidesPerView: 2.5, spaceBetween: 14 },
          1024: { slidesPerView: 3.5, spaceBetween: 18 },
          1280: { slidesPerView: 4, spaceBetween: 20 },
        }}
        className="!overflow-hidden pb-6"
      >
        {showSkeleton
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <SwiperSlide key={`sk_${i}`} className="px-1 sm:px-2 lg:px-3">
                <SkeletonCard />
              </SwiperSlide>
            ))
          : limitedProducts.map((p) => (
              <SwiperSlide key={p._id} className="px-1 sm:px-2 lg:px-3">
                <Link
                  href={`/products/${p._id}`}
                  className="group flex h-64 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:h-96"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white">
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      loading="lazy"
                      sizes="(max-width:1024px) 50vw, 260px"
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="mt-3 flex flex-grow flex-col">
                    <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 sm:text-base">
                      {p.name}
                    </h3>
                    <p className="mt-auto text-base font-bold text-[#ee4d2d] sm:text-lg">
                      {p.price.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
      </Swiper>

      {/* Custom style Swiper buttons */}
      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          width: 48px;
          height: 48px;
          background-color: white;
          color: black;
          border-radius: 9999px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          top: 45%;
        }

        .swiper-button-next::after,
        .swiper-button-prev::after {
          font-size: 20px;
          font-weight: bold;
        }

        .swiper-button-disabled {
          display: none;
          pointer-events: none;
        }
      `}</style>
    </section>
  );
}
