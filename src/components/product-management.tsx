"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  price: number;
  productID: string;
  image: string;
  category: { name: string } | string;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/product")
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          console.error("❌ Lỗi API:", errText);
          return;
        }
        const data = await res.json();
        console.log("✅ Products:", data);
        setProducts(data);
      });
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">📦 Quản lý sản phẩm</h1>

      {products.length === 0 ? (
        <p className="text-gray-600">Chưa có sản phẩm nào.</p>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <div
              key={p._id}
              className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow"
            >
              <div className="relative h-24 w-24 rounded bg-gray-100">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <p className="text-sm text-gray-500">Mã: {p.productID}</p>
                <p className="text-sm text-gray-500">
                  Loại:{" "}
                  {typeof p.category === "object"
                    ? p.category.name
                    : p.category}
                </p>
              </div>
              <div className="min-w-[100px] text-right font-bold text-blue-600">
                {p.price.toLocaleString()}₫
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
