import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";

export const metadata: Metadata = {
  title: "Liên hệ",
  description:
    "Liên hệ với Thiết bị điện Quang Minh để được tư vấn và hỗ trợ tốt nhất về các sản phẩm thiết bị điện, thiết bị thông minh.",
  openGraph: {
    title: "Liên hệ | Thiết bị điện Quang Minh",
    description:
      "Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất về các sản phẩm thiết bị điện.",
    url: `${siteUrl}/contact`,
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function Contact() {
  return <div>This is contact page.</div>;
}
