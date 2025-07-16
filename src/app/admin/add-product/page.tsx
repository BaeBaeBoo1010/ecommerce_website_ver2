// app/admin/add-product/page.tsx
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AddProductClient from "./add-product-client";

export default async function AddProductPage() {
  const session = await auth();

  // Không login hoặc không phải admin → về trang chủ
  if (!session || session.user.role !== "admin") redirect("/");

  return <AddProductClient />; // 👈 render UI client
}
