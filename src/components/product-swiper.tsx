"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface Props {
  title: string;
  products: Product[];
}

export default function ProductSwiper({ title, products }: Props) {
  if (!products?.length) return null;

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
        {products.map((p) => (
          <SwiperSlide key={p._id} className="px-1 sm:px-2 lg:px-3">
            {/* ----- LINK ----- */}
            <Link
              href={`/products/${p._id}`} // ← đường dẫn chi tiết
              className="group flex h-60 flex-col rounded-xl border bg-white p-3 shadow-sm transition hover:shadow-md sm:h-80"
            >
              {/* Ảnh */}
              <div className="relative aspect-square w-full overflow-hidden rounded-md">
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  loading="lazy"
                  sizes="(max-width:1024px) 50vw, 260px"
                  className="object-contain duration-300"
                />
              </div>

              {/* Thông tin */}
              <div className="mt-3 flex flex-grow flex-col">
                <h3 className="line-clamp-2 text-[15px] font-semibold text-gray-800 group-hover:text-blue-600">
                  {p.name}
                </h3>
                <p className="mt-auto text-lg font-bold text-[#EE4D2D]">
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
