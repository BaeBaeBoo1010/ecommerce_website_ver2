// src/app/layout.tsx
export const revalidate = 300; // ISR: cache 5 phút

import type { Metadata } from "next";
import { Roboto, Inter } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";
import "./globals.css";
import { cache } from "react";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { SWRConfig } from "swr";

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

const getProducts = cache(async () => {
  await connectMongoDB();
  const products = await Product.find()
    .populate("category", "name slug")
    .lean();
  return JSON.parse(JSON.stringify(products));
});

export const metadata: Metadata = {
  title: "Thiết bị điện Quang Minh",
  description: "Automate your house",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const products = await getProducts(); // Cached + ISR

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
        <Providers>
          <SWRConfig
            value={{
              fallback: { "/api/products": products },
              revalidateOnFocus: false,
              revalidateOnReconnect: false,
              revalidateIfStale: false,
            }}
          >
            <Header />
            <Toaster
              richColors
              closeButton
              theme="light"
              position="top-right"
              className="!top-18 !w-80 sm:!top-26 !z-1"
              toastOptions={{ duration: 2000 }}
            />
            <main>{children}</main>
            <Footer />
          </SWRConfig>
        </Providers>
      </body>
    </html>
  );
}
