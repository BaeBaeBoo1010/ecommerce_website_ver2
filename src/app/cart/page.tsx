"use client";

import { useCart } from "@/context/cart-context";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { CartItem } from "@/components/cart-item";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart } = useCart();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  const LS_SELECTED_KEY = "cart_selected_items";

  // Load selected items from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_SELECTED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedItems(new Set(parsed));
        }
      }
    } catch (error) {
      console.error("Failed to load selected items from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save selected items to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LS_SELECTED_KEY, JSON.stringify([...selectedItems]));
    }
  }, [selectedItems, isLoaded]);

  // Update selection when items change (remove non-existent items)
  useEffect(() => {
    if (!isLoaded) return; // Đợi load xong từ localStorage
    setSelectedItems((prev) => {
      const next = new Set(prev);
      const itemIds = new Set(items.map((i) => i.product.id));
      for (const id of next) {
        if (!itemIds.has(id)) {
          next.delete(id);
        }
      }
      return next;
    });
  }, [items, isLoaded]);

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((i) => i.product.id)));
    }
  };

  const selectedTotalPrice = useMemo(() => {
    return items
      .filter((item) => selectedItems.has(item.product.id))
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items, selectedItems]);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <ShoppingBag size={64} className="text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-800">
          Giỏ hàng của bạn đang trống
        </h1>
        <p className="text-gray-500">
          Hãy dạo quanh cửa hàng và thêm vài sản phẩm nhé!
        </p>
        <Button asChild className="mt-4">
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-2 pb-24 sm:py-8 sm:pb-8">
        <h1 className="mb-4 text-2xl font-bold sm:mb-8 sm:text-3xl">Giỏ hàng ({items.length})</h1>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            {/* Header row with Select All - hidden on mobile */}
            <div className="hidden items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex">
              <Checkbox
                checked={items.length > 0 && selectedItems.size === items.length}
                onClick={toggleSelectAll}
              />
              <span className="font-medium text-gray-700">
                Chọn tất cả ({items.length} sản phẩm)
              </span>
            </div>
            {items.map(({ product, quantity }) => (
              <CartItem
                key={product.id}
                product={product}
                quantity={quantity}
                isSelected={selectedItems.has(product.id)}
                onToggleSelect={toggleSelect}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </div>

          {/* Summary - hidden on mobile */}
          <div className="hidden h-fit w-full rounded-lg border border-gray-200 bg-gray-50 p-4 sm:block sm:p-6 lg:w-96">
            <h2 className="mb-4 text-lg font-bold sm:text-xl">Tổng quan đơn hàng</h2>

            <div className="mt-4 flex justify-between text-base font-bold sm:text-lg">
              <span>Tạm tính</span>
              <span className="text-[#EE4D2D]">
                {selectedTotalPrice.toLocaleString("vi-VN")} ₫
              </span>
            </div>

            <Button
              className="mt-4 w-full gap-2 py-6 text-base sm:mt-6 sm:text-lg"
              size="lg"
              disabled={selectedItems.size === 0}
            >
              Mua hàng ({selectedItems.size}) <ArrowRight size={20} />
            </Button>
            
            <p className="mt-4 text-center text-xs text-gray-500">
              Giá đã bao gồm VAT. Phí vận chuyển sẽ được tính khi mua hàng.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed right-0 bottom-0 left-0 z-10 flex items-center justify-between gap-4 border-t border-gray-200 bg-white px-4 py-4 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] sm:hidden">
        {/* Select All Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={items.length > 0 && selectedItems.size === items.length}
            onClick={toggleSelectAll}
            className="h-5 w-5"
          />
          <span className="text-base font-medium text-gray-700">Tất cả</span>
        </div>

        {/* Subtotal */}
        <div className="flex flex-1 flex-col items-end">
          <span className="text-sm text-gray-500">Tạm tính</span>
          <span className="text-lg font-bold text-[#EE4D2D]">
            {selectedTotalPrice.toLocaleString("vi-VN")} ₫
          </span>
        </div>

        {/* Buy Button */}
        <Button
          className="h-12 gap-1 px-5 text-base font-semibold"
          disabled={selectedItems.size === 0}
        >
          Mua hàng ({selectedItems.size})
        </Button>
      </div>
    </>
  );
}
