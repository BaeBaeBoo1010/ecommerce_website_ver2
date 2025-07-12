import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const productCode = formData.get("productCode") as string;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: "products" }, (err, result) => {
        if (err || !result) return reject(err);
        resolve(result);
      }).end(buffer);
    });

    const imageUrl = uploadRes.secure_url;

    await connectMongoDB();
    const newProduct = await Product.create({
      name,
      description,
      price,
      category,
      productCode,
      imageUrl,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}
