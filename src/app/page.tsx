"use client";

import { useEffect, useState } from "react";
import ProductSwiper from "@/components/product-swiper";
import { Product } from "@/components/product-card";
import Carousel from "@/components/carousel";
import { PLACEHOLDER_CATEGORIES } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  slug: string;
}
interface CategoryWithProducts extends Category {
  products: Product[];
}

export default function Home() {
  const [data, setData] = useState<CategoryWithProducts[]>(
    PLACEHOLDER_CATEGORIES,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // 1️⃣ Lấy danh mục
        const catRes = await fetch("/api/categories");
        const { categories } = await catRes.json();

        // 2️⃣ Song song lấy top 10 sản phẩm của từng danh mục
        const list: CategoryWithProducts[] = await Promise.all(
          categories.map(async (cat: Category) => {
            const prodRes = await fetch(
              `/api/products?category=${cat.slug}&limit=10`,
            );
            const prods = await prodRes.json();
            return { ...cat, products: prods as Product[] };
          }),
        );

        setData(list);
      } catch (err) {
        console.error("Lỗi load dữ liệu Home:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 sm:space-y-4">
      <Carousel isLoading={loading} />

      {data.map(({ _id, name, products }) => (
        <ProductSwiper
          key={_id}
          title={name}
          products={products}
          isLoading={loading} // ⚡ truyền flag
        />
      ))}
    </main>
  );
}
