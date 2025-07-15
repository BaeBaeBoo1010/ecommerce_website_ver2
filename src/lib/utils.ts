import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PLACEHOLDER_CATEGORIES = Array.from({ length: 3 }).map((_, i) => ({
  _id: `sk_cat_${i}`,
  name: "Đang tải...",
  slug: `sk_slug_${i}`,
  products: Array.from({ length: 4 }).map((__, j) => ({
    _id: `sk_prod_${i}_${j}`,
    name: "",
    price: 0,
    imageUrl: "",
  })),
}));
