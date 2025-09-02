// src/app/layout.tsx
export const revalidate = 300;

import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";
import "./globals.css";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { SWRConfig } from "swr";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
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
  // Fetch dữ liệu từ MongoDB khi render server
  await connectMongoDB();
  const products = await Product.find()
    .populate("category", "name slug")
    .lean();

  return (
    <html lang="vi" className={roboto.className}>
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>
      <body>
        <Providers>
          <SWRConfig
            value={{
              fallback: {
                "/api/products": JSON.parse(JSON.stringify(products)),
              },
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
              position="top-left"
              className="!top-18 !w-80 sm:!top-26"
              toastOptions={{
                duration: 3000,
              }}
            />
            <main>{children}</main>
            <Footer />
          </SWRConfig>
        </Providers>
      </body>
    </html>
  );
}
