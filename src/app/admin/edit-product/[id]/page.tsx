"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

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
  category: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Tải sản phẩm và danh mục
  useEffect(() => {
    async function fetchData() {
      const res1 = await fetch(`/api/products/${id}`);
      const res2 = await fetch("/api/categories");
      const productData = await res1.json();
      const categoryData = await res2.json();

      setProduct(productData);
      setCategories(categoryData.categories);
      setPreviewUrl(productData.imageUrl);
    }

    fetchData();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (image) formData.append("image", image);

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      body: formData,
    });

    const result = await res.json();
    setLoading(false);
    if (result.success) {
      alert("✅ Cập nhật thành công!");
      router.push("/admin/product-management");
    } else {
      alert("❌ Cập nhật thất bại.");
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return alert("Nhập tên loại sản phẩm!");

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    });

    const result = await res.json();
    if (result.success) {
      const newCat = result.category;
      setCategories((prev) => [...prev, newCat]);
      setProduct((prev) => (prev ? { ...prev, category: newCat._id } : prev));
      setNewCategoryName("");
      alert("✅ Đã thêm loại sản phẩm mới!");
    } else {
      alert("❌ Không thể thêm loại sản phẩm.");
    }
  }

  if (!product) return <p className="p-6 text-gray-600">Đang tải dữ liệu...</p>;

  return (
    <div className="mx-auto mt-10 max-w-xl rounded-xl border p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">Chỉnh sửa sản phẩm</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          defaultValue={product.name}
          className="w-full rounded border p-2"
          required
        />

        <input
          name="productCode"
          defaultValue={product.productCode}
          className="w-full rounded border p-2"
          required
        />

        <textarea
          name="description"
          defaultValue={product.description}
          className="w-full rounded border p-2"
          required
        />

        <input
          name="price"
          type="number"
          step="0.01"
          defaultValue={product.price}
          className="w-full rounded border p-2"
          required
        />

        <select
          name="category"
          defaultValue={product.category}
          className="w-full rounded border p-2"
          required
        >
          <option value="">-- Chọn loại sản phẩm --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tên loại mới"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 rounded border p-2"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Thêm loại
          </button>
        </div>

        <input
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

        {previewUrl && (
          <div className="relative h-64 w-full overflow-hidden rounded border">
            <Image
              src={previewUrl}
              alt="Ảnh xem trước"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 cursor-pointer"
        >
          {loading ? "Đang lưu..." : "Cập nhật sản phẩm"}
        </button>
      </form>
    </div>
  );
}
