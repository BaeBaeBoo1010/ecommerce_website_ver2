/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, EffectFade, Autoplay } from "swiper/modules";
import { useState, useRef, useEffect } from "react";
import { ShoppingCart, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Swiper as SwiperType } from "swiper";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/types/product";
import Link from "next/link";
import { toast } from "sonner";

interface Props {
  products: Product[];
  isLoading?: boolean;
}

export default function Carousel({ products, isLoading }: Props) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);

  // Cache 5 phút trong localStorage
  useEffect(() => {
    if (!products || products.length === 0) return;

    const key = "carousel_random_products";
    const cache = localStorage.getItem(key);

    const newHash = JSON.stringify(products.map((p) => p._id)).slice(0, 1000); // hash đơn giản

    if (cache) {
      try {
        const parsed = JSON.parse(cache);
        if (
          Date.now() - parsed.timestamp < 5 * 60 * 1000 &&
          parsed.hash === newHash
        ) {
          setRandomProducts(parsed.products);
          return;
        }
      } catch {}
    }

    const random = [...products].sort(() => Math.random() - 0.5).slice(0, 5);
    setRandomProducts(random);
    localStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        products: random,
        hash: newHash,
      }),
    );
  }, [products]);

  const slides = [
    {
      type: "intro",
      title: "Thương hiệu Kawasan",
      category: null,
      description:
        "Kawasan là thương hiệu hàng đầu chuyên cung cấp các giải pháp thiết bị điện thông minh, an toàn và tiện lợi cho mọi gia đình và doanh nghiệp. Với phương châm “Tự động – An toàn – An ninh – Tiết kiệm”, Kawasan không ngừng đổi mới công nghệ để mang đến những sản phẩm chất lượng cao như công tắc cảm ứng, cảm biến chuyển động, chuông cửa không dây, đèn năng lượng mặt trời và hệ thống nhà thông minh.",
      image: "/images/intro.png",
    },
    ...randomProducts.map((p) => ({
      type: "product" as const,
      title: p.name,
      category: p.category?.name,
      categorySlug: p.category?.slug,
      productId: p._id,
      productSlug: p.slug,
      description: p.description,
      image: p.imageUrls?.[0],
    })),
  ];

  const loading = isLoading || !randomProducts.length;

  /* ---------- SKELETON ---------- */
  const SkeletonTextBlock = () => (
    <div className="w-full space-y-5 md:space-y-6">
      <Skeleton className="h-8 w-3/4 sm:h-9 md:h-10" />
      <Skeleton className="h-5 w-1/3 sm:h-6" />
      <Skeleton className="h-20 w-full sm:h-24 md:h-28" />
      <div className="flex flex-wrap gap-3 pt-2">
        <Skeleton className="h-10 w-28 sm:h-11 sm:w-32" />
        <Skeleton className="h-10 w-28 sm:h-11 sm:w-32" />
      </div>
    </div>
  );

  const SkeletonImage = ({ large = false }: { large?: boolean }) => (
    <div
      className={`relative overflow-hidden rounded-lg bg-gray-200 shadow-sm ${
        large
          ? "h-[250px] w-full sm:h-[300px] md:h-[400px]"
          : "h-[35px] w-[35px] sm:h-[50px] sm:w-[50px] lg:h-[70px] lg:w-[70px]"
      }`}
    >
      <Skeleton className="absolute inset-0" />
    </div>
  );

  return (
    <div className="w-full bg-white text-black">
      <div
        onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
        onMouseLeave={() => swiperRef.current?.autoplay?.start()}
        className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-2 pb-10 sm:px-6 md:grid-cols-2"
      >
        {/* ---------- TEXT ---------- */}
        <div className="order-2 flex justify-center md:order-1 md:items-center">
          {loading ? (
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
                <h1 className="text-center text-2xl font-bold sm:text-3xl md:text-left md:text-4xl">
                  {slides[activeIndex].title}
                </h1>

                {slides[activeIndex].category && (
                  <p className="mb-4 flex justify-center text-sm text-gray-500 sm:inline-block">
                    <span className="hidden sm:inline">Danh mục: </span>
                    <Link
                      href={`/products?category=${slides[activeIndex].categorySlug}&page=1`}
                      className="cursor-pointer rounded-lg bg-gray-200 p-2 font-medium transition-all hover:text-blue-500"
                    >
                      {slides[activeIndex].category}
                    </Link>
                  </p>
                )}

                <p
                  className={`text-[14px] text-gray-700 sm:text-lg ${
                    slides[activeIndex].type === "intro"
                      ? "flex"
                      : "hidden md:flex"
                  }`}
                >
                  {slides[activeIndex].description}
                </p>

                {slides[activeIndex].type === "product" && (
                  <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
                    <button
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition duration-80 hover:scale-103 hover:bg-blue-500 active:scale-100 active:bg-blue-700 sm:text-base"
                      onClick={() =>
                        toast.success("Đã thêm 1 sản phẩm vào giỏ hàng")
                      }
                    >
                      <ShoppingCart size={18} /> Thêm vào giỏ
                    </button>

                    <Link
                      href={`/products/${(slides[activeIndex] as any).productSlug}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm transition hover:scale-103 hover:bg-gray-200 active:scale-100 active:opacity-80 sm:text-base"
                    >
                      <Info size={18} /> Thông tin
                    </Link>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* ---------- IMAGE SLIDER ---------- */}
        <div className="order-1 md:order-2">
          {loading ? (
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
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  setActiveIndex(swiper.realIndex);
                }}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                spaceBetween={10}
                slidesPerView={1}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                loop
                thumbs={{ swiper: thumbsSwiper }}
                modules={[Thumbs, EffectFade, Autoplay]}
                autoplay={{ delay: 5000, disableOnInteraction: true }}
                speed={500}
                className="mb-3 cursor-grab overflow-hidden rounded-lg active:cursor-grabbing"
              >
                {slides.map((item, idx) => (
                  <SwiperSlide key={idx}>
                    <div className="relative h-[250px] sm:h-[300px] md:h-[400px]">
                      <Image
                        src={item.image || "/images/placeholder.svg"}
                        alt={`Image ${idx}`}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-contain"
                        priority
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Thumbnails */}
              <div className="flex justify-center">
                <Swiper
                  onSwiper={setThumbsSwiper}
                  slidesPerView={6}
                  loop={false}
                  breakpoints={{
                    0: { spaceBetween: 4 },
                    640: { spaceBetween: 8 },
                    1024: { spaceBetween: 15 },
                  }}
                  className="mt-0 !overflow-visible md:mt-2"
                >
                  {slides.map((item, idx) => (
                    <SwiperSlide key={idx} className="group !w-auto">
                      <div className="relative h-[30px] w-[30px] cursor-pointer overflow-hidden rounded-xl border-2 border-gray-300 opacity-50 transition-all duration-300 ease-in-out group-[.swiper-slide-thumb-active]:scale-110 group-[.swiper-slide-thumb-active]:border-gray-600 group-[.swiper-slide-thumb-active]:opacity-100 hover:opacity-100 lg:h-[70px] lg:w-[70px]">
                        <Image
                          src={item.image || "/images/placeholder.svg"}
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
