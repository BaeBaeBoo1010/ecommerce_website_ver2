"use client";

import dynamic from "next/dynamic";
import Carousel from "@/components/carousel";
import { ProductSwiperSkeleton } from "@/components/product-swiper-skeleton";
import type { CategoryWithProducts } from "@/types/product";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* Dynamic import để tách bundle */
const ProductSwiper = dynamic(() => import("@/components/product-swiper"), {
  ssr: false,
  loading: () => <ProductSwiperSkeleton />,
});

type HomeClientProps = {
  initialData: CategoryWithProducts[];
};

export default function HomeClient({ initialData }: HomeClientProps) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      console.log("ROLE:", session.user?.role);
    } else if (status === "unauthenticated") {
      console.log("ROLE: guest");
    }
  }, [status, session]);

  // Dùng trực tiếp data từ server (đã group sẵn theo category)
  const allCategories = useMemo(() => initialData.filter(cat => cat.products && cat.products.length > 0), [initialData]);

  // Lấy tất cả products để dùng cho carousel
  const products = useMemo(() => {
    return allCategories.flatMap((cat) => cat.products);
  }, [allCategories]);

  // 🔹 Infinite scroll
  const PAGE_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prevCount, setPrevCount] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setPrevCount(visibleCount);
            setVisibleCount((prev) =>
              Math.min(prev + PAGE_SIZE, allCategories.length),
            );
          }
        });
      },
      { rootMargin: "200px", threshold: 0.1 },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [allCategories.length, visibleCount]);

  if (!allCategories.length) {
    return (
      <main className="mx-auto max-w-7xl px-4">
        <Carousel products={products} isLoading={!products} />
        <p className="py-10 text-center text-gray-500">
          Không tìm thấy sản phẩm nào
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto mb-5 max-w-7xl space-y-10 px-4 sm:mb-20 sm:space-y-4">
      <Carousel products={products} isLoading={!products} />

      <div className="flex flex-col gap-4 sm:gap-12">
        {allCategories.slice(0, visibleCount).map((cat, idx) => {
          const isNew = idx >= prevCount;
          return (
            <AnimatePresence key={cat._id}>
              <motion.div
                initial={isNew ? { opacity: 0, y: 40 } : false}
                animate={isNew ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                <ProductSwiper
                  key={cat._id}
                  title={cat.name}
                  slug={cat.slug}
                  products={cat.products}
                />
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>

      {visibleCount < allCategories.length && (
        <div ref={loadMoreRef} className="h-1"></div>
      )}
    </main>
  );
}
