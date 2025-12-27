import { supabase } from "@/lib/supabase";
import AddProductClient from "./add-product-client";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = {
  title: "Thêm sản phẩm",
};

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";

export default async function AddProductPage() {
  const getCachedCategories = unstable_cache(
    async () => {
      // Use supabase directly, it's fine for SELECT if RLS allows public read.
      // But consistent with API, we might want supabaseAdmin if RLS is tricky,
      // though for Server Components client uses Service Key if configured properly?
      // Actually `supabase` imported from `@/lib/supabase` is the anonymous client.
      // `EditProductPage` uses `supabase`.
      return await supabase.from("categories").select("*").order("name");
    },
    ["categories-list"],
    { tags: ["categories"], revalidate: 60 },
  );

  const categoriesRes = await getCachedCategories();
  const categories = categoriesRes.data || [];

  return <AddProductClient initialCategories={categories} />;
}
