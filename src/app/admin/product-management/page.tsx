"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  productCode: string;
  description: string;
  price: number;
  imageUrl: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}


export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);


  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Lỗi load sản phẩm:", err))
      .finally(() => setLoading(false));
  
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error("Lỗi load category:", err));
  }, []);
  
  const handleDeleteCategory = async () => {
    if (selectedCategory === "all") {
      alert("❌ Hãy chọn một danh mục cụ thể để xoá.");
      return;
    }

    const selected = categories.find((c) => c._id === selectedCategory);
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xoá danh mục "${selected?.name}"?`,
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/categories/${selectedCategory}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (result.success) {
        setCategories(categories.filter((c) => c._id !== selectedCategory));
        setSelectedCategory("all");
        alert("✅ Đã xoá danh mục.");
      } else {
        alert(`❌ ${result.error || "Không thể xoá danh mục."}`);
      }
    } catch (err) {
      console.error("Lỗi xoá danh mục:", err);
      alert("❌ Đã xảy ra lỗi.");
    }
  };
  
  

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xoá sản phẩm này?",
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (result.success) {
        setProducts(products.filter((p) => p._id !== id));
        alert("✅ Đã xoá sản phẩm.");
      } else {
        alert("❌ Xoá thất bại.");
      }
    } catch (err) {
      console.error("Lỗi xoá sản phẩm:", err);
      alert("❌ Đã xảy ra lỗi.");
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-6xl px-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="cursor-pointer rounded border px-3 py-1 text-sm"
        >
          <option value="all">-- Tất cả danh mục --</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleDeleteCategory}
          className="cursor-pointer rounded bg-red-600 px-3 py-1 text-sm text-white transition-all hover:bg-red-700"
        >
          Xoá danh mục
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Đang tải sản phẩm...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">Chưa có sản phẩm nào.</p>
      ) : (
        <table className="w-full table-auto border-collapse text-sm shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Ảnh</th>
              <th className="border px-4 py-2">Tên</th>
              <th className="border px-4 py-2">Mã</th>
              <th className="border px-4 py-2">Danh mục</th>
              <th className="border px-4 py-2">Giá</th>
              <th className="border px-4 py-2">Mô tả</th>
              <th className="border px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter(
                (p) =>
                  selectedCategory === "all" ||
                  p.category._id === selectedCategory,
              )
              .map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">
                    <div className="relative h-20 w-20">
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="border px-4 py-2">{p.name}</td>
                  <td className="border px-4 py-2">{p.productCode}</td>
                  <td className="border px-4 py-2">
                    <div className="font-medium">{p.category?.name}</div>
                    <div className="font-[8px]">{p.category?.slug}</div>
                  </td>
                  <td className="border px-4 py-2">
                    {p.price.toLocaleString()} đ
                  </td>
                  <td className="max-w-xs border px-4 py-2">{p.description}</td>
                  <td className="space-y-1 border px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="mb-1 w-full cursor-pointer rounded bg-red-600 px-2 py-1 text-white transition-all hover:bg-red-700"
                    >
                      Xoá
                    </button>
                    <Link
                      href={`/admin/edit-product/${p._id}`}
                      className="inline-block w-full rounded bg-yellow-500 px-2 py-1 text-center text-white transition-all hover:bg-yellow-600"
                    >
                      Sửa
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
      <div className="mt-6 text-center">
        <Link
          href="/admin/add-product"
          className="mb-5 inline-block rounded-xl border-2 border-blue-400 bg-white px-4 py-2 transition-all hover:bg-blue-100"
        >
          ➕ Thêm sản phẩm
        </Link>
      </div>
    </div>
  );
}
