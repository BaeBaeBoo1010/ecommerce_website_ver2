import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thiết bị điện Quang Minh",
  description: "Automate your house",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.className}>
      <body>
        <Providers>
          <Header />
          <Toaster
            richColors
            closeButton
            theme="light"
            position="top-right"
            className="!top-18 !w-80 sm:!top-26"
            toastOptions={{
              duration: 2000,
              classNames: {
                toast:
                  "transition-all ease-in-out duration-300 data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
              },
            }}
          />

          <main className="">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
