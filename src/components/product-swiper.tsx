"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  productID: string;
}

export default function CategoryProductSlider({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`/api/products-by-category?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, [slug]);

  if (!products.length) return null;

  return (
    <div className="mx-10 mb-8 bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>

      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product._id}>
            <div className="rounded-lg border p-3 transition hover:shadow">
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={200}
                className="mx-auto mb-2 object-contain"
              />
              <h3 className="text-center text-sm font-medium">
                {product.name}
              </h3>
              <p className="text-center text-sm font-semibold text-red-500">
                {product.price.toLocaleString()}₫
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
