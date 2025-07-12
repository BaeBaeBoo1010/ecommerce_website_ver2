/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { Category } from "@/models/category";
import { v2 as cloudinary } from "cloudinary";

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

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const productCode = formData.get("productCode") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;

    if (!file || !productCode || !name || !description || !category || !price) {
      return NextResponse.json(
        { success: false, error: "Thiếu dữ liệu đầu vào." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "products",
          public_id: productCode,
          overwrite: true,
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(buffer);
    });

    const cloudinaryRes = uploadRes as any;
    const imageUrl = cloudinaryRes.secure_url;

    await connectMongoDB();
    const newProduct = await Product.create({
      name,
      productCode,
      description,
      price,
      category,
      imageUrl,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err) {
    console.error("Lỗi POST sản phẩm:", err);
    return NextResponse.json(
      { success: false, error: "Tạo sản phẩm thất bại." },
      { status: 500 }
    );
  }
}
