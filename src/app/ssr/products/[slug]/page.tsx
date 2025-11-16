// app/ssr/products/[slug]/page.tsx
import type { Metadata } from "next";
import type { Product as ProductType } from "@/types/product";
import ProductDetail from "@/components/product-detail";
import Script from "next/script";
import { getProductBySlug } from "@/lib/products";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) return { title: "Sản phẩm không tồn tại" };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";
  const title = `${product.name}${product.category?.name ? ` - ${product.category.name}` : ""} | Thiết bị điện Quang Minh`;
  const description =
    product.description?.slice(0, 160) ||
    `Mua ${product.name} với giá tốt nhất tại cửa hàng thiết bị điện Quang Minh.`;
  const imageUrl = product.imageUrls?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/${slug}`,
      type: "website",
      locale: "vi_VN",
      siteName: "Thiết bị điện Quang Minh",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: `${siteUrl}/products/${slug}`,
    },
    other: {
      "product:price:amount": product.price.toString(),
      "product:price:currency": "VND",
    },
  };
}

export default async function ProductDetailSSRPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = (await getProductBySlug(slug)) as ProductType | null;

  if (!product) return <div>Sản phẩm không tồn tại</div>;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";
  const productUrl = `${siteUrl}/products/${product.slug}`;

  // Product schema
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.imageUrls || [],
    description:
      product.description || `Sản phẩm ${product.name} chất lượng cao`,
    sku: product.productCode,
    brand: { "@type": "Brand", name: "Thiết bị điện Quang Minh" },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "VND",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Thiết bị điện Quang Minh",
      },
    },
    category: product.category?.name || "Thiết bị điện",
  };

  // Breadcrumb schema
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
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 4 : 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <ProductDetail product={product} />
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
    </>
  );
}

