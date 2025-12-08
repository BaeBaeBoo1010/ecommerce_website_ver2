import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(req: NextRequest) {
  // 🔒 Security: Require admin authentication
  const authError = await requireAdmin();
  if (authError) return authError;

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
    }

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
