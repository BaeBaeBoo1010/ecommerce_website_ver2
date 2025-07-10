"use client";

import Carousel from "@/components/carousel";
import ProductSwiper from "@/components/product-swiper";
import TestUploadForm from "@/components/test-upload";

export default function Home() {
  return (
    <main>
      <Carousel />
      <ProductSwiper slug="cong-tac-thong-minh" title="Công tắc thông minh" />
      <ProductSwiper slug="cam-ung" title="Cảm ứng hiện diện" />
      <TestUploadForm />
    </main>
  );
}
