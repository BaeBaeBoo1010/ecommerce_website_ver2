"use client";

import { useCart } from "@/context/cart-context";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { CartItem } from "@/components/cart-item";
import { getFreshCartProducts } from "@/app/actions/cart";

export default function CartClient() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    refreshCartData,
    isLoaded: isCartLoaded,
  } = useCart();
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

  // Validate and refresh cart data from server (Dynamic + Cached)
  useEffect(() => {
    const validateCart = async () => {
      if (isCartLoaded && items.length > 0) {
        const ids = items.map((i) => i.product.id);
        // Server Action: Uses unstable_cache w/ tags ["products"]
        try {
          const freshProducts = await getFreshCartProducts(ids);
          refreshCartData(freshProducts);
        } catch (err) {
          console.error("Failed to validate cart:", err);
        }
      }
    };
    validateCart();
  }, [isCartLoaded, items.length, refreshCartData]);

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

  const totalSavings = useMemo(() => {
    return items
      .filter((item) => selectedItems.has(item.product.id))
      .reduce((sum, item) => {
        const originalPrice = item.product.originalPrice || item.product.price;
        const savings = Math.max(0, originalPrice - item.product.price);
        return sum + savings * item.quantity;
      }, 0);
  }, [items, selectedItems]);

  if (!isLoaded || !isCartLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
        <Button
          asChild
          className="mt-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-3 text-lg font-semibold text-white shadow-md transition-transform duration-300 hover:from-blue-700 hover:to-indigo-600"
        >
          <Link href="/products">Tiếp tục mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-2 pb-24 sm:py-8 sm:pb-8">
        <h1 className="mb-4 text-2xl font-bold sm:mb-8 sm:text-3xl">
          Giỏ hàng ({items.length})
        </h1>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            {/* Header row with Select All - hidden on mobile */}
            <div className="hidden items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex">
              <Checkbox
                checked={
                  items.length > 0 && selectedItems.size === items.length
                }
                onChange={toggleSelectAll}
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
            <h2 className="mb-4 text-lg font-bold sm:text-xl">
              Tổng quan đơn hàng
            </h2>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-base font-bold sm:text-lg">
                <span>Thành tiền</span>
                <span className="text-[#EE4D2D]">
                  {selectedTotalPrice.toLocaleString("vi-VN")}₫
                </span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Tiết kiệm</span>
                  <span>{totalSavings.toLocaleString("vi-VN")}₫</span>
                </div>
              )}
            </div>

            <Button
              className="mt-4 w-full gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 py-6 text-base font-semibold text-white shadow-md transition-transform duration-300 hover:from-blue-700 hover:to-indigo-600 disabled:opacity-50 sm:mt-6 sm:text-lg"
              size="lg"
              disabled={selectedItems.size === 0}
              onClick={() => {
                const ids = Array.from(selectedItems).join(",");
                router.push(`/checkout?ids=${ids}`);
              }}
            >
              Mua hàng ({selectedItems.size}) <ArrowRight size={20} />
            </Button>

            <p className="mt-4 text-center text-xs text-gray-500">
              Giá đã bao gồm VAT, chưa bao gồm phí vận chuyển.
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
            onChange={toggleSelectAll}
            className="h-5 w-5"
          />
          <span className="text-base font-medium text-gray-700">Tất cả</span>
        </div>

        {/* Subtotal */}
        <div className="flex flex-1 flex-col items-end">
          <span className="text-sm text-gray-500">Thành tiền</span>
          <span className="text-lg font-bold text-[#EE4D2D]">
            {selectedTotalPrice.toLocaleString("vi-VN")} ₫
          </span>
          {totalSavings > 0 && (
            <span className="text-xs text-green-600">
              Tiết kiệm {totalSavings.toLocaleString("vi-VN")} ₫
            </span>
          )}
        </div>

        {/* Buy Button */}
        <Button
          className="h-12 gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 px-5 text-base font-semibold text-white shadow-md transition-transform duration-300 hover:from-blue-700 hover:to-indigo-600 disabled:opacity-50"
          disabled={selectedItems.size === 0}
          onClick={() => {
            const ids = Array.from(selectedItems).join(",");
            router.push(`/checkout?ids=${ids}`);
          }}
        >
          Mua hàng ({selectedItems.size})
        </Button>
      </div>
    </>
  );
}
