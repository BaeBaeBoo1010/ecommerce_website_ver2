/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { Category } from "@/models/category";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");

    let filter = {};

    if (categorySlug && categorySlug !== "all") {
      const category = await Category.findOne({ slug: categorySlug });
      if (!category) {
        return NextResponse.json([]);
      }
      filter = { category: category._id };
    }

    const products = await Product.find(filter).populate("category", "name slug");
    return NextResponse.json(products);
  } catch (err) {
    console.error("Lỗi GET sản phẩm:", err);
    return NextResponse.json(
      { success: false, error: "Không thể lấy danh sách sản phẩm." },
      { status: 500 }
    );
  }
}

/* ───────── 1. Định nghĩa mã lỗi ───────── */
const ERROR = {
  DUP_NAME: "DUP_NAME",
  DUP_CODE: "DUP_CODE",
} as const;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const name = (formData.get("name") as string)?.trim();
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const productCode = (formData.get("productCode") as string)?.trim();

    if (!file || !name || !productCode) {
      return NextResponse.json(
        { success: false, code: "MISSING_FIELD" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    /* ───────── 2. Check trùng trước khi upload ───────── */
    const duplicated = await Product.findOne(
      { $or: [{ name }, { productCode }] },
      { name: 1, productCode: 1 }
    ).lean();

    if (duplicated) {
      const dup = duplicated as { name?: string; productCode?: string };
      const field: "name" | "productCode" = dup.name === name ? "name" : "productCode";
      const code = field === "name" ? ERROR.DUP_NAME : ERROR.DUP_CODE;
      return NextResponse.json({ success: false, code, field }, { status: 409 });
    }

    /* ───────── 3. Upload Cloudinary ───────── */
    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadRes = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "products" }, (err, result) => {
          if (err || !result) return reject(err);
          resolve(result);
        })
        .end(buffer);
    });

    /* ───────── 4. Lưu DB ───────── */
    const imageUrl = uploadRes.secure_url;
    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      productCode,
      imageUrl,
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (err: any) {
    /* ───────── 5. Bắt duplicate key do unique‑index ───────── */
    if (err?.code === 11000) {
      const dupField = Object.keys(err.keyPattern ?? {})[0] as "name" | "productCode";
      const code = dupField === "name" ? ERROR.DUP_NAME : ERROR.DUP_CODE;
      return NextResponse.json(
        { success: false, code, field: dupField },
        { status: 409 }
      );
    }

    console.error("Product POST error:", err);
    return NextResponse.json(
      { success: false, code: "UPLOAD_FAILED" },
      { status: 500 }
    );
  }
}
