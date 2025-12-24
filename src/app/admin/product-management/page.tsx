import { unstable_cache } from "next/cache";
import { getAllProductsAdminList } from "@/lib/product-service";
import { supabase } from "@/lib/supabase";
import ProductManagementClient from "./product-management-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý sản phẩm",
};

export const dynamic = "force-dynamic"; // Ensures page isn't static, but data is cached

export default async function ProductManagementPage() {
  // 1. Cached Products Fetcher
  const getCachedProducts = unstable_cache(
    async () => {
      return await getAllProductsAdminList();
    },
    ["admin-products-list"],
    { tags: ["products"], revalidate: 60 },
  );

  // 2. Cached Categories Fetcher
  const getCachedCategories = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("categories")
        .select(
          `
          id,
          name,
          slug,
          products:products(id)
        `,
        )
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        return [];
      }

      // Normalize logic (similar to GET /api/categories but simpler for just ID/Name needed)
      // Actually the client just needs id/name/slug usually, but the original API returned normalized data
      // Let's stick to simple mapping or reuse the API logic if complex.
      // The original client expects: id, name, slug.

      return (data || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      }));
    },
    ["admin-categories-list"],
    { tags: ["categories"], revalidate: 60 },
  );

  const [products, categories] = await Promise.all([
    getCachedProducts(),
    getCachedCategories(),
  ]);

  return (
    <ProductManagementClient
      initialProducts={products}
      initialCategories={categories}
    />
  );
}
