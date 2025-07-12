/* eslint-disable @typescript-eslint/no-explicit-any */
export const PRODUCT_CACHE_KEY = "cachedProducts";

export function saveProductCache(data: any) {
  try {
    localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("Lỗi khi lưu cache:", err);
  }
}

export function loadProductCache(): any | null {
  try {
    const cached = localStorage.getItem(PRODUCT_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.warn("Lỗi khi load cache:", err);
    return null;
  }
}