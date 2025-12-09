import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ProductDetailClient from "./product-detail-client";
import Script from "next/script";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";

type Props = {
  params: Promise<{ slug: string }>;
};

// Fetch product data from database
async function fetchProduct(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`
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
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    productCode: data.product_code,
    price: data.price,
    description: data.description,
    imageUrls: data.image_urls || [],
    articleHtml: data.article_html,
    isArticleEnabled: data.is_article_enabled,
    category: data.category ? {
      id: (data.category as any).id,
      name: (data.category as any).name,
      slug: (data.category as any).slug,
    } : { id: "", name: "", slug: "" },
  };
}

// Cached version of getProduct - revalidates every 60 seconds
const getProduct = unstable_cache(
  async (slug: string) => fetchProduct(slug),
  ["product-detail"],
  { revalidate: 60, tags: ["products"] }
);

// Pre-generate all product pages at build time
export async function generateStaticParams() {
  const { data: products } = await supabase
    .from("products")
    .select("slug");

  return (products || []).map((product) => ({
    slug: product.slug,
  }));
}


// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Sản phẩm không tồn tại",
      description: "Không tìm thấy sản phẩm này trong hệ thống.",
    };
  }

  const title = `${product.name}${product.category?.name ? ` - ${product.category.name}` : ""} | Thiết bị điện Quang Minh`;
  const description =
    product.description?.slice(0, 160) ||
    `Mua ${product.name} với giá tốt nhất tại cửa hàng thiết bị điện Quang Minh. Hàng chính hãng, bảo hành dài hạn.`;
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
    description: product.description || `${product.name} - Thiết bị điện chất lượng cao`,
    sku: product.productCode,
    image: product.imageUrls?.[0],
    url: `${siteUrl}/products/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "Quang Minh",
    },
    category: product.category?.name || "Thiết bị điện",
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "VND",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Thiết bị điện Quang Minh",
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
