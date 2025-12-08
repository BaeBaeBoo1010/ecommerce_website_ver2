import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  try {
    // Revalidate main pages
    revalidatePath("/", "layout");
    revalidatePath("/products", "page");
    revalidatePath("/admin/product-management", "page");

    return NextResponse.json({ success: true, revalidated: true });
  } catch (error) {
    console.error("❌ Revalidate error:", error);
    return NextResponse.json(
      { success: false, error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
