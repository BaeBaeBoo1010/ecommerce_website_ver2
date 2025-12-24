import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

export async function POST(req: NextRequest) {
  // 🔒 Security: Check for secret token (for cross-origin calls from localhost)
  //    OR require admin session (for same-origin authenticated calls)
  const secretHeader = req.headers.get("x-revalidation-secret");

  if (secretHeader && REVALIDATION_SECRET && secretHeader === REVALIDATION_SECRET) {
    // Valid secret token - allow revalidation
    console.log("✅ Revalidation authorized via secret token");
  } else {
    // Fall back to session-based admin auth
    const authError = await requireAdmin();
    if (authError) return authError;
  }

  try {
    // Optional: get specific slug to revalidate
    let slug: string | null = null;
    try {
      const body = await req.json();
      slug = body?.slug || null;
    } catch {
      // No body or invalid JSON - that's fine
    }

    // Revalidate main pages
    revalidatePath("/", "layout");
    revalidatePath("/products", "page");
    revalidatePath("/admin/product-management", "page");
    revalidatePath("/admin/add-product", "page");

    // If specific product slug provided, revalidate that page
    if (slug) {
      revalidatePath(`/products/${slug}`, "page");
      // Also invalidate Data Cache for this product
      revalidateTag(`product:${slug}`, 'max');
    }
    
    // Always invalidate the general products list cache
    revalidateTag("products", 'max');

    console.log("✅ Revalidated paths:", slug ? `including /products/${slug}` : "all main paths");

    return NextResponse.json({ success: true, revalidated: true, slug });
  } catch (error) {
    console.error("❌ Revalidate error:", error);
    return NextResponse.json(
      { success: false, error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
