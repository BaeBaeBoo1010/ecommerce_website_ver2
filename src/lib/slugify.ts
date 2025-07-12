// lib/slugify.ts
import slugifyLib from "slugify";

/**
 * Chuyển chuỗi bất kỳ thành slug a-z‑0‑9.
 * - lower   : chuyển về lowercase
 * - locale  : "vi" để xử lý đ/Đ
 * - strict  : giữ lại chỉ a-z, 0-9, dấu -
 * - trim    : bỏ khoảng trắng đầu/cuối
 */
export function slugify(str: string): string {
  return slugifyLib(str, {
    lower: true,
    locale: "vi",
    strict: true,
    trim: true,
  });
}
