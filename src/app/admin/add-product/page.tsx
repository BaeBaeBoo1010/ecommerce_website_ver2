"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
}

export default function AddProductPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Load danh sách category
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error("Lỗi tải category:", err));
  }, []);

  // Thêm sản phẩm
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget as HTMLFormElement;

    const formData = new FormData();
    formData.append(
      "name",
      (form.elements.namedItem("name") as HTMLInputElement).value,
    );
    formData.append(
      "productCode",
      (form.elements.namedItem("productCode") as HTMLInputElement).value,
    );
    formData.append(
      "description",
      (form.elements.namedItem("description") as HTMLTextAreaElement).value,
    );
    formData.append(
      "price",
      (form.elements.namedItem("price") as HTMLInputElement).value,
    );
    formData.append("category", selectedCategory);

    if (image) formData.append("image", image);

    const res = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setLoading(false);
    if (result.success) {
      alert("✅ Thêm sản phẩm thành công!");
      window.location.reload();
    } else {
      alert("❌ Thêm sản phẩm thất bại.");
    }
  }

  // Thêm loại sản phẩm mới
  async function handleAddCategory() {
    if (!newCategoryName.trim())
      return alert("Vui lòng nhập tên loại sản phẩm");

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName }),
    });

    const result = await res.json();
    if (result.success) {
      const newCat = result.category;
      setCategories((prev) => [...prev, newCat]);
      setSelectedCategory(newCat._id); // chọn luôn
      setNewCategoryName("");
      alert("✅ Đã thêm loại sản phẩm mới");
    } else {
      alert("❌ Không thể thêm loại sản phẩm");
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-xl rounded-xl border p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">Thêm sản phẩm</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Tên sản phẩm"
          className="w-full rounded border p-2"
          required
        />
        <input
          name="productCode"
          placeholder="Mã sản phẩm"
          className="w-full rounded border p-2"
          required
        />
        <textarea
          name="description"
          placeholder="Mô tả sản phẩm"
          className="w-full rounded border p-2"
          required
        />
        <input
          name="price"
          type="number"
          step="0.01"
          placeholder="Giá (VNĐ)"
          className="w-full rounded border p-2"
          required
        />

        <div className="flex gap-2">
          <select
            name="category"
            className="w-full rounded border p-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">-- Chọn loại sản phẩm --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

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
            className="cursor-pointer rounded bg-green-600 px-4 py-2 text-white transition-all hover:bg-green-700"
          >
            Thêm loại
          </button>
        </div>

        <div>
          <input
            type="file"
            id="fileUpload"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImage(file);
                setPreviewUrl(URL.createObjectURL(file));
              }
            }}
            className="hidden"
            required
          />

          <label
            htmlFor="fileUpload"
            className="inline-block cursor-pointer rounded bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700"
          >
            📷 Chọn ảnh
          </label>

          {image && (
            <p className="mt-2 text-sm text-gray-600">
              Đã chọn: <strong>{image.name}</strong>
            </p>
          )}
        </div>

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
          className="w-full cursor-pointer rounded bg-blue-600 py-2 text-white transition-all hover:bg-blue-700"
        >
          {loading ? "Đang thêm..." : "Thêm sản phẩm"}
        </button>
      </form>
    </div>
  );
}
