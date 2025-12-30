/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { Product, Category } from "@/types/product";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  PlusCircle,
  ImageIcon,
  X,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TinyEditor from "@/components/tiny-editor";
import useSWR, { mutate } from "swr";

/* ---------- Types ---------- */
type ImageItem = {
  id: string;
  file?: File;
  url: string;
  isExisting?: boolean;
};

/* ---------- Message maps ---------- */
const MSG_PRODUCT: Record<string, string> = {
  DUP_NAME: "Tên sản phẩm đã tồn tại",
  DUP_CODE: "Mã sản phẩm đã tồn tại",
  NOT_FOUND: "Sản phẩm không tồn tại",
  UPDATE_FAILED: "Cập nhật thất bại",
};

const MSG_CATEGORY: Record<string, string> = {
  MISSING_NAME: "Tên danh mục là bắt buộc",
  DUP_NAME: "Tên danh mục đã tồn tại",
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());
/* ---------- Sortable Image Component ---------- */
function SortableImage({
  id,
  url,
  index,
  onRemove,
  activeImageId,
  isExisting = false,
}: {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
  activeImageId: string | null;
  isExisting?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
    opacity: id === activeImageId ? 0 : 1,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-300 md:h-28 md:w-28"
      {...attributes}
      {...listeners}
    >
      <Image
        src={url || "/images/placeholder.svg"}
        alt={`Ảnh ${index + 1}`}
        fill
        unoptimized
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        className="object-contain"
      />
      {index === 0 && (
        <span className="absolute top-1 left-1 rounded bg-blue-600 px-1 py-[1px] text-xs text-white shadow">
          Ảnh bìa
        </span>
      )}
      {isExisting && (
        <span className="absolute bottom-1 left-1 rounded bg-green-600 px-1 py-[1px] text-xs text-white shadow">
          Cũ
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="bg-opacity-60 absolute top-2 right-2 z-10 cursor-pointer rounded-full bg-black p-1 text-white opacity-0 transition group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ---------- Main Component ---------- */
/* ---------- Main Component ---------- */
interface EditProductClientProps {
  initialProduct: Product;
  initialCategories: Category[];
}

const normalizeHtml = (html: string): string => {
  if (!html) return "";
  // Remove extra whitespace, newlines, and normalize spacing
  return html
    .trim()
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s+>/g, ">")
    .replace(/<\s+/g, "<");
};

export default function EditProductClient({
  initialProduct,
  initialCategories,
}: EditProductClientProps) {
  const router = useRouter();
  // slug is still useful for routing changes but data comes from props
  const { slug } = useParams<{ slug: string }>();

  // Initialize state directly from props
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [loading, setLoading] = useState(false);

  // Categories SWR with fallback data
  const { data: categories = [] } = useSWR<Category[]>(
    "/api/categories",
    fetcher,
    {
      fallbackData: initialCategories,
      revalidateOnMount: false,
      revalidateOnFocus: false,
    },
  );

  // Form states initialized from product prop
  const [selectedCategory, setSelectedCategory] = useState<string>(
    typeof initialProduct.category === "object"
      ? initialProduct.category.id
      : (initialProduct.category as string),
  );

  // Initialize images
  const initialImages: ImageItem[] = (
    (Array.isArray(initialProduct.imageUrls)
      ? initialProduct.imageUrls
      : initialProduct.imageUrls
        ? [initialProduct.imageUrls]
        : []) as string[]
  ).map((url: string, index: number) => ({
    id: `existing-${index}`,
    url,
    isExisting: true,
  }));

  const [images, setImages] = useState<ImageItem[]>(initialImages);

  const [productData, setProductData] = useState({
    name: initialProduct.name || "",
    code: initialProduct.productCode || "",
    desc: initialProduct.description || "",
    price: initialProduct.price?.toString() || "",
    originalPrice: initialProduct.originalPrice?.toString() || "",
  });

  const [hasArticle, setHasArticle] = useState(
    initialProduct.isArticleEnabled ?? false,
  );
  const [articleContent, setArticleContent] = useState(
    initialProduct.articleHtml || "",
  );

  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState(false);
  const [descLength, setDescLength] = useState(
    initialProduct.description?.length ?? 0,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const editorInitialized = useRef(false);
  const DESC_LIMIT = 500;
  const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
  const MAX_IMAGE_WIDTH = 1024;

  // Initial State for change detection
  const [initialState, setInitialState] = useState({
    name: productData.name,
    code: productData.code,
    desc: productData.desc,
    price: productData.price,
    originalPrice: productData.originalPrice,
    category: selectedCategory,
    images: initialImages.map((img) => ({
      id: img.id,
      url: img.url,
      isExisting: img.isExisting,
    })),
    hasArticle: hasArticle,
    articleContent:
      typeof window !== "undefined"
        ? normalizeHtml(articleContent)
        : articleContent,
  });

  // State for changes
  const [hasChanges, setHasChanges] = useState(false);

  const [fieldError, setFieldError] = useState({
    name: "",
    code: "",
    desc: "",
    price: "",
    originalPrice: "",
    category: "",
    images: "",
  });

  const validateField = (field: string, value: string) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value.trim()) error = "Vui lòng nhập tên sản phẩm";
        break;
      case "code":
        if (!value.trim()) error = "Vui lòng nhập mã sản phẩm";
        break;
      case "desc":
        if (!value.trim()) error = "Vui lòng nhập mô tả ngắn";
        break;
      case "price":
        if (!value.trim()) error = "Vui lòng nhập giá sản phẩm";
        else if (Number(value) <= 0) error = "Giá phải lớn hơn 0";
        break;
      case "originalPrice":
        if (value && Number(value) <= Number(productData.price)) {
          error = "Giá trước giảm phải lớn hơn giá bán";
        }
        break;
      case "category":
        if (!value.trim()) error = "Vui lòng chọn loại sản phẩm";
        break;
    }

    setFieldError((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  // Drag & Drop
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const activeImage = images.find((img) => img.id === activeImageId);

  // Helper function to process and compress image
  async function processImageFile(file: File): Promise<File> {
    let finalFile = file;

    if (file.size > MAX_IMAGE_SIZE) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);

      await new Promise<void>((resolve) => {
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const scale = MAX_IMAGE_WIDTH / img.width;
          canvas.width = MAX_IMAGE_WIDTH;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            async function process(blob) {
              if (!blob) return resolve();

              if (blob.size <= 1024 * 1024) {
                finalFile = new File([blob], file.name, {
                  type: "image/jpeg",
                });
                return resolve();
              }

              let quality = 0.7;
              const tryCompress = () => {
                canvas.toBlob(
                  (compressedBlob) => {
                    if (compressedBlob && compressedBlob.size <= 1024 * 1024) {
                      finalFile = new File([compressedBlob], file.name, {
                        type: "image/jpeg",
                      });
                      resolve();
                    } else if (quality > 0.3) {
                      quality -= 0.1;
                      tryCompress();
                    } else {
                      finalFile = new File([compressedBlob!], file.name, {
                        type: "image/jpeg",
                      });
                      resolve();
                    }
                  },
                  "image/jpeg",
                  quality,
                );
              };

              tryCompress();
            },
            "image/jpeg",
            0.8,
          );
        };
      });
    }

    return finalFile;
  }

  // Helper function to add images to state
  async function addImages(files: File[]) {
    if (files.length === 0) return;

    const newImages: ImageItem[] = [];

    for (const file of files) {
      const finalFile = await processImageFile(file);
      newImages.push({
        id: crypto.randomUUID(),
        file: finalFile,
        url: URL.createObjectURL(finalFile),
        isExisting: false,
      });
    }

    setImages((prev) => [...prev, ...newImages]);
    setFieldError((prev) => ({ ...prev, images: "" }));
  }

  // Handle paste event
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Only handle paste if no input/textarea/editor is focused
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA" ||
        activeElement?.getAttribute("contenteditable") === "true" ||
        activeElement?.closest('[contenteditable="true"]') !== null;

      if (isInputFocused) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        // Handle image files from clipboard
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      // Handle text (URL) from clipboard
      if (files.length === 0) {
        const text = e.clipboardData?.getData("text");
        if (text) {
          // Check if it's a URL
          try {
            const url = new URL(text);
            // Check if it's an image URL
            const imageExtensions =
              /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
            if (
              imageExtensions.test(url.pathname) ||
              text.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)/i)
            ) {
              try {
                const response = await fetch(text, { mode: "cors" });
                if (response.ok) {
                  const blob = await response.blob();
                  if (blob.type.startsWith("image/")) {
                    const fileName =
                      url.pathname.split("/").pop() || "pasted-image.jpg";
                    const file = new File([blob], fileName, {
                      type: blob.type,
                    });
                    files.push(file);
                  }
                }
              } catch (err) {
                console.error("Failed to fetch image from URL:", err);
                toast.error("Không thể tải ảnh từ URL này");
              }
            }
          } catch {
            // Not a valid URL, ignore
          }
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        await addImages(files);
        toast.success(`Đã thêm ${files.length} ảnh từ clipboard`);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (Keeping other validation and helper functions)

  const isHtmlEmpty = (html: string): boolean => {
    if (!html || !html.trim()) return true;

    // Remove all HTML tags and decode HTML entities
    const text = html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&[a-z]+;/gi, "") // Remove other HTML entities
      .trim();

    return text.length === 0;
  };

  useEffect(() => {
    if (
      !editorInitialized.current &&
      initialState &&
      hasArticle &&
      articleContent
    ) {
      // Wait a bit for TinyEditor to fully initialize and normalize content
      const timer = setTimeout(() => {
        editorInitialized.current = true;
        setInitialState((prev: any) => ({
          ...prev,
          articleContent: normalizeHtml(articleContent),
        }));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [articleContent, hasArticle, initialState]);

  useEffect(() => {
    if (!initialState || !initialState.name || !initialState.images) {
      setHasChanges(false);
      return;
    }

    // Compare images by their serializable properties only (not File objects)
    const currentImagesState = images.map((img) => ({
      id: img.id,
      url: img.url,
      isExisting: img.isExisting,
    }));

    const imagesChanged =
      JSON.stringify(currentImagesState) !==
      JSON.stringify(initialState.images);

    const articleChanged =
      hasArticle !== initialState.hasArticle ||
      (hasArticle &&
        normalizeHtml(articleContent) !==
          normalizeHtml(initialState.articleContent));

    const changed =
      productData.name !== initialState.name ||
      productData.code !== initialState.code ||
      productData.desc !== initialState.desc ||
      productData.desc !== initialState.desc ||
      productData.price !== initialState.price ||
      productData.originalPrice !== initialState.originalPrice ||
      selectedCategory !== initialState.category ||
      articleChanged ||
      imagesChanged;

    setHasChanges(changed);
  }, [
    productData,
    selectedCategory,
    images,
    hasArticle,
    articleContent,
    initialState,
  ]);

  // Cảnh báo khi reload hoặc tắt tab
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasChanges) {
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasChanges]);

  async function uploadArticleImages(
    htmlContent: string,
    productCode: string,
  ): Promise<string> {
    if (!htmlContent) return htmlContent;

    const blobUrls = Array.from(
      htmlContent.matchAll(/src="(blob:[^"]+)"/g),
      (m) => m[1],
    );

    let updatedContent = htmlContent;

    for (const blobUrl of blobUrls) {
      try {
        const blob = await fetch(blobUrl).then((r) => r.blob());
        const file = new File([blob], "image.jpg", { type: blob.type });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("productCode", productCode);

        const res = await fetch("/api/products/article-upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();

        if (data?.url) {
          updatedContent = updatedContent.replaceAll(blobUrl, data.url);
        }
      } catch (err) {
        console.error("❌ Upload ảnh bài viết thất bại:", err);
      }
    }

    return updatedContent;
  }

  /* === Submit form === */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;

    const isNameValid = validateField("name", productData.name);
    const isCodeValid = validateField("code", productData.code);
    const isDescValid = validateField("desc", productData.desc);
    const isPriceValid = validateField("price", productData.price);
    const isOriginalPriceValid = validateField(
      "originalPrice",
      productData.originalPrice,
    );
    const isCategoryValid = validateField("category", selectedCategory);

    if (
      !isNameValid ||
      !isCodeValid ||
      !isDescValid ||
      !isPriceValid ||
      !isOriginalPriceValid ||
      !isCategoryValid
    ) {
      toast.error("Vui lòng nhập đầy đủ thông tin sản phẩm");
      return;
    }

    if (images.length === 0) {
      setFieldError((prev) => ({
        ...prev,
        images: "Vui lòng thêm ít nhất 1 ảnh",
      }));
      toast.error("Vui lòng thêm ít nhất 1 ảnh sản phẩm");
      return;
    } else {
      setFieldError((prev) => ({ ...prev, images: "" }));
    }

    if (hasArticle && isHtmlEmpty(articleContent)) {
      toast.error(
        "Vui lòng nhập nội dung bài viết chi tiết hoặc tắt tính năng này",
      );
      return;
    }

    // ✅ Server-side handles duplicate checks more reliably now.
    // We removed the client-side check against the full list because we no longer
    // fetch the full list (for performance reasons).

    // (Optimization: Client-side duplicate check removed)

    const confirmUpdate = window.confirm(
      "Bạn có chắc chắn muốn cập nhật sản phẩm này không?",
    );
    if (!confirmUpdate) return;

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("category", selectedCategory);

    let finalArticleContent = articleContent;
    if (hasArticle && articleContent) {
      const productCode = (formData.get("productCode") as string)?.trim();
      if (productCode) {
        finalArticleContent = await uploadArticleImages(
          articleContent,
          productCode,
        );
      }
    }

    formData.set("articleHtml", hasArticle ? finalArticleContent : "");
    formData.set("isArticleEnabled", hasArticle.toString());

    // Classify old and new images
    const keptImageUrls: string[] = [];
    const newImages: File[] = [];

    images.forEach((img) => {
      if (img.isExisting) {
        keptImageUrls.push(img.url);
      } else if (img.file) {
        newImages.push(img.file);
      }
    });

    keptImageUrls.forEach((url) => {
      formData.append("keptImageUrls", url);
    });

    newImages.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch(`/api/products/${product.slug}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(MSG_PRODUCT[data.code] ?? "Cập nhật thất bại");
        return;
      }

      toast.success("Sản phẩm đã được cập nhật");
      setHasChanges(false);

      router.refresh(); // Refresh client cache

      // Delay navigation slightly to let the user see the success message
      setTimeout(() => {
        router.push("/admin/product-management");
      }, 500);
    } catch {
      toast.error("Lỗi hệ thống, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  /* === Add new category === */
  async function handleAddCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return toast("Hãy nhập tên danh mục");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "DUP_NAME") {
          setCategoryError(true);
        }
        toast.error(MSG_CATEGORY[data.code] ?? "Không thể tạo danh mục");
        return;
      }

      const newCat = data.category;
      mutate(
        "/api/categories",
        (cats: Category[] = []) => [...cats, newCat],
        false,
      );
      setSelectedCategory(newCat.id);
      setNewCategoryName("");
      setCategoryError(false);
      toast.success("Đã thêm danh mục mới");
    } catch {
      toast.error("Lỗi hệ thống khi thêm danh mục");
    }
  }

  /* === Reset form === */
  function handleReset() {
    if (!initialState) return;

    formRef.current?.reset();

    setSelectedCategory(initialState.category);
    setProductData({
      name: initialState.name,
      code: initialState.code,
      desc: initialState.desc,
      price: initialState.price,
      originalPrice: initialState.originalPrice,
    });

    // Restore images from initial state
    const restoredImages = initialState.images.map((img: any) => ({
      id: img.id,
      url: img.url,
      isExisting: img.isExisting,
    }));
    setImages(restoredImages);

    setHasArticle(initialState.hasArticle);
    setArticleContent(initialState.articleContent);
    setDescLength(initialState.desc?.length ?? 0);
    editorInitialized.current = false;

    setNewCategoryName("");
    setCategoryError(false);

    setFieldError({
      name: "",
      code: "",
      desc: "",
      price: "",
      originalPrice: "",
      category: "",
      images: "",
    });

    toast.success("Đã khôi phục về trạng thái ban đầu");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="container mx-auto max-w-6xl py-2"
    >
      <Card className="rounded-2xl shadow-lg">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">Chỉnh sửa sản phẩm</CardTitle>
            <CardDescription>Cập nhật thông tin sản phẩm</CardDescription>
          </div>

          <div className="flex gap-2">
            {/* Reset button */}
            <Button
              variant="destructive"
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium shadow-sm hover:shadow-lg disabled:cursor-not-allowed"
              onClick={() => {
                if (
                  confirm(
                    "Bạn có chắc muốn reset tất cả dữ liệu về trạng thái ban đầu?",
                  )
                ) {
                  handleReset();
                }
              }}
              disabled={loading || !hasChanges}
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>

            {/* Back to management button */}
            <button
              type="button"
              onClick={() => {
                if (hasChanges) {
                  const confirmLeave = window.confirm(
                    "Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này?",
                  );
                  if (!confirmLeave) return;
                }
                router.push("/admin/product-management");
              }}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-400 hover:shadow-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Về trang quản lý
            </button>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit} ref={formRef}>
          <CardContent className="space-y-4">
            {/* Product name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                name="name"
                value={productData.name}
                onChange={(e) => {
                  const value = e.target.value;
                  setProductData((p) => ({ ...p, name: value }));
                  validateField("name", value);
                }}
                onBlur={(e) => validateField("name", e.target.value)}
                className={`max-w-xl ${fieldError.name ? "border-red-500" : ""}`}
              />
              {fieldError.name && (
                <p className="text-sm text-red-500">{fieldError.name}</p>
              )}
            </div>

            {/* Product code */}
            <div className="grid gap-2">
              <Label htmlFor="code">Mã sản phẩm</Label>
              <Input
                id="code"
                name="productCode"
                value={productData.code}
                onChange={(e) => {
                  const value = e.target.value;
                  setProductData((p) => ({ ...p, code: value }));
                  validateField("code", value);
                }}
                onBlur={(e) => validateField("code", e.target.value)}
                className={`max-w-50 ${fieldError.code ? "border-red-500" : ""}`}
              />
              {fieldError.code && (
                <p className="text-sm text-red-500">{fieldError.code}</p>
              )}
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="desc">Mô tả ngắn</Label>
              <Textarea
                id="desc"
                name="description"
                rows={4}
                value={productData.desc}
                maxLength={DESC_LIMIT}
                onChange={(e) => {
                  const value = e.target.value;
                  setProductData((p) => ({ ...p, desc: value }));
                  setDescLength(value.length);
                  validateField("desc", value);
                }}
                onBlur={(e) => validateField("desc", e.target.value)}
                className={fieldError.desc ? "border-red-500" : ""}
              />
              {fieldError.desc && (
                <p className="text-sm text-red-500">{fieldError.desc}</p>
              )}
              <div className="text-muted-foreground text-right text-sm">
                {descLength}/{DESC_LIMIT} ký tự
              </div>
            </div>

            {/* Price */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="relative grid gap-2">
                <Label htmlFor="price">Giá (VNĐ)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="1000"
                  min="0"
                  value={productData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    setProductData((p) => ({ ...p, price: value }));
                    validateField("price", value);
                  }}
                  onBlur={(e) => validateField("price", e.target.value)}
                  className={`max-w-full ${fieldError.price ? "border-red-500" : ""}`}
                />
                {fieldError.price && (
                  <p className="absolute top-full left-0 text-sm text-red-500">
                    {fieldError.price}
                  </p>
                )}
              </div>
              <div className="relative grid gap-2">
                <Label htmlFor="originalPrice">
                  Giá trước giảm (VNĐ){" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    (Tuỳ chọn)
                  </span>
                </Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  step="1000"
                  min="0"
                  value={productData.originalPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    setProductData((p) => ({ ...p, originalPrice: value }));
                    if (fieldError.originalPrice) {
                      setFieldError((prev) => ({ ...prev, originalPrice: "" }));
                    }
                  }}
                  onBlur={(e) => {
                    // Re-validate against current price
                    if (
                      e.target.value &&
                      Number(e.target.value) <= Number(productData.price)
                    ) {
                      setFieldError((prev) => ({
                        ...prev,
                        originalPrice: "Giá trước giảm phải lớn hơn giá bán",
                      }));
                    } else {
                      validateField("originalPrice", e.target.value);
                    }
                  }}
                  className={fieldError.originalPrice ? "border-red-500" : ""}
                />
                {fieldError.originalPrice && (
                  <p className="absolute top-full left-0 text-sm text-red-500">
                    {fieldError.originalPrice}
                  </p>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label>Loại sản phẩm</Label>
              <Select
                key={selectedCategory}
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  setCategoryError(false);
                  validateField("category", val);
                }}
              >
                <SelectTrigger
                  className={fieldError.category ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Chọn loại sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError.category && (
                <p className="text-sm text-red-500">{fieldError.category}</p>
              )}
            </div>

            {/* Add new category */}
            <div className="flex items-end gap-2">
              <Input
                placeholder="Tên loại mới"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  setCategoryError(false);
                }}
                className={`max-w-sm ${categoryError ? "border-red-500" : ""}`}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddCategory}
              >
                <PlusCircle className="mr-1 h-4 w-4" /> Thêm danh mục
              </Button>
            </div>

            {/* Product images */}
            <div className="grid gap-2">
              <Label htmlFor="images">Ảnh sản phẩm</Label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;
                  await addImages(files);
                  e.target.value = "";
                }}
                className="hidden"
              />

              <div className="mb-4 space-y-3">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("images")?.click()}
                    className="flex items-center gap-2 rounded-full px-4 py-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Thêm ảnh
                  </Button>
                  {fieldError.images && (
                    <p className="text-sm text-red-500">{fieldError.images}</p>
                  )}
                  <span className="text-muted-foreground max-w-[200px] truncate text-sm">
                    {images.length > 0 ? `${images.length} ảnh` : "Chưa có ảnh"}
                  </span>
                </div>

                {/* Paste area */}
                <div
                  ref={pasteAreaRef}
                  tabIndex={0}
                  className="flex min-h-[100px] w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center transition-colors hover:border-gray-400 hover:bg-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  onFocus={(e) =>
                    e.currentTarget.classList.add("ring-2", "ring-blue-500")
                  }
                  onBlur={(e) =>
                    e.currentTarget.classList.remove("ring-2", "ring-blue-500")
                  }
                >
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">
                      Hoặc dán ảnh vào đây (Ctrl + V)
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Có thể paste ảnh từ clipboard hoặc URL ảnh
                    </p>
                  </div>
                </div>
              </div>

              <DndContext
                collisionDetection={closestCenter}
                sensors={sensors}
                onDragStart={({ active }) => {
                  setActiveImageId(active.id as string);
                }}
                onDragEnd={({ active, over }) => {
                  setActiveImageId(null);
                  if (!over || active.id === over.id) return;

                  const oldIndex = images.findIndex(
                    (img) => img.id === active.id,
                  );
                  const newIndex = images.findIndex(
                    (img) => img.id === over.id,
                  );

                  if (oldIndex !== -1 && newIndex !== -1) {
                    setImages((prev) => arrayMove(prev, oldIndex, newIndex));
                  }
                }}
                onDragCancel={() => setActiveImageId(null)}
              >
                <SortableContext
                  items={images.map((i) => i.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="flex flex-wrap items-start gap-2">
                    {images.map((img, idx) => (
                      <SortableImage
                        key={img.id}
                        id={img.id}
                        url={img.url}
                        index={idx}
                        activeImageId={activeImageId}
                        isExisting={img.isExisting}
                        onRemove={() => {
                          setImages((prev) =>
                            prev.filter((i) => i.id !== img.id),
                          );
                        }}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeImage ? (
                    <div className="relative h-[120px] w-[120px] overflow-hidden rounded-lg border border-gray-300 bg-white shadow-md">
                      <Image
                        src={activeImage.url || "/images/placeholder.svg"}
                        alt="drag"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label
                    htmlFor="article-toggle"
                    className="text-base font-medium"
                  >
                    Bài viết chi tiết
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    Thêm bài viết chi tiết về sản phẩm (tùy chọn)
                  </p>
                </div>
                <Switch
                  id="article-toggle"
                  className="cursor-pointer"
                  checked={hasArticle}
                  onCheckedChange={setHasArticle}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: hasArticle ? 1 : 0,
                  height: hasArticle ? "auto" : 0,
                }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="space-y-2 overflow-hidden"
              >
                <Label>Nội dung bài viết</Label>
                <TinyEditor
                  value={articleContent}
                  onChange={setArticleContent}
                  placeholder="Viết bài viết chi tiết về sản phẩm..."
                />
              </motion.div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end pt-4">
            <Button
              type="submit"
              className="w-full disabled:cursor-not-allowed sm:w-[300px]"
              disabled={loading || !hasChanges}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                "Cập nhật sản phẩm"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
