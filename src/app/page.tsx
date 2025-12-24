import HomeClient from "@/components/home-client";
import type { Metadata } from "next";
import { getHomeCategories } from "@/lib/home-service";
import { unstable_cache } from "next/cache";

// Force dynamic rendering to ensure fresh data (cached via unstable_cache)
export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.me";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Trang chủ",
    description:
      "Chuyên cung cấp thiết bị điện, thiết bị thông minh cho gia đình và công nghiệp.",
    openGraph: {
      title: "Thiết bị điện Quang Minh - Trang chủ",
      description:
        "Chuyên cung cấp thiết bị điện, thiết bị thông minh cho gia đình và công nghiệp.",
      url: siteUrl,
      images: [
        {
          url: `${siteUrl}/images/logo.webp`,
          width: 1200,
          height: 630,
          alt: "Thiết bị điện Quang Minh",
        },
      ],
    },
    alternates: {
      canonical: siteUrl,
    },
  };
}

export default async function Page() {
  const getCachedHomeData = unstable_cache(
    async () => getHomeCategories(),
    ["home-categories-list"],
    { tags: ["products", "categories"], revalidate: 60 },
  );

  const initialData = await getCachedHomeData();
  return <HomeClient initialData={initialData} />;
}
