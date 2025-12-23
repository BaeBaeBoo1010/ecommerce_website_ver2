import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EditProductClient from "./edit-product-client";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = {
  title: "Chỉnh sửa sản phẩm",
};

// Force dynamic rendering to ensure fresh data (cached via unstable_cache)
export const dynamic = "force-dynamic";

export default async function EditProductPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;

  // Cached data fetching
  const getCachedProduct = unstable_cache(
    async (s: string) => {
      return await supabase
        .from("products")
        .select("*, category:categories(id, name, slug)")
        .eq("slug", s)
        .single();
    },
    [`edit-product-${slug}`],
    { tags: [`product:${slug}`], revalidate: 3600 },
  );

  const getCachedCategories = unstable_cache(
    async () => {
      return await supabase.from("categories").select("*").order("name");
    },
    ["categories-list"],
    { tags: ["categories"], revalidate: 3600 },
  );

  // Parallel data fetching from cache
  const [productRes, categoriesRes] = await Promise.all([
    getCachedProduct(slug),
    getCachedCategories(),
  ]);

  if (productRes.error || !productRes.data) {
    if (productRes.error && productRes.error.code !== "PGRST116") {
      console.error("Error fetching product:", productRes.error);
    }
    return notFound();
  }

  const product = {
    ...productRes.data,
    productCode: productRes.data.product_code, // Map snake_case to camelCase
    imageUrls: productRes.data.image_urls,
    articleHtml: productRes.data.article_html,
    isArticleEnabled: productRes.data.is_article_enabled,
  };

  const categories = categoriesRes.data || [];

  return (
    <EditProductClient
      initialProduct={product}
      initialCategories={categories}
    />
  );
}
