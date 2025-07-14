"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import Link from "next/link";
import clsx from "clsx";

export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  // …các field khác nếu cần
}

interface ProductCardProps {
  product: Product;
  href?: string; // custom link
  className?: string; // override wrapper
  priceClassName?: string; // override price color
  imageProps?: Partial<ImageProps>; // tuỳ biến thẻ Image Next
}

const ProductCard = React.memo(
  ({
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
        {/* ảnh */}
        <div
          className="relative w-full overflow-hidden rounded"
          style={{ height: imageProps.height ?? 208 }}
        >
          {!loaded && (
            <div className="absolute inset-0 animate-pulse rounded bg-gray-200 dark:bg-neutral-700" />
          )}

          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes={imageProps.sizes ?? "(max-width:1024px) 50vw, 25vw"}
            className={clsx(
              "object-contain transition-opacity duration-500",
              loaded ? "opacity-100" : "opacity-0",
              imageProps.className,
            )}
            onLoad={() => setLoaded(true)}
            priority={true}
            {...imageProps}
          />
        </div>

        {/* nội dung */}
        <div className="mt-2 line-clamp-2 text-lg font-semibold text-gray-800 transition group-hover:text-blue-600">
          {product.name}
        </div>
        <div className={clsx("mt-1 text-lg font-bold", priceClassName)}>
          {product.price.toLocaleString("vi-VN")} đ
        </div>
      </Link>
    );
  },
  (prev, next) => prev.product === next.product && prev.href === next.href,
);

ProductCard.displayName = "ProductCard";
export default ProductCard;
