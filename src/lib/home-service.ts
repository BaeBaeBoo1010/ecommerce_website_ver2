import { supabase } from "@/lib/supabase";
import type { CategoryWithProducts } from "@/types/product";
import { snakeToCamel } from "@/lib/case";

export async function getHomeCategories(): Promise<CategoryWithProducts[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(
      `
      id,
      name,
      slug,
      products (
        name,
        slug,
        price,
        original_price,
        description,
        image_urls
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase fetch error:", error);
    return [];
  }

  const normalized = data.map((category) => {
    const camel = snakeToCamel(category);

    return {
      ...camel,
      products:
        camel.products?.map((p: any) => ({
          ...p,
          // Chỉ lấy ảnh đầu
          imageUrl: Array.isArray(p.imageUrls) ? p.imageUrls[0] : null,
        })) ?? [],
    };
  });

  return normalized as CategoryWithProducts[];
}
