import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";

/**
 * GET /api/search?q=keyword
 * Trả về mảng tên sản phẩm gợi ý theo tên (string[])
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("q")?.trim();

  if (!keyword) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    await connectMongoDB();

    const regex = new RegExp(keyword, "i"); // không phân biệt hoa thường
    const products = await Product.find({ name: { $regex: regex } })
      .limit(8)
      .select("name -_id");

    const suggestions = products.map((p) => p.name);
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("Lỗi tìm kiếm:", err);
    return NextResponse.json(
      { suggestions: [], error: "Lỗi server" },
      { status: 500 },
    );
  }
}
