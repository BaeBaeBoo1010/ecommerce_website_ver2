/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/effect-fade";
import { useEffect, useState } from "react";
import type { Product } from "@/types/product";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

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
    const val = e.target.value;

    // Nếu đang xóa để nhập lại, cho phép input trống
    if (val === "") {
      setQuantity(NaN); // hoặc dùng state tạm thời nếu bạn không muốn số bị mờ
      return;
    }

    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      if (parsed >= min && parsed <= max) {
        setQuantity(parsed);
      } else if (parsed < min) {
        setQuantity(min);
      } else if (parsed > max) {
        setQuantity(max);
      }
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
        autoFocus={false}
        className="h-10 w-16 border-x border-gray-300 text-center text-lg font-semibold outline-none focus:ring-1 focus:ring-blue-500"
        min={min}
        max={max}
        value={isNaN(quantity) ? "" : quantity}
        onBlur={() => {
          if (isNaN(quantity)) setQuantity(min);
        }}
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

export default function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [openSheet, setOpenSheet] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);

  useEffect(() => {
    if (openSheet) {
      const t = setTimeout(() => setShowQuantitySelector(true), 100);
      return () => clearTimeout(t);
    } else {
      setShowQuantitySelector(false);
    }
  }, [openSheet]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const handleResize = () => {
      if (media.matches) setOpenSheet(false);
    };
    media.addEventListener("change", handleResize);
    return () => media.removeEventListener("change", handleResize);
  }, []);

  const [pendingAction, setPendingAction] = useState<"add" | "buy" | null>(
    null,
  );
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleAction = (type: "add" | "buy") => {
    const msg =
      type === "add"
        ? `Đã thêm ${quantity} sản phẩm vào giỏ hàng`
        : `Mua ngay ${quantity} sản phẩm`;

    toast.success(msg);
    // TODO: thêm logic thêm vào giỏ/mua ngay
  };

  return (
    <>
      <main>
        <div className="flex flex-col rounded-sm bg-white md:flex-row">
          {/* Ảnh sản phẩm */}
          <div className="flex items-center justify-center md:max-w-[600px] md:flex-1">
            <div className="w-full max-w-[600px]">
              <Swiper
                spaceBetween={10}
                slidesPerView={1}
                loop={true}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                onSlideChange={(swiper) =>
                  setActiveThumbIndex(swiper.realIndex)
                }
                thumbs={{ swiper: thumbsSwiper }}
                modules={[Thumbs, EffectFade]}
                className="rounded-sm"
              >
                {product.imageUrls.map((url, index) => (
                  <SwiperSlide key={index}>
                    <div className="relative h-[250px] w-full bg-white sm:h-[300px] md:h-[400px]">
                      <Image
                        src={url}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-contain"
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 600px"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Thumbnails */}
              {product.imageUrls.length > 1 && (
                <div className="mt-2 flex justify-center">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={8}
                    slidesPerView={Math.min(product.imageUrls.length, 5)}
                    loop={false}
                    breakpoints={{
                      0: { spaceBetween: 4 },
                      640: { spaceBetween: 8 },
                      1024: { spaceBetween: 15 },
                    }}
                    className="mt-0 !overflow-visible md:mt-2"
                    modules={[Thumbs]}
                  >
                    {product.imageUrls.map((url, index) => (
                      <SwiperSlide key={index} className="group !w-auto">
                        <div
                          className={`relative h-[30px] w-[30px] cursor-pointer overflow-hidden rounded-xl border-2 border-gray-300 opacity-50 transition-all duration-300 ease-in-out lg:h-[70px] lg:w-[70px] ${
                            index === activeThumbIndex
                              ? "scale-110 border-gray-600 opacity-100 shadow-md"
                              : "hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={url}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            className="object-contain"
                            loading="lazy"
                            sizes="(max-width: 768px) 30px, (max-width: 1024px) 50px, 70px"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}
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
                    shallow
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
                      {showFullDescription || product.description.length <= 250
                        ? product.description
                        : `${product.description.slice(0, 250)}...`}
                      {product.description.length > 250 && (
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
                onClick={() => handleAction("add")}
              >
                Thêm vào giỏ hàng
              </button>
              <button
                className="flex-1 cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 p-4 text-lg font-semibold text-white shadow-md transition-transform duration-300 hover:scale-[1.07] hover:from-blue-700 hover:to-indigo-600 focus:ring-4 focus:ring-indigo-300 focus:outline-none"
                onClick={() => handleAction("buy")}
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
              <Swiper slidesPerView={1} className="h-full w-full">
                {product.imageUrls.map(
                  (url: string | StaticImport, index: number) => (
                    <SwiperSlide key={index}>
                      <div className="relative aspect-square">
                        <Image
                          src={url}
                          alt={`${product.name} ${index + 1}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </SwiperSlide>
                  ),
                )}
              </Swiper>
            </div>

            <div className="text-sm font-medium text-gray-800">
              {product.name}
            </div>
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />

          {/* Số lượng */}
          {showQuantitySelector && (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Số lượng:</span>
              <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
            </div>
          )}

          {/* Nút Xong */}
          <div className="mt-2 flex justify-end">
            <button
              className="rounded bg-blue-600 px-4 py-2 text-white"
              onClick={() => {
                setOpenSheet(false);
                if (pendingAction === "add") handleAction("add");
                if (pendingAction === "buy") handleAction("buy");
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
