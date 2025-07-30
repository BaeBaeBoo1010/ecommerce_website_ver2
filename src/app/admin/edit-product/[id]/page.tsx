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
import { Loader2, PlusCircle, ImageIcon, RotateCw, X } from "lucide-react";
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

/* ---------- Types ---------- */
type ImageItem = {
  id: string;
  file?: File;
  url: string;
  isExisting?: boolean; // để phân biệt ảnh cũ và ảnh mới
};

/* ---------- Bản đồ thông báo ---------- */
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
        src={url || "/placeholder.svg"}
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

/* ---------- Component chính ---------- */
export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [dupErr, setDupErr] = useState<{ name?: boolean; code?: boolean }>({});
  const [categoryError, setCategoryError] = useState(false);
  const [descLength, setDescLength] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const DESC_LIMIT = 500;

  // Drag & Drop
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const activeImage = images.find((img) => img.id === activeImageId);

  /* === Lấy dữ liệu sản phẩm và danh mục === */
  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch("/api/categories"),
        ]);

        const pData = await pRes.json();
        const cData = await cRes.json();

        if (!pRes.ok) {
          toast.error(MSG_PRODUCT[pData.code] ?? "Không thể tải sản phẩm");
          router.push("/admin/product-management");
          return;
        }

        setDescLength(pData.description?.length ?? 0);
        setCategories(cData.categories);
        setSelectedCategory(
          typeof pData.category === "object"
            ? pData.category._id
            : pData.category,
        );

        // Xử lý ảnh hiện tại
        const existingImages: ImageItem[] = [];
        if (pData.imageUrls && Array.isArray(pData.imageUrls)) {
          pData.imageUrls.forEach((url: string, index: number) => {
            existingImages.push({
              id: `existing-${index}`,
              url,
              isExisting: true,
            });
          });
        } else if (pData.imageUrl) {
          // Fallback cho trường hợp chỉ có 1 ảnh
          existingImages.push({
            id: "existing-0",
            url: pData.imageUrl,
            isExisting: true,
          });
        }
        setImages(existingImages);
        setProduct(pData);
      } catch {
        toast.error("Lỗi tải dữ liệu, thử lại sau.");
      }
    })();
  }, [id, router]);

  /* === Gửi form cập nhật sản phẩm === */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    setDupErr({});

    const formData = new FormData(e.currentTarget);
    formData.set("category", selectedCategory);

    // Phân loại ảnh cũ và ảnh mới
    const keptImageUrls: string[] = [];
    const newImages: File[] = [];

    images.forEach((img) => {
      if (img.isExisting) {
        keptImageUrls.push(img.url);
      } else if (img.file) {
        newImages.push(img.file);
      }
    });

    // Thêm ảnh cũ được giữ lại
    keptImageUrls.forEach((url) => {
      formData.append("keptImageUrls", url);
    });

    // Thêm ảnh mới
    newImages.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(MSG_PRODUCT[data.code] ?? "Cập nhật thất bại");
        if (res.status === 409 && data.field) {
          setDupErr({
            name: data.field === "name",
            code: data.field === "productCode",
          });
        }
        return;
      }

      toast.success("Sản phẩm đã được cập nhật");
      router.push("/admin/product-management");
    } catch {
      toast.error("Lỗi hệ thống, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  /* === Thêm danh mục mới === */
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
      setCategories((prev) => [...prev, newCat]);
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
    if (!product) return;

    formRef.current?.reset();
    setSelectedCategory(
      typeof product.category === "object"
        ? product.category._id
        : product.category,
    );

    // Reset ảnh về trạng thái ban đầu
    const existingImages: ImageItem[] = [];
    if (product.imageUrls && Array.isArray(product.imageUrls)) {
      product.imageUrls.forEach((url: string, index: number) => {
        existingImages.push({
          id: `existing-${index}`,
          url,
          isExisting: true,
        });
      });
    } else if (product.imageUrls) {
      existingImages.push({
        id: "existing-0",
        url: product.imageUrls,
        isExisting: true,
      });
    }
    setImages(existingImages);

    setDescLength(product.description?.length ?? 0);
    setNewCategoryName("");
    setDupErr({});
    setCategoryError(false);
  }

  if (!product) {
    return (
      <div className="flex w-full justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto max-w-2xl py-2"
    >
      <Card className="rounded-2xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Chỉnh sửa sản phẩm</CardTitle>
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={loading}
            className="text-sm"
          >
            <RotateCw className="h-4 w-4" />
            Đặt lại
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit} ref={formRef}>
          <CardContent className="space-y-6">
            {/* Tên sản phẩm */}
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product.name}
                required
                className={dupErr.name ? "border-red-500" : ""}
              />
            </div>

            {/* Mã sản phẩm */}
            <div className="grid gap-2">
              <Label htmlFor="code">Mã sản phẩm</Label>
              <Input
                id="code"
                name="productCode"
                defaultValue={product.productCode}
                required
                className={dupErr.code ? "border-red-500" : ""}
              />
            </div>

            {/* Mô tả */}
            <div className="grid gap-2">
              <Label htmlFor="desc">Mô tả</Label>
              <Textarea
                id="desc"
                name="description"
                rows={4}
                defaultValue={product.description}
                required
                maxLength={DESC_LIMIT}
                onChange={(e) => setDescLength(e.target.value.length)}
              />
              <div className="text-muted-foreground text-right text-sm">
                {descLength}/{DESC_LIMIT} ký tự
              </div>
            </div>

            {/* Giá */}
            <div className="grid gap-2">
              <Label htmlFor="price">Giá (VNĐ)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="1000"
                defaultValue={product.price}
                required
              />
            </div>

            {/* Loại sản phẩm */}
            <div className="grid gap-2">
              <Label>Loại sản phẩm</Label>
              <Select
                key={selectedCategory}
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                }}
              >
                <SelectTrigger>
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
            </div>

            {/* Thêm danh mục mới */}
            <div className="flex items-end gap-2">
              <Input
                placeholder="Tên loại mới"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value);
                  setCategoryError(false);
                }}
                className={categoryError ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddCategory}
              >
                <PlusCircle className="mr-1 h-4 w-4" /> Thêm danh mục
              </Button>
            </div>

            {/* Ảnh sản phẩm */}
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
                    let finalFile = file;

                    // Resize nếu ảnh lớn hơn 2MB
                    if (file.size > 2 * 1024 * 1024) {
                      const img = document.createElement("img");
                      img.src = URL.createObjectURL(file);
                      await new Promise((resolve) => {
                        img.onload = async () => {
                          const canvas = document.createElement("canvas");
                          const MAX_WIDTH = 1024;
                          const scale = MAX_WIDTH / img.width;
                          canvas.width = MAX_WIDTH;
                          canvas.height = img.height * scale;

                          const ctx = canvas.getContext("2d");
                          ctx?.drawImage(
                            img,
                            0,
                            0,
                            canvas.width,
                            canvas.height,
                          );

                          canvas.toBlob(
                            (blob) => {
                              if (blob) {
                                finalFile = new File([blob], file.name, {
                                  type: "image/jpeg",
                                });
                              }
                              resolve(true);
                            },
                            "image/jpeg",
                            0.8,
                          );
                        };
                      });
                    }

                    newImages.push({
                      id: crypto.randomUUID(),
                      file: finalFile,
                      url: URL.createObjectURL(finalFile),
                      isExisting: false,
                    });
                  }

                  setImages((prev) => [...prev, ...newImages]);
                  e.target.value = "";
                }}
                className="hidden"
              />

              <div className="mb-4 flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("images")?.click()}
                  className="flex items-center gap-2 rounded-full px-4 py-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  Thêm ảnh
                </Button>
                <span className="text-muted-foreground max-w-[200px] truncate text-sm">
                  {images.length > 0 ? `${images.length} ảnh` : "Chưa có ảnh"}
                </span>
              </div>

              {images.length > 0 && (
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
                          src={activeImage.url || "/placeholder.svg"}
                          alt="drag"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="flex-1" disabled={loading}>
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
