
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { supabaseAdmin } from "@/lib/supabase";
import { snakeToCamel } from "@/lib/case";

/* 
  GET /api/cart
  - Returns the user's cart items with product details.
*/
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ items: [] });
  }

  const userId = session.user.id;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // 1. Get or Create Cart
  let { data: cart } = await supabaseAdmin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!cart) {
    // Create new cart
    const { data: newCart, error: createError } = await supabaseAdmin
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();
    
    if (createError || !newCart) {
      console.error("Failed to create cart", createError);
      return NextResponse.json({ error: "Failed to create cart" }, { status: 500 });
    }
    cart = newCart;
  }

  // 2. Fetch Items
  const { data: items, error: itemsError } = await supabaseAdmin
    .from("cart_items")
    .select(`
      quantity,
      product:products (
        id,
        name,
        slug,
        price,
        image_urls,
        product_code,
        category:categories (
            name,
            slug
        )
      )
    `)
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("Failed to fetch cart items", itemsError);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }

  // 3. Transform to CartItem shape
  const cartItems = items.map((item: any) => {
    // Transform product snake_case to camelCase
    const productCamel = snakeToCamel(item.product);
    
    // Fix category structure if needed (snakeToCamel might handle it but let's be safe)
    if (item.product.category) {
        productCamel.category = {
            name: item.product.category.name,
            slug: item.product.category.slug
        };
    }

    return {
      product: {
        ...productCamel,
        imageUrls: item.product.image_urls || [],
        productCode: item.product.product_code,
        description: "", // Lite version
      },
      quantity: item.quantity,
    };
  });

  return NextResponse.json({ items: cartItems });
}

/* 
  POST /api/cart
  - USED FOR MERGING/SYNCING LOCAL CART
  - Body: { items: { productId, quantity }[] }
  - Logic: 
    - For each item in body:
      - If exists in DB, add quantity? Or overwrite? 
      - Let's say we ADD quantity from local to remote if it's a "merge" on login.
      - OR if it's a direct "Add to Cart" action, we just Insert/Update.
  - To keep it simple, let's treat POST as "Add Single Item" OR "Merge List" depending on body.
  - Body: { items: LocalCartItem[] } -> Merge
*/
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  
  // Distinguish 'merge' list vs 'add' single
  const localItems = body.items; // Array -> Merge
  const singleProductId = body.productId; // String -> Add Single
  const singleQuantity = body.quantity || 1;

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  // 1. Get or Create Cart
  let { data: cart } = await supabaseAdmin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!cart) {
    const { data: newCart } = await supabaseAdmin
      .from("carts")
      .insert({ user_id: userId })
      .select("id")
      .single();
    cart = newCart!;
  }

  // Case A: Merge (Login Sync)
  if (Array.isArray(localItems) && localItems.length > 0) {
    for (const localItem of localItems) {
      const productId = localItem.product.id;
      const qty = localItem.quantity;
      if (!productId || qty <= 0) continue;

      const { data: existing } = await supabaseAdmin
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cart.id)
        .eq("product_id", productId)
        .single();

      if (existing) {
        await supabaseAdmin
          .from("cart_items")
          .update({ quantity: existing.quantity + qty })
          .eq("id", existing.id);
      } else {
        await supabaseAdmin
          .from("cart_items")
          .insert({ cart_id: cart.id, product_id: productId, quantity: qty });
      }
    }
    return NextResponse.json({ success: true, message: "Merged" });
  }

  // Case B: Add Single (User clicked Add to Cart)
  if (singleProductId) {
    const { data: existing } = await supabaseAdmin
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", cart.id)
        .eq("product_id", singleProductId)
        .single();

      if (existing) {
        await supabaseAdmin
          .from("cart_items")
          .update({ quantity: existing.quantity + singleQuantity })
          .eq("id", existing.id);
      } else {
        await supabaseAdmin
          .from("cart_items")
          .insert({ cart_id: cart.id, product_id: singleProductId, quantity: singleQuantity });
      }
      return NextResponse.json({ success: true, message: "Added" });
  }

  return NextResponse.json({ success: true }); // No op
}
