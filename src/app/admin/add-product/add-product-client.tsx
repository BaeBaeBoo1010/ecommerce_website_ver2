"use client";

import { useEffect, useState } from "react";
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
import { Loader2, PlusCircle } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dupErr, setDupErr] = useState<{ name?: boolean; code?: boolean }>({});

  /* === Load categories once === */
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories))
      .catch(() => toast.error("Không thể tải danh mục"));
  }, []);

  /* === Add product === */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setDupErr({});

    const formData = new FormData(e.currentTarget);
    formData.set("category", selectedCategory);
    if (image) formData.append("image", image);

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
      e.currentTarget.reset();
      setImage(null);
      setPreviewUrl(null);
      setSelectedCategory("");
    } catch {
      toast.error("Lỗi hệ thống, thử lại sau");
    } finally {
      setLoading(false);
    }
  }

  /* === Add category inline === */
  async function handleAddCategory() {
    if (!newCategoryName.trim()) return toast("Nhập tên danh mục");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(MSG_CATEGORY[data.code] ?? "Không thể tạo danh mục");
        return;
      }

      setCategories((prev) => [...prev, data.category]);
      setSelectedCategory(data.category._id);
      setNewCategoryName("");
      toast.success("Đã thêm danh mục mới");
    } catch {
      toast.error("Lỗi hệ thống khi thêm danh mục");
    }
  }

  /* === UI === */
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto max-w-2xl py-10"
    >
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Thêm sản phẩm</CardTitle>
          <CardDescription>Tạo mới sản phẩm vào cửa hàng</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Tên sản phẩm</Label>
              <Input
                id="name"
                name="name"
                required
                className={dupErr.name ? "border-red-500" : ""}
              />
            </div>

            {/* code */}
            <div className="grid gap-2">
              <Label htmlFor="code">Mã sản phẩm</Label>
              <Input
                id="code"
                name="productCode"
                required
                className={dupErr.code ? "border-red-500" : ""}
              />
            </div>

            {/* desc */}
            <div className="grid gap-2">
              <Label htmlFor="desc">Mô tả</Label>
              <Textarea id="desc" name="description" rows={4} required />
            </div>

            {/* price */}
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

            {/* category select */}
            <div className="grid gap-2">
              <Label>Loại sản phẩm</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                required
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

            {/* add category */}
            <div className="flex items-end gap-2">
              <Input
                placeholder="Tên danh mục mới"
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

            {/* image */}
            <div className="grid gap-2">
              <Label htmlFor="image">Ảnh sản phẩm</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImage(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                required
              />
            </div>

            {previewUrl && (
              <div className="relative h-64 w-full overflow-hidden rounded-lg border">
                <Image
                  src={previewUrl}
                  alt="Ảnh xem trước"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            )}
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
