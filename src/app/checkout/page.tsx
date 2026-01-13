import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import CheckoutClient from "./checkout-client";

export const metadata: Metadata = {
  title: "Thanh toán",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/checkout",
  },
};

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
