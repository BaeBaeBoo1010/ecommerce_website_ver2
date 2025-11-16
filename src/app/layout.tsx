// src/app/layout.tsx
export const revalidate = 300; // ISR: cache 5 phút

import type { Metadata } from "next";
import { Roboto, Inter } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AppToaster from "@/components/app-toaster";
import Providers from "./providers";
import "./globals.css";
import { cache } from "react";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { Category } from "@/models/category";
import { SWRConfig } from "swr";
import Script from "next/script";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-roboto",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-inter",
});

// Cached + ISR cho products
const getProducts = cache(async () => {
  await connectMongoDB();
  const products = await Product.find()
    .populate("category", "name slug")
    .lean();
  return JSON.parse(JSON.stringify(products));
});

// Cached + ISR cho categories
const getCategories = cache(async () => {
  await connectMongoDB();
  const categories = await Category.find().lean();
  return JSON.parse(JSON.stringify(categories));
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";
const siteName = "Thiết bị điện Quang Minh";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: "Chuyên cung cấp thiết bị điện, thiết bị thông minh cho gia đình và công nghiệp. Sản phẩm chất lượng cao, giá tốt nhất thị trường.",
  keywords: ["thiết bị điện", "thiết bị thông minh", "smart home", "điện dân dụng", "thiết bị công nghiệp"],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: "Chuyên cung cấp thiết bị điện, thiết bị thông minh cho gia đình và công nghiệp. Sản phẩm chất lượng cao, giá tốt nhất thị trường.",
    images: [
      {
        url: `${siteUrl}/images/logo.webp`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: "Chuyên cung cấp thiết bị điện, thiết bị thông minh cho gia đình và công nghiệp.",
    images: [`${siteUrl}/images/logo.webp`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Thêm Google Search Console verification code nếu có
    // google: "verification-code-here",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch song song để tối ưu
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <html
      lang="vi"
      className={`${inter.variable} ${roboto.variable}`}
      style={{
        fontFamily: "var(--font-inter), var(--font-roboto), sans-serif",
      }}
    >
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteName,
              url: siteUrl,
              logo: `${siteUrl}/images/logo.webp`,
              description: "Chuyên cung cấp thiết bị điện, thiết bị thông minh cho gia đình và công nghiệp",
              sameAs: [],
            }),
          }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteName,
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteUrl}/products?search={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <Providers>
          <SWRConfig
            value={{
              fallback: {
                "/api/products": products,
                "/api/categories": categories,
              },
              revalidateOnFocus: false,
              revalidateOnReconnect: false,
              revalidateIfStale: false,
              revalidateOnMount: false,
            }}
          >
            <Header />
            <AppToaster />
            <main>{children}</main>
            <Footer />
          </SWRConfig>
        </Providers>
      </body>
    </html>
  );
}
