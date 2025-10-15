"use client";

import dynamic from "next/dynamic";
import Carousel from "@/components/carousel";
import ProductSwiperSkeleton from "@/components/product-swiper-skeleton";
import type { CategoryWithProducts } from "@/types/product";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

/* Dynamic import để tách bundle */
const ProductSwiper = dynamic(() => import("@/components/product-swiper"), {
  ssr: false,
  loading: () => <ProductSwiperSkeleton />,
});

interface Props {
  initialData: CategoryWithProducts[];
}

export default function HomeClient({ initialData }: Props) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      console.log("ROLE:", session.user?.role);
    } else if (status === "unauthenticated") {
      console.log("ROLE: guest");
    }
  }, [status, session]);

  // 🔍 Lọc bỏ danh mục không có sản phẩm
  const categoriesWithProducts = initialData.filter(
    (category) => category.products && category.products.length > 0,
  );

  if (!categoriesWithProducts.length) {
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
    <main className="mx-auto mb-5 max-w-7xl space-y-10 px-4 sm:mb-20 sm:space-y-4">
      <Carousel /> {/* Hero carousel SSR để đạt LCP tốt */}
      <div className="flex flex-col gap-4 sm:gap-12">
        {categoriesWithProducts.map(({ _id, name, slug, products }) => (
          <ProductSwiper
            key={_id}
            title={name}
            slug={slug}
            products={products}
          />
        ))}
      </div>
    </main>
  );
}
