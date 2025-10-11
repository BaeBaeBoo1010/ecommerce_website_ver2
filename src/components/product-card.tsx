"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image, { ImageProps } from "next/image";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  href?: string;
  className?: string;
  priceClassName?: string;
  imageProps?: Partial<ImageProps>;
}

const ProductCard = ({
  product,
  href = `/products/${product._id}`,
  imageProps = {},
}: ProductCardProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={href}
      className="group group flex h-64 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg sm:h-90"
    >
      {/* Ảnh */}
      <div
        className="relative w-full rounded"
        style={{ height: imageProps.height ?? 208 }}
      >
        {!loaded && (
          <div className="absolute inset-0 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
        )}

        <Image
          src={product.imageUrls[0] || "/images/placeholder.png"}
          alt={product.name}
          fill
          sizes={imageProps.sizes ?? "(max-width:1024px) 50vw, 25vw"}
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          onLoad={() => setLoaded(true)}
          loading="lazy"
          priority={false}
          {...imageProps}
        />
      </div>

      {/* Nội dung */}
      <div className="mt-3 flex flex-grow flex-col">
        <h3 className="line-clamp-3 text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 sm:text-lg">
          {product.name}
        </h3>
        <p className="mt-auto text-base font-bold text-[#ee4d2d] sm:text-lg">
          {product.price.toLocaleString("vi-VN")}
          <span className="text-xs">đ</span>
        </p>
      </div>
    </Link>
  );
};

// ✅ Memo hóa để tránh re-render khi prop không đổi
export default React.memo(ProductCard, (prev, next) => {
  return (
    prev.product._id === next.product._id &&
    prev.href === next.href &&
    prev.className === next.className &&
    prev.priceClassName === next.priceClassName
  );
});
