"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

/* ---------- Types ---------- */
interface Category {
  _id: string;
  name: string;
}
interface Product {
  name: string;
  productCode: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string | { _id: string };
}

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

/* ---------- Component ---------- */
export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [dupErr, setDupErr] = useState<{ name?: boolean; code?: boolean }>({});

  /* === Load product + categories === */
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

        setProduct(pData);
        setCategories(cData.categories);
        setSelectedCategory(
          typeof pData.category === "object"
            ? pData.category._id
            : pData.category,
        );
        setPreviewUrl(pData.imageUrl);
      } catch {
        toast.error("Lỗi tải dữ liệu, thử lại sau.");
      }
    })();
  }, [id, router]);

  /* === Submit update === */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    setDupErr({});

    const formData = new FormData(e.currentTarget);
    formData.set("category", selectedCategory);
    if (image) formData.append("image", image);

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

      toast.success("✅ Sản phẩm đã được cập nhật");
      router.push("/admin/product-management");
    } catch {
      toast.error("Lỗi hệ thống, vui lòng thử lại sau.");
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

  /* === Skeleton khi chưa load === */
  if (!product) {
    return (
      <div className="flex w-full justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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
          <CardTitle className="text-2xl">Chỉnh sửa sản phẩm</CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* name */}
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

            {/* code */}
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

            {/* desc */}
            <div className="grid gap-2">
              <Label htmlFor="desc">Mô tả</Label>
              <Textarea
                id="desc"
                name="description"
                rows={4}
                defaultValue={product.description}
                required
              />
            </div>

            {/* price */}
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

            {/* category */}
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
                placeholder="Tên loại mới"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddCategory}
              >
                <PlusCircle className="mr-1 h-4 w-4" /> Thêm loại
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
