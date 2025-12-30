import { Suspense } from "react";
import ProductListClient from "@/components/product-list-client";
import Loading from "@/components/loading";
import type { Metadata } from "next";
import { getAllProducts } from "@/lib/product-service";
import { unstable_cache } from "next/cache";

// Force dynamic rendering to ensure fresh data (cached via unstable_cache)
export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.me";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug =
    typeof params.category === "string" ? params.category : "all";

  const defaultTitle = "Sản phẩm";
  const defaultDesc =
    "Khám phá bộ sưu tập thiết bị cảm ứng, thiết bị thông minh đa dạng với giá tốt nhất. Sản phẩm chất lượng cao, đảm bảo chính hãng.";
  const defaultUrl = `${siteUrl}/products`;

  if (categorySlug === "all") {
    return {
      title: defaultTitle,
      description: defaultDesc,
      openGraph: {
        title: `${defaultTitle} | Thiết bị cảm ứng Quang Minh`,
        description: defaultDesc,
        url: defaultUrl,
        type: "website",
        locale: "vi_VN",
        images: [
          {
            url: `${siteUrl}/images/logo.webp`,
            width: 1200,
            height: 630,
            alt: "Sản phẩm thiết bị cảm ứng",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${defaultTitle} | Thiết bị cảm ứng Quang Minh`,
        description: defaultDesc,
      },
      alternates: {
        canonical: defaultUrl,
      },
    };
  }

  // Fetch products to find category name (using cache)
  const getCachedProducts = unstable_cache(
    async () => getAllProducts(),
    ["public-products-list"],
    { tags: ["products"], revalidate: 60 },
  );

  const products = await getCachedProducts();
  const category = products.find(
    (p) => typeof p.category === "object" && p.category.slug === categorySlug,
  )?.category;

  const categoryName =
    typeof category === "object" ? category.name : "Sản phẩm";
  const title = `${categoryName}`;
  const url = `${siteUrl}/products?category=${categorySlug}`;

  return {
    title: title,
    description: `Mua ${categoryName} chính hãng, giá tốt nhất. ${defaultDesc}`,
    openGraph: {
      title: `${title} | Thiết bị cảm ứng Quang Minh`,
      description: `Mua ${categoryName} chính hãng, giá tốt nhất.`,
      url: url,
      type: "website",
      locale: "vi_VN",
      images: [
        {
          url: `${siteUrl}/images/logo.webp`,
          width: 1200,
          height: 630,
          alt: categoryName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Thiết bị cảm ứng Quang Minh`,
      description: `Mua ${categoryName} chính hãng, giá tốt nhất.`,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ProductsPage() {
  const getCachedProducts = unstable_cache(
    async () => getAllProducts(),
    ["public-products-list"],
    { tags: ["products"], revalidate: 60 },
  );

  const products = await getCachedProducts();

  return (
    <Suspense fallback={<Loading />}>
      <ProductListClient initialProducts={products} />
    </Suspense>
  );
}
