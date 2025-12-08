import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

  if (!q || q.trim().length === 0) {
    return NextResponse.json([]);
  }

  try {
    const searchTerm = `%${q.trim()}%`;

    // Search across name, description, AND article_html on Supabase
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        price,
        description,
        image_urls,
        category:categories (
          id,
          name,
          slug
        )
      `)
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},article_html.ilike.${searchTerm}`)
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Supabase search error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform snake_case to camelCase for frontend
    const results = data?.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      description: item.description,
      imageUrls: Array.isArray(item.image_urls) ? item.image_urls :
        typeof item.image_urls === 'string' ? [item.image_urls] : [],
      category: item.category ? {
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
      } : null,
    })) || [];

    return NextResponse.json(results);
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


