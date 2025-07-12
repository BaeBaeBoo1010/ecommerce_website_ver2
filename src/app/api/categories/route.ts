import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Category } from "@/models/category";
import { slugify } from "@/lib/slugify";

/* ---------------------------------------------------
   GET /api/categories
   Trả về toàn bộ danh mục
--------------------------------------------------- */
export async function GET() {
  await connectMongoDB();
  const categories = await Category.find().sort({ name: 1 });
  return NextResponse.json({ categories });
}

/* ---------------------------------------------------
   POST /api/categories
   Body JSON: { name: string }
--------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    // 1. Validate input
    const cleanedName = name?.trim();
    if (!cleanedName) {
      return NextResponse.json(
        { success: false, error: "Tên loại sản phẩm là bắt buộc." },
        { status: 400 },
      );
    }

    await connectMongoDB();

    // 2. Kiểm tra trùng tên (không phân biệt hoa thường)
    const duplicate = await Category.findOne({
      name: { $regex: new RegExp(`^${cleanedName}$`, "i") },
    });
    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "Loại sản phẩm đã tồn tại." },
        { status: 409 },
      );
    }

    // 3. Tạo slug
    const slug = slugify(cleanedName);

    // 4. Lưu DB
    const category = await Category.create({ name: cleanedName, slug });

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("Lỗi tạo category:", err);
    return NextResponse.json(
      { success: false, error: "Không thể tạo loại sản phẩm." },
      { status: 500 },
    );
  }
}
