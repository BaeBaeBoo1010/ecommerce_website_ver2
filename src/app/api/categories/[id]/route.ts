import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Category } from "@/models/category";
import { Product } from "@/models/product";
import { slugify } from "@/lib/slugify";
import mongoose from "mongoose";

interface Params {
  params: { id: string };
}

/* ---------------------------------------------------
   GET /api/categories/:id
--------------------------------------------------- */
export async function GET(_req: NextRequest, { params }: Params) {
  await connectMongoDB();

  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json(
      { success: false, error: "ID danh mục không hợp lệ." },
      { status: 400 },
    );
  }

  const category = await Category.findById(params.id);
  if (!category) {
    return NextResponse.json(
      { success: false, error: "Không tìm thấy danh mục." },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, category });
}

/* ---------------------------------------------------
   PATCH /api/categories/:id
   Body JSON: { name?: string }
--------------------------------------------------- */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await connectMongoDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "ID danh mục không hợp lệ." },
        { status: 400 },
      );
    }

    const category = await Category.findById(params.id);
    if (!category) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy danh mục." },
        { status: 404 },
      );
    }

    const { name } = await req.json();

    if (name && name.trim() && name !== category.name) {
      // kiểm tra trùng tên
      const duplicate = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        _id: { $ne: params.id },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: "Tên danh mục đã tồn tại." },
          { status: 409 },
        );
      }

      category.name = name.trim();
      category.slug = slugify(name.trim());
      await category.save();
    }

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("Lỗi cập nhật category:", err);
    return NextResponse.json(
      { success: false, error: "Không thể cập nhật danh mục." },
      { status: 500 },
    );
  }
}

/* ---------------------------------------------------
   DELETE /api/categories/:id
--------------------------------------------------- */
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectMongoDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "ID danh mục không hợp lệ." },
        { status: 400 },
      );
    }

    // Kiểm tra xem có sản phẩm nào đang dùng category này không
    const inUse = await Product.exists({ category: params.id });
    if (inUse) {
      return NextResponse.json(
        {
          success: false,
          error: "Không thể xoá. Có sản phẩm đang sử dụng danh mục này.",
        },
        { status: 409 },
      );
    }

    const deleted = await Category.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Danh mục không tồn tại." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lỗi xoá category:", err);
    return NextResponse.json(
      { success: false, error: "Xoá thất bại." },
      { status: 500 },
    );
  }
}
