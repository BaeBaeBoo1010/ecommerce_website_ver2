import HomeClient from "@/components/home-client";
import type { Metadata } from "next";
import { getHomeCategories } from "@/lib/home-service";
import { unstable_cache } from "next/cache";

// Force dynamic rendering to ensure fresh data (cached via unstable_cache)
export const dynamic = "force-dynamic";

import { getBaseUrl } from "@/lib/utils";
const siteUrl = getBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Quang Minh - Thiết bị cảm ứng thông minh",
    description:
      "Chuyên cung cấp thiết bị cảm ứng, thiết bị thông minh cho gia đình và công nghiệp.",
    openGraph: {
      title: "Quang Minh - Thiết bị cảm ứng thông minh",
      description:
        "Chuyên cung cấp thiết bị cảm ứng, thiết bị thông minh cho gia đình và công nghiệp.",
      url: siteUrl,
      images: [
        {
          url: `${siteUrl}/icon.png`,
          width: 512,
          height: 512,
          alt: "Quang Minh - Thiết bị cảm ứng thông minh",
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
