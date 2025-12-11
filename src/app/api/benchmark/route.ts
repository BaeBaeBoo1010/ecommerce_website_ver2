import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCache, setCache, PRODUCTS_CACHE_KEY } from "@/lib/redis";
import { snakeToCamel } from "@/lib/case";
import type { Product, Category } from "@/types/product";

export const dynamic = "force-dynamic";

// Transform Supabase data to Product type
function transformProducts(data: any[]): Product[] {
  return data.map((item) => {
    const camelItem = snakeToCamel(item);

    let category: Category = { id: "", name: "", slug: "" };
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
      description: camelItem.description || "",
      imageUrls: Array.isArray(camelItem.imageUrls) ? camelItem.imageUrls : [],
      articleHtml: "",
      isArticleEnabled: false,
      category,
    };
  });
}

export async function GET() {
  try {
    // 1. Measure Supabase fetch time
    const supabaseStart = performance.now();
    const { data: supabaseData, error } = await supabase
      .from("products")
      .select(`
        id, name, slug, product_code, price, description, image_urls,
        category:categories (id, name, slug)
      `)
      .order("created_at", { ascending: false });
    const supabaseTime = performance.now() - supabaseStart;

    if (error) {
      return NextResponse.json({ error: "Supabase fetch failed" }, { status: 500 });
    }

    const supabaseProducts = transformProducts(supabaseData || []);

    // 2. Update Redis cache
    await setCache(PRODUCTS_CACHE_KEY, supabaseProducts, 300);

    // 3. Measure Redis fetch time
    const redisStart = performance.now();
    const redisProducts = await getCache<Product[]>(PRODUCTS_CACHE_KEY);
    const redisTime = performance.now() - redisStart;

    // 4. Calculate stats
    const dataSize = JSON.stringify(supabaseProducts).length;
    const speedup = supabaseTime / (redisTime || 1);

    return NextResponse.json({
      supabase: {
        time: Math.round(supabaseTime * 100) / 100,
        count: supabaseProducts.length,
        dataSize,
        data: supabaseProducts, // Include raw data
      },
      redis: {
        time: Math.round(redisTime * 100) / 100,
        count: redisProducts?.length || 0,
        cached: !!redisProducts,
        data: redisProducts || [], // Include raw data
      },
      speedup: Math.round(speedup * 10) / 10,
      message: redisProducts
        ? `Redis is ${speedup.toFixed(1)}x faster than Supabase`
        : "Redis cache miss - data refreshed",
    });
  } catch (err) {
    console.error("Benchmark error:", err);
    return NextResponse.json({ error: "Benchmark failed" }, { status: 500 });
  }
}
