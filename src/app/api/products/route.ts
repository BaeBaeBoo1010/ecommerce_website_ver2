// app/api/products/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { Category } from "@/models/category";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

if (!process.env.CLOUDINARY_URL) {
  console.error("⚠️ Missing CLOUDINARY_URL in environment");
}
cloudinary.config({ secure: true });

const ERROR = {
  DUP_NAME: "DUP_NAME",
  DUP_CODE: "DUP_CODE",
  MISSING_FIELD: "MISSING_FIELD",
  UPLOAD_FAILED: "UPLOAD_FAILED",
} as const;

// 🟢 GET /api/products
export async function GET(req: NextRequest) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");

    let filter = {};

    if (categorySlug && categorySlug !== "all") {
      const category = await Category.findOne({ slug: categorySlug });
      if (!category) return NextResponse.json([]);
      filter = { category: category._id };
    }

    const products = await Product.find(filter).populate("category", "name slug");
    return NextResponse.json(products);
  } catch (err) {
    console.error("GET products error:", err);
    return NextResponse.json(
      { success: false, error: "Không thể lấy danh sách sản phẩm." },
      { status: 500 }
    );
  }
}

// 🟢 POST /api/products
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const productCode = (formData.get("productCode") as string)?.trim();
    const articleHtml = (formData.get("articleHtml") as string)?.trim() || "";
    const isArticleEnabled = formData.get("isArticleEnabled") === "true";

    if (!files.length || !name || !productCode || !category || isNaN(price)) {
      return NextResponse.json(
        { success: false, code: ERROR.MISSING_FIELD },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Kiểm tra trùng tên hoặc mã sản phẩm
    const existing = await Product.findOne(
      { $or: [{ name }, { productCode }] },
      { name: 1, productCode: 1 }
    ).lean<{ name: string; productCode: string }>();

    if (existing) {
      const field = existing.name === name ? "name" : "productCode";
      const code = field === "name" ? ERROR.DUP_NAME : ERROR.DUP_CODE;
      return NextResponse.json({ success: false, code, field }, { status: 409 });
    }

    // ✅ Upload ảnh lên Cloudinary (bắt HTTPS link)
    const imageUrls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `products/${productCode}`,
              resource_type: "image",
              overwrite: false,
            },
            (err, result) => {
              if (err || !result) return reject(err);
              resolve(result);
            }
          )
          .end(buffer);
      });

      // ✅ luôn lấy link HTTPS
      imageUrls.push(uploaded.secure_url);
    }

    // Lưu vào DB
    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      productCode,
      imageUrls,
      articleHtml,
      isArticleEnabled,
    });

    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.code === 11000) {
      const dupField = Object.keys(err.keyPattern ?? {})[0] as "name" | "productCode";
      const code = dupField === "name" ? ERROR.DUP_NAME : ERROR.DUP_CODE;
      return NextResponse.json({ success: false, code, field: dupField }, { status: 409 });
    }

    console.error("POST product error:", err);
    return NextResponse.json(
      { success: false, code: ERROR.UPLOAD_FAILED },
      { status: 500 }
    );
  }
}
