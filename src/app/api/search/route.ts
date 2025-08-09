import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("q")?.trim();

  if (!keyword) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    await connectMongoDB();

    const regex = new RegExp(keyword, "i");

    const products = await Product.find(
      {
        $or: [
          { name: { $regex: regex } },
          { description: { $regex: regex } },
        ],
      }
    )
      .limit(8)
      .select("name"); // giữ nguyên _id, không cần ghi gì thêm

    const suggestions = products.map((p) => ({
      id: p._id.toString(), // đảm bảo trả về chuỗi, tránh lỗi serializing
      name: p.name,
    }));

    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("Lỗi tìm kiếm:", err);
    return NextResponse.json(
      { suggestions: [], error: "Lỗi server" },
      { status: 500 }
    );
  }
}
