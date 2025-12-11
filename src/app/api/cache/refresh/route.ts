import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { setCache, PRODUCTS_CACHE_KEY } from "@/lib/redis";
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

/**
 * POST /api/cache/refresh
 * Fetches all products from Supabase and stores them in Redis cache
 */
export async function POST() {
  try {
    const startTime = performance.now();

    // Fetch from Supabase
    const { data, error } = await supabase
      .from("products")
      .select(`
        id, name, slug, product_code, price, description, image_urls,
        category:categories (id, name, slug)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Supabase fetch failed", details: error.message }, { status: 500 });
    }

    const products = transformProducts(data || []);

    // Store in Redis with 5 minute TTL
    const cached = await setCache(PRODUCTS_CACHE_KEY, products, 300);

    const duration = performance.now() - startTime;

    return NextResponse.json({
      success: true,
      cached,
      count: products.length,
      dataSize: JSON.stringify(products).length,
      duration: Math.round(duration * 100) / 100,
      message: cached
        ? `✅ Cached ${products.length} products to Redis`
        : "⚠️ Redis not available - cache not updated",
    });
  } catch (err) {
    console.error("Cache refresh error:", err);
    return NextResponse.json({ error: "Cache refresh failed" }, { status: 500 });
  }
}

// GET to check cache status
export async function GET() {
  const { getCache } = await import("@/lib/redis");

  try {
    const cached = await getCache<Product[]>(PRODUCTS_CACHE_KEY);

    return NextResponse.json({
      cached: !!cached,
      count: cached?.length || 0,
      dataSize: cached ? JSON.stringify(cached).length : 0,
    });
  } catch (err) {
    return NextResponse.json({ error: "Cache check failed" }, { status: 500 });
  }
}
