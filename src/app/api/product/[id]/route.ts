import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    const products = await Product.find().populate("category", "name");
    return NextResponse.json(products);
  } catch (error) {
    console.error("Lỗi GET /api/product:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
