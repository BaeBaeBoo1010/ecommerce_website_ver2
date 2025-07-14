/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ secure: true });

const ERROR = {
  DUP_NAME: "DUP_NAME",
  DUP_CODE: "DUP_CODE",
  NOT_FOUND: "NOT_FOUND",
  MISSING_FIELD: "MISSING_FIELD",
};

/* Helper: tách public_id từ URL Cloudinary */
function extractPublicId(imageUrl: string): string {
  const parts = imageUrl.split("/");
  const uploadIdx = parts.findIndex((p) => p === "upload");
  return parts.slice(uploadIdx + 1).join("/").replace(/\.[^/.]+$/, "");
}

/* ───────── GET /api/products/[id] ───────── */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  await connectMongoDB();
  const product = await Product.findById(id).populate(
    "category",
    "_id name slug",
  );

  if (!product) {
    return NextResponse.json(
      { success: false, code: ERROR.NOT_FOUND },
      { status: 404 },
    );
  }

  return NextResponse.json(product);
}

/* ───────── DELETE /api/products/[id] ───────── */
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    await connectMongoDB();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, code: ERROR.NOT_FOUND },
        { status: 404 },
      );
    }

    await cloudinary.uploader.destroy(extractPublicId(product.imageUrl));
    await Product.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE product error:", err);
    return NextResponse.json(
      { success: false, code: "DELETE_FAILED" },
      { status: 500 },
    );
  }
}

/* ───────── PUT /api/products/[id] ───────── */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    await connectMongoDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, code: ERROR.NOT_FOUND },
        { status: 404 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const name = (formData.get("name") as string)?.trim();
    const productCode = (formData.get("productCode") as string)?.trim();
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;

    if (!name || !productCode) {
      return NextResponse.json(
        { success: false, code: ERROR.MISSING_FIELD },
        { status: 400 },
      );
    }

    /* ── Check trùng (loại trừ chính _id đang sửa) ── */
    const dup = (await Product.findOne(
      {
        _id: { $ne: id },
        $or: [{ name }, { productCode }],
      },
      { name: 1, productCode: 1 },
    ).lean()) as { name?: string; productCode?: string } | null;

    if (dup) {
      const field: "name" | "productCode" =
        dup.name === name ? "name" : "productCode";
      const code = field === "name" ? ERROR.DUP_NAME : ERROR.DUP_CODE;

      return NextResponse.json({ success: false, code, field }, { status: 409 });
    }

    /* ── Upload ảnh mới (nếu có) ── */
    let imageUrl = product.imageUrl;
    if (file) {
      await cloudinary.uploader.destroy(extractPublicId(product.imageUrl));

      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "products", public_id: productCode, overwrite: true },
          (err, result) => (err ? reject(err) : resolve(result)),
        ).end(buffer);
      });
      imageUrl = (uploadRes as any).secure_url;
    }

    /* ── Cập nhật sản phẩm ── */
    Object.assign(product, {
      name,
      productCode,
      description,
      price,
      category,
      imageUrl,
    });
    await product.save();

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    if (err?.code === 11000) {
      const dupField = Object.keys(err.keyPattern ?? {})[0] as
        | "name"
        | "productCode";
      const code = dupField === "name" ? ERROR.DUP_NAME : ERROR.DUP_CODE;
      return NextResponse.json(
        { success: false, code, field: dupField },
        { status: 409 },
      );
    }

    console.error("PUT product error:", err);
    return NextResponse.json(
      { success: false, code: "UPDATE_FAILED" },
      { status: 500 },
    );
  }
}
