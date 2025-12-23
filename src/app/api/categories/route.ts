import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/slugify";
import { snakeToCamel } from "@/lib/case";
import { requireAdmin } from "@/lib/auth-helpers";

const ERROR = {
  MISSING_NAME: "MISSING_NAME",
  DUP_NAME: "DUP_NAME",
  CREATE_FAILED: "CREATE_FAILED",
} as const;

/* ───────── GET /api/categories ───────── */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        slug,
        products:products(id)
      `)
      .order("name");

    if (error) {
      console.error("❌ Supabase error:", error);
      return NextResponse.json({ error: "Api error" }, { status: 500 });
    }

    const normalized = data.map(cat => ({
      ...snakeToCamel(cat),
      productCount: cat.products?.length || 0,
    }));
    return NextResponse.json(normalized, { status: 200 });
  } catch (err) {
    console.error("❌ Api error:", err);
    return NextResponse.json({ error: "Api error" }, { status: 500 });
  }
}

/* ───────── POST /api/categories ───────── */
export async function POST(req: Request) {
  // 🔒 Security: Require admin authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { name } = await req.json();
    const cleaned = (name as string | undefined)?.trim();

    if (!cleaned) {
      return NextResponse.json(
        { success: false, code: ERROR.MISSING_NAME, field: "name" },
        { status: 400 }
      );
    }

    // Duplicate check – case-insensitive
    const { data: allCats, error: dupError } = await supabase
      .from("categories")
      .select("id, name");

    if (dupError) {
      console.error("❌ Supabase duplicate-check error:", dupError);
      return NextResponse.json(
        { success: false, code: ERROR.CREATE_FAILED },
        { status: 500 }
      );
    }

    const dup = allCats?.find(
      (c) => c.name.trim().toLowerCase() === cleaned.toLowerCase()
    );

    if (dup) {
      return NextResponse.json(
        { success: false, code: ERROR.DUP_NAME, field: "name" },
        { status: 409 }
      );
    }

    // Create
    const slug = slugify(cleaned);

    const { data: created, error: createError } = await supabase
      .from("categories")
      .insert([{ name: cleaned, slug }])
      .select()
      .single();

    if (createError) {
      console.error("❌ Supabase create error:", createError);
      return NextResponse.json(
        { success: false, code: ERROR.CREATE_FAILED },
        { status: 500 }
      );
    }

    // Revalidate pages after category creation
    const { revalidatePath, revalidateTag } = await import("next/cache");
    revalidatePath("/", "layout");
    revalidatePath("/products", "page");
    revalidateTag("categories", "max");

    return NextResponse.json(
      { success: true, category: created },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /categories error:", err);
    return NextResponse.json(
      { success: false, code: ERROR.CREATE_FAILED },
      { status: 500 }
    );
  }
}