import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import { Category } from "@/models/category";
import { Product } from "@/models/product";
import { slugify } from "@/lib/slugify";

const ERROR = {
  INVALID_ID: "INVALID_ID",
  NOT_FOUND: "NOT_FOUND",
  DUP_NAME: "DUP_NAME",
  IN_USE: "CATEGORY_IN_USE",
  UPDATE_FAILED: "UPDATE_FAILED",
  DELETE_FAILED: "DELETE_FAILED",
} as const;

/* ───────── GET /api/categories/[id] ───────── */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  await connectMongoDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, code: ERROR.INVALID_ID }, { status: 400 });
  }

  const category = await Category.findById(id);
  if (!category) {
    return NextResponse.json({ success: false, code: ERROR.NOT_FOUND }, { status: 404 });
  }

  return NextResponse.json({ success: true, category });
}

/* ───────── PATCH /api/categories/[id] ─────────
   Body: { name?: string }
───────────────────────────────────────────────── */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await connectMongoDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, code: ERROR.INVALID_ID }, { status: 400 });
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, code: ERROR.NOT_FOUND }, { status: 404 });
    }

    const { name } = await req.json();

    if (name && name.trim() && name !== category.name) {
      const dup = await Category.findOne(
        {
          name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
          _id: { $ne: id },
        },
        { _id: 1 },
      ).lean();

      if (dup) {
        return NextResponse.json(
          { success: false, code: ERROR.DUP_NAME, field: "name" },
          { status: 409 },
        );
      }

      category.name = name.trim();
      category.slug = slugify(name.trim());
      await category.save();
    }

    return NextResponse.json({ success: true, category });
  } catch (err) {
    console.error("PATCH category error:", err);
    return NextResponse.json({ success: false, code: ERROR.UPDATE_FAILED }, { status: 500 });
  }
}

/* ───────── DELETE /api/categories/[id] ───────── */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await connectMongoDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, code: ERROR.INVALID_ID }, { status: 400 });
    }

    // còn sản phẩm đang dùng?
    const inUse = await Product.exists({ category: id });
    if (inUse) {
      return NextResponse.json({ success: false, code: ERROR.IN_USE }, { status: 409 });
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, code: ERROR.NOT_FOUND }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE category error:", err);
    return NextResponse.json({ success: false, code: ERROR.DELETE_FAILED }, { status: 500 });
  }
}
