/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, ImageIcon } from "lucide-react";
import { toast } from "sonner";

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

export default function AddProductPage() {
  const formRef = useRef<HTMLFormElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dupErr, setDupErr] = useState<{ name?: boolean; code?: boolean }>({});
  const [categoryError, setCategoryError] = useState(false);
  const [descLength, setDescLength] = useState(0);
  const DESC_LIMIT = 500;


  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories))
      .catch(() => toast.error("Không thể tải danh mục"));
  }, []);

  function resetForm() {
    formRef.current?.reset();
    setImage(null);
    setPreviewUrl(null);
    setSelectedCategory("");
    setNewCategoryName("");
    setDupErr({});
    setCategoryError(false);
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
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        toast.error("Phản hồi không hợp lệ từ server");
        return;
      }

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
      className="container mx-auto max-w-2xl py-2"
    >
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Thêm sản phẩm</CardTitle>
          <CardDescription>Tạo mới sản phẩm vào cửa hàng</CardDescription>
        </CardHeader>

        <form ref={formRef} onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Tên sản phẩm */}
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                name="name"
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
                min="0"
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

            {/* Thêm danh mục mới */}
            <div className="flex items-end gap-2">
              <Input
                placeholder="Tên loại mới"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
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
              <Label htmlFor="image">Ảnh sản phẩm</Label>

              {/* Input ẩn */}
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  if (!file.type.startsWith("image/")) {
                    toast.error("Chỉ chấp nhận tệp ảnh");
                    return;
                  }

                  if (file.size <= 2 * 1024 * 1024) {
                    setImage(file);
                    setPreviewUrl(URL.createObjectURL(file));
                    return;
                  }

                  const reader = new FileReader();
                  reader.readAsDataURL(file);
                  reader.onload = () => {
                    const img = document.createElement("img");
                    img.src = reader.result as string;

                    img.onload = () => {
                      const MAX_WIDTH = 1024;
                      const scale = MAX_WIDTH / img.width;
                      const width = Math.min(img.width, MAX_WIDTH);
                      const height = img.height * scale;

                      const canvas = document.createElement("canvas");
                      canvas.width = width;
                      canvas.height = height;

                      const ctx = canvas.getContext("2d");
                      if (!ctx) {
                        toast.error("Lỗi khi xử lý ảnh");
                        return;
                      }

                      ctx.drawImage(img, 0, 0, width, height);

                      canvas.toBlob(
                        (blob) => {
                          if (!blob) {
                            toast.error("Không thể nén ảnh");
                            return;
                          }
                          const resizedFile = new File([blob], file.name, {
                            type: file.type,
                          });
                          setImage(resizedFile);
                          setPreviewUrl(URL.createObjectURL(blob));
                          toast.success("Ảnh đã được tự động giảm kích thước");
                        },
                        file.type,
                        0.8,
                      );
                    };

                    img.onerror = () => {
                      toast.error("Không thể đọc ảnh");
                    };
                  };

                  reader.onerror = () => {
                    toast.error("Lỗi khi đọc tệp ảnh");
                  };
                }}
                className="hidden"
              />

              {/* Nút chọn ảnh bo tròn + icon */}
              <div className="mb-4 flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image")?.click()}
                  className="flex items-center gap-2 rounded-full px-4 py-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  {image ? "Thay ảnh" : "Chọn ảnh"}
                </Button>

                <span className="text-muted-foreground max-w-[200px] truncate text-sm">
                  {image?.name || "Chưa chọn ảnh"}
                </span>
              </div>

              {/* Xem trước ảnh */}
              {previewUrl && (
                <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg border">
                  <Image
                    src={previewUrl}
                    alt="Ảnh xem trước"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
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
