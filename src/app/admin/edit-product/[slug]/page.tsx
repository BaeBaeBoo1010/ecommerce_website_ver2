import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EditProductClient from "./edit-product-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chỉnh sửa sản phẩm",
};

export default async function EditProductPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;

  // Parallel data fetching
  const [productRes, categoriesRes] = await Promise.all([
    supabase.from("products").select("*").eq("slug", slug).single(),
    supabase.from("categories").select("*").order("name"),
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
