import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 100);

  if (!q || q.trim().length === 0) {
    return NextResponse.json([]);
  }

  const searchQuery = q.trim();

  try {
    // Try fuzzy search with pg_trgm first
    const { data: fuzzyData, error: fuzzyError } = await supabase.rpc(
      "search_products_fuzzy",
      { search_query: searchQuery, result_limit: limit }
    );

    console.log("Fuzzy search debug:", {
      query: searchQuery,
      error: fuzzyError?.message,
      resultCount: fuzzyData?.length
    });

    // Use fuzzy results if successful AND has results
    if (!fuzzyError && fuzzyData && fuzzyData.length > 0) {
      // Transform RPC results to frontend format
      const results = fuzzyData.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        description: item.description,
        imageUrls: Array.isArray(item.image_urls)
          ? item.image_urls
          : typeof item.image_urls === "string"
            ? [item.image_urls]
            : [],
        category: item.category_id
          ? {
            id: item.category_id,
            name: item.category_name,
            slug: item.category_slug,
          }
          : null,
      }));

      return NextResponse.json(results);
    }

    // Fallback to ILIKE if RPC fails or returns empty
    if (fuzzyError) {
      console.warn("Fuzzy search RPC failed, falling back to ILIKE:", fuzzyError?.message);
    } else {
      console.log("Fuzzy search returned no results, trying ILIKE fallback");
    }

    const searchTerm = `%${searchQuery}%`;
    const { data, error } = await supabase
      .from("products")
      .select(
        `
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
      `
      )
      .or(
        `name.ilike.${searchTerm},description.ilike.${searchTerm},article_html.ilike.${searchTerm}`
      )
      .order("name", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Supabase search error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform snake_case to camelCase for frontend
    const results =
      data?.map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        description: item.description,
        imageUrls: Array.isArray(item.image_urls)
          ? item.image_urls
          : typeof item.image_urls === "string"
            ? [item.image_urls]
            : [],
        category: item.category
          ? {
            id: item.category.id,
            name: item.category.name,
            slug: item.category.slug,
          }
          : null,
      })) || [];

    return NextResponse.json(results);
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


