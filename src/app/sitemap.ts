import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const siteUrl = "https://thietbicamung.me";

// Hàm escape URL (prevent XML errors)
function escapeUrl(url: string) {
  return url.replace(/&/g, "&amp;");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch products
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at");

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("slug");

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/introduction`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Category pages (escape URL!)
  const categoryPages: MetadataRoute.Sitemap = (categories || []).map(
    (category) => ({
      url: escapeUrl(
        `${siteUrl}/products?category=${category.slug}&page=1`
      ),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  // Product pages
  const productPages: MetadataRoute.Sitemap = (products || []).map(
    (product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: product.updated_at
        ? new Date(product.updated_at)
        : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    })
  );

  return [...staticPages, ...categoryPages, ...productPages];
}
