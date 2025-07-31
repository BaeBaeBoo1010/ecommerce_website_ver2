"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image, { ImageProps } from "next/image";
import clsx from "clsx";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  href?: string; // custom link
  className?: string; // override wrapper
  priceClassName?: string; // override price color
  imageProps?: Partial<ImageProps>; // tuỳ biến thẻ Image Next
}

const ProductCard = ({
  product,
  href = `/products/${product._id}`,
  className = "",
  priceClassName = "text-[#EE4D2D]",
  imageProps = {},
}: ProductCardProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={href}
      className={clsx(
        "group rounded-xl border p-2 transition hover:scale-105 hover:shadow-md",
        className,
      )}
    >
      {/* Ảnh */}
      <div
        className="relative w-full overflow-hidden rounded"
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
          className={clsx(
            "object-contain transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            imageProps.className,
          )}
          onLoad={() => setLoaded(true)}
          loading="lazy"
          priority={false}
          {...imageProps}
        />
      </div>

      {/* Nội dung */}
      <div className="mt-2 line-clamp-2 text-lg font-semibold text-gray-800 transition group-hover:text-blue-600">
        {product.name}
      </div>
      <div className={clsx("mt-1 text-lg font-bold", priceClassName)}>
        {product.price.toLocaleString("vi-VN")} đ
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
