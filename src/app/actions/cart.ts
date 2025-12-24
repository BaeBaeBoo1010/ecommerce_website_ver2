"use server";

import { unstable_cache } from "next/cache";
import { getProductsByIds } from "@/lib/product-service";
import { Product } from "@/types/product";

export async function getFreshCartProducts(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];

  // Sort IDs to ensure stable cache key for same set of items
  const sortedIdsKey = [...ids].sort().join("-");

  const getCached = unstable_cache(
    async () => {
      return await getProductsByIds(ids);
    },
    [`cart-items-${sortedIdsKey}`],
    { tags: ["products"], revalidate: 60 }
  );

  return getCached();
}
