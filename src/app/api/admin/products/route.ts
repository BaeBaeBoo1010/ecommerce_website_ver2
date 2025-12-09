import { NextResponse } from "next/server";
import { getAllProductsAdmin } from "@/lib/product-service";
import { requireAdmin } from "@/lib/auth-helpers";

/**
 * GET /api/admin/products
 * Returns all products with full columns for admin pages
 * Requires admin authentication
 */
export async function GET() {
  // 🔒 Security: Require admin authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const products = await getAllProductsAdmin();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
