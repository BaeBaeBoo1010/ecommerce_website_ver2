// src/app/layout.tsx
export const revalidate = 300; // ISR: cache 5 phút

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import AppToaster from "@/components/app-toaster";
import Providers from "./providers";
import "./globals.css";
import Script from "next/script";

// Dynamic import Footer for better initial load
const Footer = dynamic(() => import("@/components/footer"), {
  ssr: true,
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.me";
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
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={inter.variable}
      style={{
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="min-h-screen flex flex-col">
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
          <Header />
          <AppToaster />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
