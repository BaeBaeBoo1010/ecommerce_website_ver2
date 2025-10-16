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

export const metadata: Metadata = {
  title: "Thiết bị điện Quang Minh",
  description: "Automate your house",
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
