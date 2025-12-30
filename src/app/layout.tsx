// src/app/layout.tsx
export const revalidate = 300; // ISR: cache 5 phút

import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Inter } from "next/font/google";
import Header from "@/components/header";
import AppToaster from "@/components/app-toaster";
import ScrollToTop from "@/components/scroll-to-top";
import Providers from "./providers";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
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
const siteName = "Quang Minh - Thiết bị cảm ứng thông minh";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description:
    "Chuyên cung cấp thiết bị cảm ứng, thiết bị thông minh cho gia đình và công nghiệp. Sản phẩm chất lượng cao, giá tốt nhất thị trường.",
  keywords: [
    "thiết bị điện",
    "thiết bị cảm ứng",
    "thiết bị điện thông minh",
    "thiết bị thông minh",
    "thiết bị cảm ứng thông minh",
    "smart home",
    "điện dân dụng",
    "thiết bị công nghiệp",
    "Quang Minh",
  ],
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
    description:
      "Chuyên cung cấp thiết bị cảm ứng, thiết bị thông minh cho gia đình và công nghiệp. Sản phẩm chất lượng cao, giá tốt nhất thị trường.",
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
    description:
      "Chuyên cung cấp thiết bị cảm ứng, thiết bị thông minh cho gia đình và công nghiệp.",
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
    icon: `${siteUrl}/favicon.png`,
    shortcut: `${siteUrl}/favicon.png`,
    apple: `${siteUrl}/favicon.png`,
  },
};

import MobileBottomNav from "@/components/mobile-bottom-nav";

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
      <body className="flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteName,
              url: siteUrl,
              logo: `${siteUrl}/favicon.png`,
              description:
                "Chuyên cung cấp thiết bị cảm ứng, thiết bị thông minh cho gia đình và công nghiệp",
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
          <NextTopLoader showSpinner={false} color="#2563EB" />
          <Header />
          <div className="h-14 sm:h-16 lg:h-20" />
          <AppToaster />
          <ScrollToTop />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
