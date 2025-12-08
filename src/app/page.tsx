import HomeClient from "@/components/home-client";
import type { Metadata } from "next";
import { getHomeCategories } from "@/lib/home-service";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.me";

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
  const initialData = await getHomeCategories();
  return <HomeClient initialData={initialData} />;
}
