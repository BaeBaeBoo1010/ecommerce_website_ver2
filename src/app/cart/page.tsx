import type { Metadata } from "next";
import CartClient from "./cart-client";

export const metadata: Metadata = {
  title: "Giỏ hàng",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/cart",
  },
};

export default function CartPage() {
  return <CartClient />;
}
