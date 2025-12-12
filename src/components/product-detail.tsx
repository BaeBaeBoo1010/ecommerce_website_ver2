/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import "swiper/css/effect-fade";
import { useEffect, useState, useMemo, useCallback } from "react";
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
import { useInView } from "react-intersection-observer";
import { Loader2, X } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

/* ---------- Tiny blur data url (valid for next/image) ---------- */
const TINY_SVG =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyBmaWxsPSIjZWVlIiB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4=";

/* ---------- SafeHtml ---------- */
function SafeHtml({ html, className }: { html: string; className?: string }) {
  const clean = useMemo(
    () =>
      DOMPurify.sanitize(html ?? "", {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
      }),
    [html],
  );
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
  );
}

function QuantitySelector({
  quantity,
  setQuantity,
  min = 1,
  max = 1000,
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
    if (val === "") {
      setQuantity(NaN);
      return;
    }
    // Only allow digits
    if (!/^\d*$/.test(val)) return;

    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      if (parsed >= min && parsed <= max) setQuantity(parsed);
      else if (parsed < min) setQuantity(min);
      else if (parsed > max) setQuantity(max);
    }
  };

  return (
    <div className="inline-flex items-center overflow-visible rounded-lg border shadow-sm">
      <button
        onClick={handleDecrease}
        disabled={quantity <= min}
        className="mr-[1px] flex h-10 w-10 cursor-pointer items-center justify-center rounded-l-lg bg-white font-semibold text-gray-700 transition select-none hover:bg-gray-100 active:bg-gray-200 disabled:cursor-not-allowed"
        aria-label="Giảm số lượng"
      >
        –
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoFocus={false}
        className="h-10 w-16 border border-gray-300 text-center text-lg font-semibold outline-none focus:z-10 focus:ring-2 focus:ring-blue-500"
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

import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";

// ... (existing imports)

export default function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  const [openSheet, setOpenSheet] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [activeThumbIndex, setActiveThumbIndex] = useState(0);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const { ref: articleRef, inView: articleInView } = useInView({
    triggerOnce: true,
    rootMargin: "200px",
  });

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

  // Lightbox state
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const openLightbox = useCallback((src: string) => {
    setLightboxSrc(src);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxSrc(null);
    document.body.style.overflow = "";
  }, []);

  // Handle click on article images and Escape key
  useEffect(() => {
    const handleArticleImageClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" && target.closest(".rich-article")) {
        const imgSrc = (target as HTMLImageElement).src;
        if (imgSrc) {
          openLightbox(imgSrc);
        }
      }
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lightboxSrc) {
        closeLightbox();
      }
    };

    document.addEventListener("click", handleArticleImageClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("click", handleArticleImageClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [lightboxSrc, openLightbox, closeLightbox]);

  const handleAction = (type: "add" | "buy") => {
    addToCart(product, quantity);
    
    if (type === "buy") {
      router.push("/cart");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <main className="mx-auto w-full max-w-7xl px-0 py-0 md:px-4 md:py-4">
          <div className="rounded-lg bg-white">
            <div className="flex flex-col lg:flex-row">
              {/* Ảnh sản phẩm */}
              <div className="flex items-center justify-center md:max-w-[600px] md:flex-1">
                <div className="w-full max-w-[600px]">
                  <Swiper
                    spaceBetween={10}
                    slidesPerView={1}
                    loop={product.imageUrls.length > 1}
                    effect="fade"
                    fadeEffect={{ crossFade: true }}
                    onSlideChange={(swiper) =>
                      setActiveThumbIndex(swiper.realIndex)
                    }
                    thumbs={{ swiper: thumbsSwiper }}
                    modules={[Thumbs, EffectFade]}
                    className="product-swiper rounded-sm"
                  >
                    {product.imageUrls.map((url, index) => (
                      <SwiperSlide key={index}>
                        <div
                          className="product-image-container relative h-[250px] w-full cursor-pointer bg-white sm:h-[300px] md:h-[400px]"
                          onClick={() => openLightbox(product.imageUrls[activeThumbIndex])}
                        >
                          <Image
                            src={url}
                            alt={`${product.name} ${index + 1}`}
                            fill
                            className="product-image object-contain"
                            priority={index === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                            placeholder="blur"
                            blurDataURL={TINY_SVG}
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

              {/* Nội dung thông tin sản phẩm */}
              <section className="flex flex-col justify-between p-6 md:flex-1">
                <div>
                  <h1 className="mb-5 text-4xl font-bold tracking-tight text-gray-900">
                    {product.name}
                  </h1>

                  {typeof product.category === "object" && (
                    <p className="mb-4 text-sm text-gray-500">
                      Danh mục:{" "}
                      <Link
                        href={`/products?category=${product.category.slug}&page=1`}
                        shallow
                        className="cursor-pointer rounded-lg bg-gray-200 p-2 font-medium transition-all hover:text-blue-500"
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
                        {/* ✅ Security: Text content is automatically escaped by React */}
                        <p className="block md:hidden">
                          {showFullDescription ||
                          product.description.length <= 250
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

            {/* Bài viết chi tiết */}
            {product.isArticleEnabled && product.articleHtml && (
              <section
                ref={articleRef}
                className="mt-2 min-h-[200px] rounded-lg bg-white p-6 shadow-sm"
              >
                {articleInView ? (
                  <SafeHtml
                    html={product.articleHtml}
                    className="rich-article prose dark:prose-invert prose-headings:font-semibold prose-headings:text-gray-900 prose-a:text-blue-600 hover:prose-a:underline prose-strong:text-gray-800 prose-img:mx-auto prose-img:rounded-lg prose-img:shadow-md prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:italic prose-blockquote:text-gray-700 prose-table:overflow-hidden prose-table:rounded-sm prose-table:border prose-table:border-gray-200 prose-th:bg-gray-100 prose-th:text-gray-800 prose-td:border-gray-200 animate-fadeIn max-w-none [&_iframe]:mx-auto [&_iframe]:block [&_iframe]:rounded-lg [&_iframe]:shadow-md max-sm:[&_iframe]:max-h-70 max-sm:[&_iframe]:max-w-full sm:[&_iframe]:h-auto sm:[&_iframe]:max-w-full"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center text-gray-400">
                    <Loader2 className="text-primary h-10 w-10 animate-spin" />
                  </div>
                )}

                {/* Responsive media styles */}
                <style jsx global>{`
                  @keyframes fadeIn {
                    from {
                      opacity: 0;
                      transform: translateY(10px);
                    }
                    to {
                      opacity: 1;
                      transform: translateY(0);
                    }
                  }
                  .animate-fadeIn {
                    animation: fadeIn 0.5s ease-in-out;
                  }
                  /* Product image hover effect - only active slide */
                  .product-swiper .swiper-slide {
                    pointer-events: none;
                    z-index: 1;
                  }
                  .product-swiper .swiper-slide-active {
                    pointer-events: auto;
                    z-index: 10;
                  }
                  .product-swiper .product-image {
                    transition: transform 0.3s ease;
                  }
                  .product-swiper .swiper-slide-active .product-image-container:hover .product-image {
                    transform: scale(1.05);
                  }
                  .rich-article iframe {
                    width: 100%;
                    height: 400px;
                    border-radius: 12px;
                    margin: 1.5rem 0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                  }
                  .rich-article table {
                    margin: 0.5rem 0 !important;
                    width: 100%;
                    border-collapse: collapse;
                    border-radius: 4px; /* rounded-sm */
                    overflow: hidden;
                  }
                  .rich-article th,
                  .rich-article td {
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #e5e7eb;
                  }
                  .rich-article th {
                    background-color: #f9fafb;
                    font-weight: 600;
                  }
                  .rich-article tr:hover td {
                    background-color: #f9fafb;
                  }
                  @media (max-width: 768px) {
                    .rich-article iframe {
                      height: 240px;
                    }
                  }
                  .rich-article img {
                    display: block;
                    margin: 1.25rem auto;
                    max-width: 100%;
                    height: auto;
                    border-radius: 12px;
                    object-fit: contain;
                  }
                  .rich-article figure {
                    margin: 1.5rem 0;
                    text-align: center;
                  }
                  .rich-article figcaption {
                    font-size: 0.9rem;
                    color: #6b7280;
                    margin-top: 0.5rem;
                  }
                  /* Fix layout for lists */
                  .rich-article ul,
                  .rich-article ol {
                    margin: 0.75rem 0;
                    padding-left: 1.5rem;
                    list-style-position: outside;
                  }
                  .rich-article ul {
                    list-style-type: disc;
                  }
                  .rich-article ol {
                    list-style-type: decimal;
                  }
                  .rich-article li {
                    margin: 0.25rem 0;
                    padding-left: 0.25rem;
                  }
                  .rich-article li > p {
                    margin: 0;
                    display: inline;
                  }
                  .rich-article li::marker {
                    color: #4b5563;
                  }
                  /* Fix spacing between ul and following images */
                  .rich-article ul + p,
                  .rich-article ol + p {
                    margin-top: 0.75rem;
                  }
                  .rich-article p + ul,
                  .rich-article p + ol {
                    margin-top: 0.75rem;
                  }
                  /* Tighter paragraphs */
                  .rich-article p {
                    margin: 0.75rem 0;
                    line-height: 1.75;
                    color: #374151;
                  }
                  /* Headings styling */
                  .rich-article h1 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    color: #111827;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 0.5rem;
                  }
                  .rich-article h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-top: 1.75rem;
                    margin-bottom: 0.75rem;
                    padding-left: 0.75rem;
                    border-left: 4px solid #3b82f6;
                  }
                  .rich-article h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #374151;
                    margin-top: 1.5rem;
                    margin-bottom: 0.5rem;
                  }
                  .rich-article h4 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #4b5563;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                  }
                  /* Strong & emphasis */
                  .rich-article strong {
                    font-weight: 600;
                    color: #1f2937;
                  }
                  .rich-article em {
                    font-style: italic;
                    color: #4b5563;
                  }
                  /* Links */
                  .rich-article a {
                    color: #2563eb;
                    text-decoration: none;
                    border-bottom: 1px solid transparent;
                    transition: all 0.2s ease;
                  }
                  .rich-article a:hover {
                    color: #1d4ed8;
                    border-bottom-color: #1d4ed8;
                  }
                  /* Code inline */
                  .rich-article code {
                    background-color: #f3f4f6;
                    color: #dc2626;
                    padding: 0.125rem 0.375rem;
                    border-radius: 0.25rem;
                    font-size: 0.875em;
                    font-family: ui-monospace, monospace;
                  }
                  /* Code block */
                  .rich-article pre {
                    background-color: #1f2937;
                    color: #f9fafb;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                    margin: 1rem 0;
                  }
                  .rich-article pre code {
                    background: none;
                    color: inherit;
                    padding: 0;
                  }
                  /* Blockquote */
                  .rich-article blockquote {
                    border-left: 4px solid #3b82f6;
                    background: linear-gradient(to right, #eff6ff, transparent);
                    padding: 1rem 1.25rem;
                    margin: 1rem 0;
                    border-radius: 0 0.5rem 0.5rem 0;
                    font-style: italic;
                    color: #4b5563;
                  }
                  .rich-article blockquote p {
                    margin: 0;
                  }
                  /* Horizontal rule */
                  .rich-article hr {
                    border: none;
                    height: 1px;
                    background: linear-gradient(to right, transparent, #d1d5db, transparent);
                    margin: 2rem 0;
                  }
                  /* Mark/highlight */
                  .rich-article mark {
                    background-color: #fef08a;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.125rem;
                  }
                  /* Subscript & superscript */
                  .rich-article sub,
                  .rich-article sup {
                    font-size: 0.75em;
                  }
                  /* Nested div containers */
                  .rich-article div {
                    margin: 0;
                  }
                  /* Better figure styling */
                  .rich-article figure.image {
                    margin: 1.5rem auto;
                    text-align: center;
                    max-width: 100%;
                  }
                  .rich-article figure.image img {
                    margin: 0 auto;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  }
                  .rich-article figure figcaption,
                  .rich-article figcaption {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-top: 0.75rem;
                    font-style: italic;
                    text-align: center;
                  }
                  /* Nested figcaption inside figcaption - remove extra styling */
                  .rich-article figcaption figure,
                  .rich-article figcaption figcaption {
                    margin: 0;
                    font-size: inherit;
                  }
                  /* List with better bullets */
                  .rich-article ul li::marker {
                    color: #3b82f6;
                    font-size: 1.2em;
                  }
                  .rich-article ol li::marker {
                    color: #3b82f6;
                    font-weight: 600;
                  }
                  /* Better spacing for list items with strong */
                  .rich-article li strong {
                    color: #1e40af;
                  }
                  /* Video iframe container */
                  .rich-article p:has(iframe) {
                    text-align: center;
                    margin: 1.5rem 0;
                  }
                  /* WordPress caption classes */
                  .rich-article .wp-caption {
                    max-width: 100%;
                    margin: 0;
                  }
                  .rich-article .wp-caption-text {
                    font-size: 0.875rem;
                    color: #6b7280;
                    font-style: italic;
                    margin-top: 0.5rem;
                  }
                  /* Override Tailwind flex classes that may reverse order */
                  .rich-article .flex-col-reverse {
                    flex-direction: column !important;
                  }
                  .rich-article .flex-row-reverse {
                    flex-direction: row !important;
                  }
                  .rich-article [class*="flex"] {
                    display: block !important;
                  }
                  /* Reset any problematic Tailwind classes */
                  .rich-article .w-fit {
                    width: 100% !important;
                  }
                  .rich-article .group {
                    display: block !important;
                  }
                  /* Image hover effect for lightbox */
                  .rich-article img {
                    cursor: pointer;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                  }
                  .rich-article img:hover {
                    transform: scale(1.03);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                  }
                `}</style>
              </section>
            )}
          </div>
        </main>
      </div>

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
          <SheetHeader>
            <SheetTitle className="text-left text-xl">
              {pendingAction === "buy" ? "Mua ngay" : "Thêm vào giỏ"}
            </SheetTitle>
          </SheetHeader>

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

          <div className="my-1 border-t border-gray-200 dark:border-neutral-700" />

          {showQuantitySelector && (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Số lượng:</span>
              <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
            </div>
          )}

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

      {/* Lightbox Modal */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={closeLightbox}
            aria-label="Đóng"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image container */}
          <div className="relative max-h-[90vh] max-w-[90vw] animate-in zoom-in-95 duration-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxSrc}
              alt="Phóng to ảnh"
              className="max-h-[90vh] max-w-[90vw] cursor-pointer rounded-lg object-contain shadow-2xl"
            />
          </div>

          {/* Click anywhere hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
            Nhấn vào bất kỳ đâu hoặc phím ESC để đóng
          </div>
        </div>
      )}
    </>
  );
}
