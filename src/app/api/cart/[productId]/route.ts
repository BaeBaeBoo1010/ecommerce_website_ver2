
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase";

/* 
  PUT /api/cart/[productId]
  - Update quantity
  - Body: { quantity: number }
*/
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ productId: string }> } // Note: using productId
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await context.params;
  const body = await req.json();
  const quantity = body.quantity;
  const userId = session.user.id;

  if (quantity === undefined || quantity < 1) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }
  
  if (!supabaseAdmin) {
     return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // 1. Get Cart ID (Could cache this map for perf, but query is fast)
  const { data: cart } = await supabaseAdmin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!cart) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }

  // 2. Update Item
  const { error } = await supabaseAdmin
    .from("cart_items")
    .update({ quantity })
    .eq("cart_id", cart.id)
    .eq("product_id", productId);

  if (error) {
    console.warn("Update cart item failed", error);
    // Try insert if not found? No, PUT implies exist. But safe to Upsert? 
    // Usually PUT is update.
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/* 
  DELETE /api/cart/[productId]
  - Remove item
*/
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ productId: string }> }
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await context.params;
  const userId = session.user.id;

    if (!supabaseAdmin) {
     return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // 1. Get Cart
  const { data: cart } = await supabaseAdmin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!cart) {
     return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }

  // 2. Delete Item
  const { error } = await supabaseAdmin
    .from("cart_items")
    .delete()
    .eq("cart_id", cart.id)
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
