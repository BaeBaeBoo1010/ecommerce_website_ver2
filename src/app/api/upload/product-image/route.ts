/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ secure: true });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const productCode = formData.get("productCode") as string;

    if (!file || !productCode) {
      return NextResponse.json(
        { success: false, message: "Missing file or productCode" },
        { status: 400 }
      );
    }

    // Tạo buffer từ file
    const buffer = Buffer.from(await file.arrayBuffer());

    // Nếu muốn đặt tên file theo timestamp
    const publicId = `${Date.now()}`;

    const uploaded = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `products/${productCode}/article`,
            public_id: publicId,
            resource_type: "auto",
          },
          (err, result) => {
            if (err || !result) return reject(err);
            resolve(result);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: (uploaded as any).secure_url,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}
