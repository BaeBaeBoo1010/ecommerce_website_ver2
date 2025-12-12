"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { useEffect, useState } from "react";

interface CartItemProps {
  product: Product;
  quantity: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({
  product,
  quantity,
  isSelected,
  onToggleSelect,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const router = useRouter();
  const [localQuantity, setLocalQuantity] = useState<number>(quantity);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    setLocalQuantity(quantity);
  }, [quantity]);

  const handleDecrease = () => {
    if (localQuantity > 1) {
       const newVal = localQuantity - 1;
       setLocalQuantity(newVal);
       onUpdateQuantity(product.id, newVal);
    } else if (localQuantity === 1) {
       setShowDeleteDialog(true);
    }
  };

  const handleIncrease = () => {
    if (localQuantity < 1000) {
      const newVal = localQuantity + 1;
      setLocalQuantity(newVal);
      onUpdateQuantity(product.id, newVal);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setLocalQuantity(NaN);
      return;
    }
    // Only allow digits
    if (!/^\d*$/.test(val)) return;

    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
       // Allow typing intermediate numbers, update parent if valid
       if (parsed >= 1 && parsed <= 1000) {
         setLocalQuantity(parsed);
         onUpdateQuantity(product.id, parsed);
       } else if (parsed < 1) {
           // Don't update parent yet if invalid, just local? 
           // ProductDetail logic clamps immediately on change: 
           // "if (parsed >= min && parsed <= max) setQuantity(parsed); else if (< min) min; else > max"
           // Let's copy THAT logic exactly.
           setLocalQuantity(1);
           onUpdateQuantity(product.id, 1);
       } else if (parsed > 1000) {
           setLocalQuantity(1000);
           onUpdateQuantity(product.id, 1000);
       }
    }
  };

  const handleBlur = () => {
      if (isNaN(localQuantity)) {
          setLocalQuantity(1);
          onUpdateQuantity(product.id, 1);
      }
  };

  return (
    <div
      className="group flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md hover:bg-gray-50 cursor-pointer items-start sm:items-center"
      onClick={() => router.push(`/products/${product.slug}`)}
    >
      <div onClick={(e) => e.stopPropagation()} className="self-center">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggleSelect(product.id)}
        />
      </div>
      {/* Image */}
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 sm:h-24 sm:w-24">
        <Image
          src={product.imageUrls[0]}
          alt={product.name}
          fill
          className="object-contain" // object-contain to avoid cropping product details
        />
      </div>

      {/* Info & Controls Wrapper */}
      <div className="flex flex-1 flex-col justify-between gap-2 min-h-[5rem] sm:min-h-[6rem] sm:flex-row sm:items-center sm:gap-4">
        {/* Info */}
        <div className="flex flex-col gap-1">
          <Link
            href={`/products/${product.slug}`}
            className="text-base font-medium text-gray-900 line-clamp-2 hover:text-blue-600 hover:underline group-hover:text-blue-600 group-hover:underline sm:text-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {product.name}
          </Link>
          <div className="text-sm font-semibold text-[#EE4D2D] sm:text-base">
            {product.price.toLocaleString("vi-VN")} ₫
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          {/* Quantity */}
          <div
            className="inline-flex items-center overflow-visible rounded-lg border shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleDecrease}
              className="mr-[1px] flex h-7 w-7 cursor-pointer items-center justify-center rounded-l-lg bg-white font-semibold text-gray-700 transition select-none hover:bg-gray-100 active:bg-gray-200 sm:h-10 sm:w-10"
            >
              –
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              min={1}
              max={1000}
              value={isNaN(localQuantity) ? "" : localQuantity}
              onChange={handleChange}
              onBlur={handleBlur}
              className="h-7 w-12 border border-gray-300 text-center text-xs font-semibold outline-none focus:z-10 focus:ring-2 focus:ring-blue-500 sm:h-10 sm:w-16 sm:text-lg"
            />
            <button
              onClick={handleIncrease}
              className="ml-[1px] flex h-7 w-7 cursor-pointer items-center justify-center rounded-r-lg bg-white font-semibold text-gray-700 transition select-none hover:bg-gray-100 active:bg-gray-200 disabled:cursor-not-allowed sm:h-10 sm:w-10"
              disabled={localQuantity >= 1000}
            >
              +
            </button>
          </div>

          {/* Remove */}
          <Dialog>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 sm:h-10 sm:w-10"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              title="Xóa khỏi giỏ hàng"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogContent showCloseButton={false} onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                  <DialogTitle>Xác nhận xóa</DialogTitle>
                  <DialogDescription>
                    Bạn chắc chắn muốn bỏ sản phẩm này?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-4 sm:gap-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(false);
                    }}
                  >
                    Không
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(product.id);
                      setShowDeleteDialog(false);
                    }}
                  >
                    Đồng ý
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
