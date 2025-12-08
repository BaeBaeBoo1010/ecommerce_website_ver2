import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/slugify";

const ERROR = {
  NOT_FOUND: "NOT_FOUND",
  DUP_NAME: "DUP_NAME",
  IN_USE: "CATEGORY_IN_USE",
  UPDATE_FAILED: "UPDATE_FAILED",
  DELETE_FAILED: "DELETE_FAILED",
} as const;

/* ───────── GET /api/categories/[id] ───────── */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const { data: category, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("id", id)
    .single();

  if (error || !category) {
    return NextResponse.json({ success: false, code: ERROR.NOT_FOUND }, { status: 404 });
  }

  return NextResponse.json({ success: true, category });
}

/* ───────── PATCH /api/categories/[id] ─────────
   Body: { name?: string }
───────────────────────────────────────────────── */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Find existing category
    const { data: category, error: findError } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("id", id)
      .single();

    if (findError || !category) {
      return NextResponse.json({ success: false, code: ERROR.NOT_FOUND }, { status: 404 });
    }

    const { name } = await req.json();

    if (name && name.trim() && name !== category.name) {
      // Check for duplicate name
      const { data: allCats } = await supabase
        .from("categories")
        .select("id, name")
        .neq("id", id);

      const dup = allCats?.find(
        (c) => c.name.trim().toLowerCase() === name.trim().toLowerCase()
      );

      if (dup) {
        return NextResponse.json(
          { success: false, code: ERROR.DUP_NAME, field: "name" },
          { status: 409 }
        );
      }

      // Update
      const { data: updated, error: updateError } = await supabase
        .from("categories")
        .update({ name: name.trim(), slug: slugify(name.trim()) })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("❌ Supabase update error:", updateError);
        return NextResponse.json(
          { success: false, code: ERROR.UPDATE_FAILED },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, category: updated });
    }

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("PATCH category error:", err);
    return NextResponse.json({ success: false, code: ERROR.UPDATE_FAILED }, { status: 500 });
  }
}

/* ───────── DELETE /api/categories/[id] ───────── */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Check if any products use this category
    const { data: products } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", id)
      .limit(1);

    if (products && products.length > 0) {
      return NextResponse.json({ success: false, code: ERROR.IN_USE }, { status: 409 });
    }

    // Delete category
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("❌ Supabase delete error:", deleteError);
      return NextResponse.json(
        { success: false, code: ERROR.DELETE_FAILED },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE category error:", err);
    return NextResponse.json({ success: false, code: ERROR.DELETE_FAILED }, { status: 500 });
  }
}

