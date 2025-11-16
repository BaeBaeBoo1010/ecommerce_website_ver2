import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Tìm hiểu về Thiết bị điện Quang Minh - Chuyên cung cấp thiết bị điện, thiết bị thông minh chất lượng cao cho gia đình và công nghiệp.",
  openGraph: {
    title: "Giới thiệu | Thiết bị điện Quang Minh",
    description: "Tìm hiểu về Thiết bị điện Quang Minh - Chuyên cung cấp thiết bị điện chất lượng cao.",
    url: `${siteUrl}/introduction`,
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: `${siteUrl}/introduction`,
  },
};

export default function Introduction() {
  return <div>This is introduction page.</div>;
}