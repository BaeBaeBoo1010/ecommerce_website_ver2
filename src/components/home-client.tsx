"use client";

import dynamic from "next/dynamic";
import Carousel from "@/components/carousel";
import ProductSwiperSkeleton from "@/components/product-swiper-skeleton";
import type { CategoryWithProducts } from "@/app/types";

/* Dynamic‑import ProductSwiper để cắt JS khỏi bundle đầu */
const ProductSwiper = dynamic(() => import("@/components/product-swiper"), {
  ssr: false,
  loading: () => <ProductSwiperSkeleton />,
});

interface Props {
  initialData: CategoryWithProducts[];
}

export default function HomeClient({ initialData }: Props) {
  if (!initialData.length) {
    return (
      <main className="mx-auto max-w-7xl px-4">
        <Carousel />
        <p className="py-10 text-center text-gray-500">
          Không tìm thấy sản phẩm nào
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 sm:space-y-4">
      <Carousel /> {/* Hero carousel SSR để đạt LCP tốt */}
      {initialData.map(({ _id, name, products }) => (
        <ProductSwiper key={_id} title={name} products={products} />
      ))}
    </main>
  );
}
