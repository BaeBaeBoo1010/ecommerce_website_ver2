import { MetadataRoute } from "next";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { Category } from "@/models/category";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectMongoDB();

  // Lấy tất cả products
  const products = await Product.find()
    .select("slug updatedAt")
    .lean();

  // Lấy tất cả categories
  const categories = await Category.find()
    .select("slug")
    .lean() as unknown as { slug: string }[];

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

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category: { slug: string }) => ({
    url: `${siteUrl}/products?category=${category.slug}&page=1`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Dynamic product pages
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}

