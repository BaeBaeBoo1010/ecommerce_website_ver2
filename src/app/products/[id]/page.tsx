"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  category: { _id: string; name: string; slug: string } | string;
}

function QuantitySelector({
  quantity,
  setQuantity,
  min = 1,
  max = 100,
}: {
  quantity: number;
  setQuantity: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const handleDecrease = () => {
    if (quantity > min) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < max) setQuantity(quantity + 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= min && val <= max) {
      setQuantity(val);
    } else if (e.target.value === "") {
      setQuantity(min);
    }
  };

  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border shadow-sm">
      <button
        onClick={handleDecrease}
        disabled={quantity <= min}
        className="mr-[1px] flex h-10 w-10 cursor-pointer items-center justify-center rounded-l-lg bg-white font-semibold text-gray-700 transition select-none hover:bg-gray-100 active:bg-gray-200 disabled:cursor-not-allowed"
        aria-label="Giảm số lượng"
      >
        –
      </button>

      <input
        className="h-10 w-16 border-x border-gray-300 text-center text-lg font-semibold outline-none focus:ring-1 focus:ring-blue-500"
        min={min}
        max={max}
        value={quantity}
        onChange={handleChange}
        aria-label="Số lượng sản phẩm"
      />

      <button
        onClick={handleIncrease}
        disabled={quantity >= max}
        className="ml-[1px] flex h-10 w-10 cursor-pointer items-center justify-center rounded-r-lg bg-white font-semibold text-gray-700 transition select-none hover:bg-gray-100 active:bg-gray-200 disabled:cursor-not-allowed"
        aria-label="Tăng số lượng"
      >
        +
      </button>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [openSheet, setOpenSheet] = useState(false);
  const [pendingAction, setPendingAction] = useState<"add" | "buy" | null>(
    null,
  );
  const [showFullDescription, setShowFullDescription] = useState(false);


  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    (async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          toast.error("Không tìm thấy sản phẩm");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProduct(data);
      } catch {
        toast.error("Lỗi tải sản phẩm, vui lòng thử lại");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddToCart = () => {
    toast.success(`Thêm ${quantity} sản phẩm vào giỏ hàng thành công!`);
  };

  const handleBuyNow = () => {
    toast.success(`Mua ngay ${quantity} sản phẩm!`);
    // TODO: chuyển hướng thanh toán nếu cần
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="loader h-16 w-16 rounded-full border-8 border-t-8 border-gray-200 ease-linear"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center text-lg text-red-500">
        Không tìm thấy sản phẩm.
      </div>
    );
  }

  return (
    <>
      <main className="bg-gray-100 p-2 pb-[80px] sm:p-4 md:pb-4">
        <div className="flex flex-col rounded-sm bg-white md:flex-row">
          {/* Ảnh sản phẩm */}
          <div className="flex items-center justify-center md:max-w-[600px] md:flex-1">
            <div className="relative aspect-square w-full max-w-[600px] overflow-hidden rounded-sm bg-white">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="rounded-sm object-contain"
                priority
              />
            </div>
          </div>

          {/* Thông tin sản phẩm */}
          <section className="flex flex-col justify-between p-6 md:flex-1">
            <div>
              <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-gray-900">
                {product.name}
              </h1>

              {typeof product.category === "object" && (
                <p className="mb-4 text-sm text-gray-500">
                  Danh mục:{" "}
                  <Link
                    href={`/products?category=${product.category.slug}&page=1`}
                    className="cursor-pointer rounded-lg bg-gray-200 p-2 font-medium transition-all hover:text-blue-500"
                    aria-label={`Xem sản phẩm danh mục ${product.category.name}`}
                  >
                    {product.category.name}
                  </Link>
                </p>
              )}

              <p className="mb-6 text-4xl font-bold text-[#EE4D2D]">
                {product.price.toLocaleString("vi-VN")} ₫
              </p>

              <div className="prose mb-8 max-w-none text-gray-700">
                {product.description ? (
                  <>
                    {/* Mobile: cắt mô tả nếu dài */}
                    <p className="block md:hidden">
                      {showFullDescription || product.description.length <= 100
                        ? product.description
                        : `${product.description.slice(0, 100)}...`}
                      {product.description.length > 100 && (
                        <button
                          onClick={() =>
                            setShowFullDescription(!showFullDescription)
                          }
                          className="ml-1 text-blue-600 underline"
                        >
                          {showFullDescription ? "Thu gọn" : "Xem thêm"}
                        </button>
                      )}
                    </p>

                    {/* Desktop: luôn hiển thị đầy đủ */}
                    <p className="hidden md:block">{product.description}</p>
                  </>
                ) : (
                  <p className="text-gray-400 italic">
                    Chưa có mô tả cho sản phẩm này.
                  </p>
                )}
              </div>

              {/* Chọn số lượng - desktop */}
              <div className="hidden items-center gap-4 md:flex">
                <label
                  htmlFor="quantity"
                  className="text-lg font-semibold text-gray-700"
                >
                  Số lượng:
                </label>
                <QuantitySelector
                  quantity={quantity}
                  setQuantity={setQuantity}
                />
              </div>
            </div>

            {/* Nút hành động - desktop */}
            <div className="mt-6 hidden flex-col gap-4 md:flex md:flex-row md:gap-6">
              <button
                className="flex-1 cursor-pointer rounded-lg border-2 border-indigo-500 bg-white p-4 text-indigo-600 shadow-sm transition-colors duration-300 hover:bg-indigo-50 hover:text-indigo-700 focus:ring-4 focus:ring-indigo-200 focus:outline-none"
                onClick={handleAddToCart}
              >
                Thêm vào giỏ hàng
              </button>
              <button
                className="flex-1 cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 p-4 text-lg font-semibold text-white shadow-md transition-transform duration-300 hover:scale-[1.07] hover:from-blue-700 hover:to-indigo-600 focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                onClick={handleBuyNow}
              >
                Mua ngay
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Nút hành động - mobile */}
      <div className="fixed right-0 bottom-0 left-0 z-10 flex items-center justify-between gap-2 bg-white p-4 shadow-md md:hidden">
        <button
          onClick={() => {
            setPendingAction("add");
            setOpenSheet(true);
          }}
          className="flex-1 rounded-lg border-2 border-indigo-500 bg-white py-3 text-base font-semibold text-indigo-600"
        >
          Thêm vào giỏ
        </button>

        <button
          onClick={() => {
            setPendingAction("buy");
            setOpenSheet(true);
          }}
          className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 py-3 text-base font-semibold text-white"
        >
          Mua ngay
        </button>
      </div>

      {/* Sheet chọn số lượng */}
      <Sheet open={openSheet} onOpenChange={setOpenSheet}>
        <SheetContent side="bottom" className="p-6 pb-4">
          {/* Sheet Header */}
          <SheetHeader>
            <SheetTitle className="text-left text-xl">
              {pendingAction === "buy" ? "Mua ngay" : "Thêm vào giỏ"}
            </SheetTitle>
          </SheetHeader>
          {/* Preview sản phẩm */}
          <div className="flex items-center gap-4">
            <div className="relative aspect-square w-20 overflow-hidden rounded border border-gray-200 bg-white">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>

            <div className="text-sm font-medium text-gray-800">
              {product.name}
            </div>
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />

          {/* Số lượng */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Số lượng:</span>
            <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
          </div>

          {/* Nút Xong */}
          <div className="mt-2 flex justify-end">
            <button
              className="rounded bg-blue-600 px-4 py-2 text-white"
              onClick={() => {
                setOpenSheet(false);
                if (pendingAction === "add") handleAddToCart();
                if (pendingAction === "buy") handleBuyNow();
                setPendingAction(null);
              }}
            >
              Xong
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
