"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, EffectFade } from "swiper/modules";
import { useState } from "react";
import { ShoppingCart, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Swiper as SwiperType } from "swiper";
import { Skeleton } from "@/components/ui/skeleton";

import "swiper/css";
import "swiper/css/thumbs";
import "swiper/css/effect-fade";

interface Props {
  isLoading?: boolean; // ← thêm prop
}

/* -------- DUMMY DATA (khi có dữ liệu thật hãy thay) -------- */
const product = {
  name: [
    "Thương hiệu",
    "Công Tắc Cảm Ứng Hiện Diện",
    "Công Tắc Điều Khiển Từ Xa",
  ],
  model: [null, "RKW-PS03BR", "RF15D-RM"],
  descriptions: [
    "Kawasan là thương hiệu hàng đầu chuyên cung cấp các giải pháp thiết bị điện thông minh, an toàn và tiện lợi cho mọi gia đình và doanh nghiệp. Với phương châm “Tự động – An toàn – An ninh – Tiết kiệm”, Kawasan không ngừng đổi mới công nghệ để mang đến những sản phẩm chất lượng cao như công tắc cảm ứng, cảm biến chuyển động, chuông cửa không dây, đèn năng lượng mặt trời và hệ thống nhà thông minh.",
    "Cảm ứng hiện diện KW-PS03BR chủ yếu dùng để lắp vào các bóng đèn, quạt, quạt hút, máy điều hòa, để tự động bật và duy trì khi có người hiện diện và tự tắt nguồn ngay (sau 30 giây) khi không còn ai hiện diện trong khu vực cảm ứng.",
    "Công tắc điều khiển từ xa RF15D-RM của Kawasan là thiết bị thông minh giúp điều khiển bật/tắt các thiết bị điện từ xa thông qua sóng RF 315MHz. Với khả năng tích hợp tối đa 10 remote, công suất chịu tải lên đến 1500W, và phạm vi điều khiển từ 100-300m, đây là giải pháp tiện lợi cho gia đình, văn phòng, nhà xưởng.",
  ],
  images: ["/images/intro.png", "/images/product1.png", "/images/product2.png"],
};

export default function Carousel({ isLoading }: Props) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /* ---------- SKELETON PLACEHOLDERS ---------- */
  const SkeletonTextBlock = () => (
    <div className="space-y-4 md:space-y-5">
      <Skeleton className="h-8 w-2/3 sm:h-9" />
      <Skeleton className="h-4 w-1/2 sm:h-5" />
      <Skeleton className="h-20 w-full sm:h-24" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-28 flex-shrink-0" />
        <Skeleton className="h-10 w-28 flex-shrink-0" />
      </div>
    </div>
  );

  const SkeletonImage = ({ large = false }: { large?: boolean }) => (
    <div
      className={`relative ${large ? "h-[250px] sm:h-[300px] md:h-[400px]" : "h-[30px] w-[30px] lg:h-[70px] lg:w-[70px]"} w-full overflow-hidden rounded-lg bg-gray-200`}
    />
  );

  return (
    <div className="w-full bg-white text-black">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-2 sm:px-6 sm:py-4 md:grid-cols-2">
        {/* ---------- TEXT CONTENT ---------- */}
        <div className="order-2 flex h-50 justify-center md:order-1 md:items-center">
          {isLoading ? (
            <SkeletonTextBlock />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 md:space-y-5"
              >
                <h1 className="flex justify-center text-2xl font-bold sm:text-3xl md:justify-start md:text-4xl">
                  {product.name[activeIndex]}
                </h1>

                {activeIndex !== 0 && (
                  <div className="flex items-center justify-center gap-2 text-base sm:text-lg md:justify-start">
                    <span className="rounded bg-gray-100 px-2 py-1 font-medium">
                      Model: {product.model[activeIndex]}
                    </span>
                  </div>
                )}

                <p
                  className={`text-[14px] text-gray-700 sm:text-lg ${
                    activeIndex === 0 ? "flex" : "hidden md:flex"
                  }`}
                >
                  {product.descriptions[activeIndex]}
                </p>

                {activeIndex !== 0 && (
                  <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
                    <button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white transition hover:scale-105 hover:bg-blue-700 active:scale-100 sm:text-base">
                      <ShoppingCart size={18} /> Thêm vào giỏ
                    </button>
                    <button className="inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-gray-100 px-4 py-2 text-sm transition hover:scale-105 hover:bg-gray-200 active:scale-100 sm:text-base">
                      <Info size={18} /> Thông tin
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* ---------- IMAGE SLIDER ---------- */}
        <div className="order-1 md:order-2">
          {isLoading ? (
            <>
              <SkeletonImage large />
              <div className="mt-4 flex justify-center gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonImage key={i} />
                ))}
              </div>
            </>
          ) : (
            <>
              <Swiper
                spaceBetween={10}
                slidesPerView={1}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                loop={true}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[Thumbs, EffectFade]}
                speed={500}
                className="mb-3 overflow-hidden rounded-lg"
              >
                {product.images.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative h-[250px] w-full cursor-grab active:cursor-grabbing sm:h-[300px] md:h-[400px]">
                      <Image
                        src={img}
                        alt={`Image ${idx}`}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-contain"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Thumbnails */}
              <div className="flex justify-center">
                <Swiper
                  onSwiper={setThumbsSwiper}
                  slidesPerView={3}
                  loop={false}
                  breakpoints={{
                    0: { spaceBetween: 4 },
                    640: { spaceBetween: 8 },
                    1024: { spaceBetween: 15 },
                  }}
                  className="mt-0 !overflow-visible md:mt-2"
                >
                  {product.images.map((img, idx) => (
                    <SwiperSlide key={idx} className="group !w-auto">
                      <div className="relative h-[30px] w-[30px] cursor-pointer overflow-hidden rounded-xl border-2 border-gray-300 opacity-50 transition-all duration-300 ease-in-out group-[.swiper-slide-thumb-active]:scale-110 group-[.swiper-slide-thumb-active]:border-gray-600 group-[.swiper-slide-thumb-active]:opacity-100 hover:opacity-100 lg:h-[70px] lg:w-[70px]">
                        <Image
                          src={img}
                          alt={`Thumb ${idx}`}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-contain"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


