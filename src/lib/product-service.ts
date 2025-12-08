import { supabase } from "@/lib/supabase";
import { snakeToCamel } from "@/lib/case";
import type { Product, Category } from "@/types/product";

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      product_code,
      price,
      description,
      image_urls,
      article_html,
      is_article_enabled,
      category:categories (
        id,
        name,
        slug
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase fetch error:", error);
    return [];
  }

  // Transform snake_case to camelCase and format for frontend
  const products: Product[] = data.map((item: any) => {
    const camelItem = snakeToCamel(item);

    // Handle category transformation
    let category: Category = {
      id: "",
      name: "",
      slug: "",
    };
    if (camelItem.category) {
      category = {
        id: camelItem.category.id,
        name: camelItem.category.name,
        slug: camelItem.category.slug,
      };
    }

    return {
      id: camelItem.id,
      name: camelItem.name,
      slug: camelItem.slug,
      productCode: camelItem.productCode || "",
      price: camelItem.price,
      description: camelItem.description,
      imageUrls: Array.isArray(camelItem.imageUrls) ? camelItem.imageUrls : [],
      articleHtml: camelItem.articleHtml || "",
      isArticleEnabled: camelItem.isArticleEnabled || false,
      category,
    };
  });

  return products;
}
