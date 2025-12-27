import type { Metadata } from "next";

import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ProductDetailClient from "./product-detail-client";
import Script from "next/script";
import { unstable_cache } from "next/cache";

// Force dynamic rendering to ensure fresh data (cached via unstable_cache)
export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.me";

type Props = {
  params: Promise<{ slug: string }>;
};

// Fetch product data from database with caching
async function fetchProduct(slug: string) {
  const getCachedProduct = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          product_code,
          price,
          description,
          image_urls,
          article_html,
          is_article_enabled,
          category:categories (
            id,
            name,
            slug
          )
        `,
        )
        .eq("slug", slug)
        .single();

      if (error || !data) {
        console.log(`Product not found for slug: ${slug}`);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        productCode: data.product_code,
        price: data.price ?? 0,
        description: data.description,
        imageUrls: data.image_urls || [],
        articleHtml: data.article_html,
        isArticleEnabled: data.is_article_enabled,
        category: data.category
          ? Array.isArray(data.category)
            ? data.category[0]
            : data.category
          : { id: "", name: "", slug: "" },
      };
    },
    [`product-detail-${slug}`], // Cache Key
    {
      tags: [`product:${slug}`, "products"], // Cache Tags for invalidation
      revalidate: 60, // Fallback revalidate
    },
  );

  return getCachedProduct();
}

// Lighter fetch for metadata (excludes article_html)
async function fetchProductMetadata(slug: string) {
  const getCachedMetadata = unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          product_code,
          description,
          image_urls,
          category:categories (
            name
          )
        `,
        )
        .eq("slug", slug)
        .single();

      if (error || !data) return null;

      return {
        name: data.name,
        slug: data.slug,
        productCode: data.product_code,
        description: data.description,
        imageUrls: data.image_urls || [],
        category: data.category
          ? Array.isArray(data.category)
            ? data.category[0]
            : data.category
          : { name: "" },
      };
    },
    [`product-metadata-${slug}`],
    {
      tags: [`product:${slug}`, "products"],
      revalidate: 60,
    },
  );

  return getCachedMetadata();
}

// Cached version of getProduct - revalidates every 60 seconds
// Direct fetch - relying on page-level ISR (revalidate = 60) or revalidatePath
async function getProduct(slug: string) {
  return fetchProduct(slug);
}

// generateStaticParams removed to use Dynamic Rendering + Data Cache

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductMetadata(slug);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại",
      description: "Không tìm thấy sản phẩm này trong hệ thống.",
    };
  }

  const title = `${product.name}${product.category?.name ? ` - ${product.category.name}` : ""} | Thiết bị cảm ứng Quang Minh`;

  // Helper to strip HTML tags
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, "") || "";
  };

  const rawDescription = product.description || "";
  const cleanDescription = stripHtml(rawDescription).trim();

  const description =
    cleanDescription.slice(0, 160) ||
    `Mua ${product.name} với giá tốt nhất tại cửa hàng thiết bị cảm ứng Quang Minh. Hàng chính hãng, chất lượng cao.`;

  const imageUrl = product.imageUrls?.[0] || `${siteUrl}/images/logo.webp`;

  return {
    title: product.name,
    description,
    keywords: [
      product.name,
      product.category?.name,
      "thiết bị điện",
      "thiết bị thông minh",
      product.productCode,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/${product.slug}`,
      type: "website",
      locale: "vi_VN",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${siteUrl}/products/${product.slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Product Schema for rich results
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `${product.name} - Thiết bị cảm ứng chất lượng cao`,
    sku: product.productCode,
    image: product.imageUrls?.[0],
    url: `${siteUrl}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "Quang Minh",
    },
    category: product.category?.name || "Thiết bị cảm ứng",
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "VND",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Thiết bị cảm ứng Quang Minh",
      },
    },
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Sản phẩm",
        item: `${siteUrl}/products`,
      },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `${siteUrl}/products?category=${product.category.slug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: product.name,
              item: `${siteUrl}/products/${product.slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: product.name,
              item: `${siteUrl}/products/${product.slug}`,
            },
          ]),
    ],
  };

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
