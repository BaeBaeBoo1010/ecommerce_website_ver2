"use client";
import dynamic from "next/dynamic";
import type { CategoryWithProducts } from "@/app/page";
import Carousel from "@/components/carousel";
import ProductSwiperSkeleton from "@/components/product-swiper-skeleton";

const ProductSwiper = dynamic(() => import("@/components/product-swiper"), {
  ssr: false,
  loading: () => <ProductSwiperSkeleton />,
});

export default function HomeClient({
  initialData = [],
}: {
  initialData: CategoryWithProducts[];
}) {
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 sm:space-y-4">
      <Carousel /> {/* vẫn SSR để đạt LCP tốt */}
      {initialData.map(({ _id, name, products }) => (
        <ProductSwiper key={_id} title={name} products={products} />
      ))}
    </main>
  );
}