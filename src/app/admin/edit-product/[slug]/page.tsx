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
  Link2,
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
import Link from "next/link";
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
export default function EditProductPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isAddingImageFromLink, setIsAddingImageFromLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [initialState, setInitialState] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState(false);
  const [descLength, setDescLength] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const editorInitialized = useRef(false);
  const DESC_LIMIT = 500;
  const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
  const MAX_IMAGE_WIDTH = 1024;

  const [hasArticle, setHasArticle] = useState(false);
  const [articleContent, setArticleContent] = useState("");

  const [productData, setProductData] = useState({
    name: "",
    code: "",
    desc: "",
    price: "",
  });

  const [fieldError, setFieldError] = useState({
    name: "",
    code: "",
    desc: "",
    price: "",
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

  async function processImageFile(file: File): Promise<File> {
    if (file.size <= MAX_IMAGE_SIZE) {
      return file;
    }

    return new Promise((resolve) => {
      const img = document.createElement("img");
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement("canvas");
        const targetWidth = Math.min(MAX_IMAGE_WIDTH, img.width);
        const scale = targetWidth / img.width;
        canvas.width = targetWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compress = (quality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              if (blob.size <= MAX_IMAGE_SIZE || quality <= 0.3) {
                resolve(
                  new File([blob], file.name, {
                    type: "image/jpeg",
                  }),
                );
              } else {
                compress(quality - 0.1);
              }
            },
            "image/jpeg",
            quality,
          );
        };

        compress(0.8);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
    });
  }

  async function handleAddImageFromLink() {
    const rawUrl = imageUrlInput.trim();
    if (!rawUrl) {
      toast.error("Vui lòng nhập link ảnh");
      return;
    }

    try {
      void new URL(rawUrl);
    } catch {
      toast.error("Link ảnh không hợp lệ");
      return;
    }

    setIsAddingImageFromLink(true);

    try {
      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error("FETCH_FAILED");
      }

      const blob = await response.blob();
      const headerMime = response.headers.get("content-type") || "";
      const detectedMime = blob.type || headerMime;

      if (detectedMime && !detectedMime.startsWith("image/")) {
        throw new Error("INVALID_TYPE");
      }

      const extension = detectedMime
        ? detectedMime.split("/")[1]?.split("+")[0] || "jpg"
        : "jpg";
      const fileName = `image-link-${Date.now()}.${extension}`;
      const file = new File([blob], fileName, {
        type: detectedMime || "image/jpeg",
      });

      const processedFile = await processImageFile(file);

      setImages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          file: processedFile,
          url: URL.createObjectURL(processedFile),
          isExisting: false,
        },
      ]);
      setFieldError((prev) => ({ ...prev, images: "" }));
      setImageUrlInput("");
    } catch (error) {
      console.error("Không thể tải ảnh từ link:", error);
      toast.error("Không thể tải ảnh từ link đã nhập");
    } finally {
      setIsAddingImageFromLink(false);
    }
  }

  const { data: productsData = [] } = useSWR<Product[]>(
    "/api/products",
    fetcher,
    {
      revalidateOnMount: false,
      revalidateOnFocus: false,
    },
  );
  const { data: categories = [] } = useSWR<Category[]>(
    "/api/categories",
    fetcher,
    {
      revalidateOnMount: false,
      revalidateOnFocus: false,
    },
  );

  useEffect(() => {
    if (activeImageId) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "";
    }
    return () => {
      document.body.style.cursor = "";
    };
  }, [activeImageId]);

  useEffect(() => {
    if (!productsData || !slug) return;

    // Find the product from cached list
    const foundProduct = productsData.find((p: Product) => p.slug === slug);

    if (!foundProduct) {
      toast.error("Sản phẩm không tồn tại");
      router.push("/admin/product-management");
      return;
    }

    const pData = foundProduct;

    setDescLength(pData.description?.length ?? 0);

    const categoryId =
      typeof pData.category === "object" ? pData.category._id : pData.category;

    setSelectedCategory(categoryId);

    const newProductData = {
      name: pData.name || "",
      code: pData.productCode || "",
      desc: pData.description || "",
      price: pData.price?.toString() || "",
    };

    setProductData(newProductData);

    const articleEnabled = pData.isArticleEnabled ?? false;
    const articleHtml = pData.articleHtml || "";

    setHasArticle(articleEnabled);
    setArticleContent(articleHtml);
    editorInitialized.current = false;

    // Process existing images
    const existingImages: ImageItem[] = [];
    if (pData.imageUrls && Array.isArray(pData.imageUrls)) {
      pData.imageUrls.forEach((url: string, index: number) => {
        existingImages.push({
          id: `existing-${index}`,
          url,
          isExisting: true,
        });
      });
    } else if (pData.imageUrls) {
      existingImages.push({
        id: "existing-0",
        url: pData.imageUrls,
        isExisting: true,
      });
    }
    setImages(existingImages);
    setProduct(pData);

    setInitialState({
      name: newProductData.name,
      code: newProductData.code,
      desc: newProductData.desc,
      price: newProductData.price,
      category: categoryId,
      images: existingImages.map((img) => ({
        id: img.id,
        url: img.url,
        isExisting: img.isExisting,
      })),
      hasArticle: articleEnabled,
      articleContent: normalizeHtml(articleHtml),
    });
  }, [productsData, slug, router]);

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

  const isHtmlEmpty = (html: string): boolean => {
    if (!html || !html.trim()) return true

    // Remove all HTML tags and decode HTML entities
    const text = html
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
      .replace(/&[a-z]+;/gi, "") // Remove other HTML entities
      .trim()

    return text.length === 0
  }

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
      productData.price !== initialState.price ||
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
    const isCategoryValid = validateField("category", selectedCategory);

    if (
      !isNameValid ||
      !isCodeValid ||
      !isDescValid ||
      !isPriceValid ||
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
      toast.error("Vui lòng nhập nội dung bài viết chi tiết hoặc tắt tính năng này");
      return;
    }

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
      try {
        const revalidateRes = await fetch("/api/revalidate", {
          method: "POST",
        });
        const revalidateData = await revalidateRes.json();
        if (revalidateData.success) {
          console.log("✅ Revalidated toàn bộ cache ISR thành công!");
        } else {
          console.warn("⚠️ Revalidate thất bại:", revalidateData.error);
        }
      } catch (err) {
        console.error("⚠️ Lỗi khi gọi API revalidate:", err);
      }
      router.push("/admin/product-management");
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
      setSelectedCategory(newCat._id);
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
            <Link
              href="/admin/product-management"
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-400 hover:shadow-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Về trang quản lý
            </Link>
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
            <div className="grid gap-2">
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
                className={`max-w-40 ${fieldError.price ? "border-red-500" : ""}`}
              />
              {fieldError.price && (
                <p className="text-sm text-red-500">{fieldError.price}</p>
              )}
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
                    <SelectItem key={c._id} value={c._id}>
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
                  e.target.value = "";
                }}
                className="hidden"
              />

              <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-4">
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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <Input
                    placeholder="Dán link ảnh (https://...)"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleAddImageFromLink();
                      }
                    }}
                    className="max-w-md"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isAddingImageFromLink}
                    onClick={() => void handleAddImageFromLink()}
                    className="flex items-center gap-2"
                  >
                    {isAddingImageFromLink ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" /> Thêm từ link
                      </>
                    )}
                  </Button>
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
              className="w-full sm:w-[300px] disabled:cursor-not-allowed"
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
