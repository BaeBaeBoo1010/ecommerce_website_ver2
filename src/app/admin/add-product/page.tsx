"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, PlusCircle, ImageIcon, X } from "lucide-react";
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
import RichTextEditor from "@/components/rich-text-editor";

/* ---------- Types ---------- */
interface Category {
  _id: string;
  name: string;
}

/* ---------- Message maps ---------- */
const MSG_PRODUCT: Record<string, string> = {
  DUP_NAME: "Tên sản phẩm đã tồn tại",
  DUP_CODE: "Mã sản phẩm đã tồn tại",
  MISSING_FIELD: "Thiếu dữ liệu bắt buộc",
};

const MSG_CATEGORY: Record<string, string> = {
  MISSING_NAME: "Tên danh mục là bắt buộc",
  DUP_NAME: "Tên danh mục đã tồn tại",
};

function SortableImage({
  id,
  url,
  index,
  onRemove,
  activeImageId,
}: {
  id: string;
  url: string;
  index: number;
  onRemove: () => void;
  activeImageId: string | null;
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

export default function AddProductPage() {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  type ImageItem = { id: string; file: File; url: string };
  const [images, setImages] = useState<ImageItem[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dupErr, setDupErr] = useState<{ name?: boolean; code?: boolean }>({});
  const [categoryError, setCategoryError] = useState(false);
  const [descLength, setDescLength] = useState(0);
  const DESC_LIMIT = 500;
  const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
  const MAX_IMAGE_WIDTH = 1024;

  // Rich text editor states
  const [hasArticle, setHasArticle] = useState(true);
  const [articleContent, setArticleContent] = useState(
    "<h1>Tiêu đề</h1><p>Đây là đoạn văn bản.</p><ul><li>Mục 1</li><li>Mục 2</li></ul>",
  );

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const [activeImageId, setActiveImageId] = useState<string | null>(null);

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

  const activeImage = images.find((img) => img.id === activeImageId);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories))
      .catch(() => toast.error("Không thể tải danh mục"));
  }, []);

  function resetForm() {
    formRef.current?.reset();
    setImages([]);
    setSelectedCategory("");
    setNewCategoryName("");
    setDupErr({});
    setCategoryError(false);
    setHasArticle(false);
    setArticleContent("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setDupErr({});

    if (!selectedCategory) {
      toast.error("Vui lòng chọn loại sản phẩm");
      setCategoryError(true);
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("category", selectedCategory);

    // Add article content if enabled
    if (hasArticle) {
      formData.set("articleContent", articleContent);
    }

    images.forEach((img) => {
      formData.append("images", img.file);
    });

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(MSG_PRODUCT[data.code] ?? "Không thể thêm sản phẩm");
        if (res.status === 409 && data.field) {
          setDupErr({
            name: data.field === "name",
            code: data.field === "productCode",
          });
        }
        return;
      }

      toast.success("🎉 Đã thêm sản phẩm");
      resetForm();
    } catch (error) {
      console.error("Lỗi hệ thống:", error);
      toast.error("Lỗi hệ thống, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCategory() {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return toast("Nhập tên danh mục");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(MSG_CATEGORY[data.code] ?? "Không thể tạo danh mục");
        return;
      }

      const newCat = data.category;
      setCategories((prev) => [...prev, newCat]);
      setSelectedCategory(newCat._id);
      setNewCategoryName("");
      toast.success("Đã thêm danh mục mới");
    } catch {
      toast.error("Lỗi hệ thống khi thêm danh mục");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto max-w-6xl py-2"
    >
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Thêm sản phẩm</CardTitle>
          <CardDescription>Tạo mới sản phẩm vào cửa hàng</CardDescription>
        </CardHeader>

        <form ref={formRef} onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                name="name"
                required
                className={`max-w-xl ${dupErr.name ? "border-red-500" : ""}`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Mã sản phẩm</Label>
              <Input
                id="code"
                name="productCode"
                required
                className={`max-w-50 ${dupErr.name ? "border-red-500" : ""}`}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Mô tả ngắn</Label>
              <Textarea
                id="desc"
                name="description"
                rows={4}
                required
                maxLength={DESC_LIMIT}
                onChange={(e) => setDescLength(e.target.value.length)}
              />
              <div className="text-muted-foreground text-right text-sm">
                {descLength}/{DESC_LIMIT} ký tự
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Giá (VNĐ)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="1000"
                min="0"
                className="max-w-40"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Loại sản phẩm</Label>
              <Select
                key={selectedCategory}
                value={selectedCategory}
                onValueChange={(val) => {
                  setSelectedCategory(val);
                  setCategoryError(false);
                }}
              >
                <SelectTrigger
                  className={categoryError ? "border-red-500" : ""}
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
            </div>
            <div className="flex items-end gap-2">
              <Input
                placeholder="Tên loại mới"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="max-w-sm"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddCategory}
              >
                <PlusCircle className="mr-1 h-4 w-4" /> Thêm danh mục
              </Button>
            </div>
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

                    if (file.size > MAX_IMAGE_SIZE) {
                      const img = document.createElement("img");
                      img.src = URL.createObjectURL(file);

                      await new Promise((resolve) => {
                        img.onload = async () => {
                          const canvas = document.createElement("canvas");
                          const scale = MAX_IMAGE_WIDTH / img.width;
                          canvas.width = MAX_IMAGE_WIDTH;
                          canvas.height = img.height * scale;

                          const ctx = canvas.getContext("2d");
                          ctx?.drawImage(
                            img,
                            0,
                            0,
                            canvas.width,
                            canvas.height,
                          );

                          // Nén và kiểm tra kích thước
                          canvas.toBlob(
                            async function process(blob) {
                              if (!blob) return resolve(true);

                              if (blob.size <= 1024 * 1024) {
                                finalFile = new File([blob], file.name, {
                                  type: "image/jpeg",
                                });
                                return resolve(true);
                              }

                              // Nếu lớn hơn 1MB, giảm chất lượng
                              let quality = 0.7;
                              const tryCompress = () => {
                                canvas.toBlob(
                                  (compressedBlob) => {
                                    if (
                                      compressedBlob &&
                                      compressedBlob.size <= 1024 * 1024
                                    ) {
                                      finalFile = new File(
                                        [compressedBlob],
                                        file.name,
                                        {
                                          type: "image/jpeg",
                                        },
                                      );
                                      resolve(true);
                                    } else if (quality > 0.3) {
                                      quality -= 0.1;
                                      tryCompress();
                                    } else {
                                      // Không giảm được nữa, dùng bản cuối
                                      finalFile = new File(
                                        [compressedBlob!],
                                        file.name,
                                        {
                                          type: "image/jpeg",
                                        },
                                      );
                                      resolve(true);
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

                    newImages.push({
                      id: crypto.randomUUID(),
                      file: finalFile,
                      url: URL.createObjectURL(finalFile),
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
                  {images.length > 0
                    ? `${images.length} ảnh đã chọn`
                    : "Chưa chọn ảnh"}
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
            {/* Rich Text Editor Section */}
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

              <AnimatePresence initial={false}>
                {hasArticle && (
                  <motion.div
                    key="rich-text"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label>Nội dung bài viết</Label>
                    <RichTextEditor
                      content={articleContent}
                      onChange={setArticleContent}
                      placeholder="Viết bài viết chi tiết về sản phẩm..."
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end pt-4">
            <Button
              type="submit"
              className="w-full sm:w-[300px]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang thêm...
                </>
              ) : (
                "Thêm sản phẩm"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
