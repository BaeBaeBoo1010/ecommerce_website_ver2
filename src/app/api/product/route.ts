import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await connectMongoDB();
    await Product.create(body);

    return NextResponse.json({ message: "✅ Thêm thành công" });
  } catch (err) {
    console.error("❌ Lỗi thêm sản phẩm:", err);
    return NextResponse.json({ message: "❌ Lỗi server" }, { status: 500 });
  }
}
