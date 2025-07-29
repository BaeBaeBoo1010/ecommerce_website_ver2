"use client";

import { useEffect, useRef, useState } from "react";
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
import { Loader2, PlusCircle, ImageIcon, RotateCw } from "lucide-react";
import { toast } from "sonner";

/* ---------- Kiểu dữ liệu ---------- */
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

/* ---------- Component chính ---------- */
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
  const [categoryError, setCategoryError] = useState(false); // chỉ cho ô thêm danh mục
  const [descLength, setDescLength] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
  const DESC_LIMIT = 500;


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
        setPreviewUrl(pData.imageUrl);
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

      toast.success("Sản phẩm đã được cập nhật");
      router.push("/admin/product-management");
    } catch {
      toast.error("Lỗi hệ thống, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  /* === Thêm danh mục mới (inline) === */
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

  if (!product) {
    return (
      <div className="flex w-full justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  function handleReset() {
    if (!product) return;

    // Reset form DOM
    formRef.current?.reset();

    // Reset các state liên quan
    setSelectedCategory(
      typeof product.category === "object"
        ? product.category._id
        : product.category,
    );
    setPreviewUrl(product.imageUrl);
    setImage(null);
    setDescLength(product.description.length);
    setNewCategoryName("");
    setDupErr({});
    setCategoryError(false);
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

                  // Nếu ảnh nhỏ hơn 2MB thì dùng luôn
                  if (file.size <= 2 * 1024 * 1024) {
                    setImage(file);
                    setPreviewUrl(URL.createObjectURL(file));
                    return;
                  }

                  // Resize ảnh nếu lớn hơn 2MB
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
                        0.8, // chất lượng nén: 80%
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
              <div className="flex items-center gap-4">
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
                  {image?.name || "Chưa chọn ảnh mới"}
                </span>
              </div>
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
