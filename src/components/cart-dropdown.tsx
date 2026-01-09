"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";

interface CartDropdownProps {
  isHidden?: boolean;
  onItemClick?: () => void;
}

export function CartDropdown({
  isHidden = false,
  onItemClick,
}: CartDropdownProps) {
  const { items, totalItems } = useCart();

  // Get up to 5 most recent items (assuming newly added are at the end, so reverse)
  const recentItems = [...items].reverse().slice(0, 5);

  const handleClick = () => {
    onItemClick?.();
  };

  if (items.length === 0) {
    return (
      <div
        className={`absolute top-[calc(100%+10px)] right-0 z-50 w-[300px] origin-top-right rounded-lg border border-gray-200 bg-white shadow-xl transition-all duration-200 ${isHidden ? "invisible opacity-0" : "invisible opacity-0 group-hover:visible group-hover:opacity-100"}`}
      >
        <div className="absolute -top-2 right-4 h-4 w-4 rotate-45 border-t border-l border-gray-200 bg-white" />

        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-4 rounded-full bg-gray-50 p-4">
            <Image
              src="/images/logo.webp"
              alt="Empty Cart"
              width={40}
              height={40}
              className="opacity-20 grayscale"
            />
          </div>
          <p className="mb-1 font-medium text-gray-900">Giỏ hàng trống</p>
          <p className="mb-6 text-xs text-gray-500">
            Bạn chưa thêm sản phẩm nào vào giỏ hàng.
          </p>

          <Button
            asChild
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md transition-transform duration-300 hover:from-blue-700 hover:to-indigo-600"
          >
            <Link href="/products" onClick={handleClick}>
              Mua sắm ngay
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute top-[calc(100%+12px)] right-0 z-50 w-[400px] origin-top-right rounded-sm border border-gray-200 bg-white shadow-[0_1px_10px_rgba(0,0,0,0.1)] transition-all duration-200 ${isHidden ? "invisible opacity-0" : "invisible opacity-0 group-hover:visible group-hover:opacity-100"}`}
    >
      {/* Triangle Arrow/Bridge */}
      <div className="absolute -top-3 right-0 h-4 w-full bg-transparent" />{" "}
      {/* Invisible bridge to prevent mouse leave */}
      <div className="absolute -top-2 right-[20px] h-4 w-4 rotate-45 border-t border-l border-gray-200 bg-white" />
      <div className="p-4">
        <h3 className="mb-4 text-base font-medium text-gray-400">
          Sản Phẩm Mới Thêm
        </h3>

        <div className="flex flex-col">
          {recentItems.map(({ product, quantity }) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={handleClick}
              className="group/item flex items-start gap-3 rounded-lg p-2 transition-all hover:bg-gray-50 hover:shadow-md"
            >
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 transition-all group-hover/item:ring-2 group-hover/item:ring-blue-500">
                <Image
                  src={product.imageUrls[0]}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-700">
                  {product.name}
                </p>
              </div>
              <div className="text-sm font-medium text-[#EE4D2D]">
                {product.price.toLocaleString("vi-VN")}đ
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 bg-[#FAFAFA] p-3">
        <span className="text-sm text-gray-600">
          {totalItems} Sản Phẩm Đã Thêm
        </span>
        <Button
          asChild
          className="h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 px-6 text-sm font-semibold text-white shadow-md transition-transform duration-300 hover:from-blue-700 hover:to-indigo-600"
        >
          <Link href="/cart" onClick={handleClick}>
            Xem Giỏ Hàng
          </Link>
        </Button>
      </div>
    </div>
  );
}
