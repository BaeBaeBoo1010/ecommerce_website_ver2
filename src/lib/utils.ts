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

export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.CF_PAGES_URL) return process.env.CF_PAGES_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://thietbicamung.me";
}
