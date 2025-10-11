/* app/api/products/article-upload/route.ts */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

if (!process.env.CLOUDINARY_URL) {
  console.error("⚠️ Missing CLOUDINARY_URL in environment");
}
cloudinary.config({ secure: true });

const ERROR = {
  MISSING_FIELD: "MISSING_FIELD",
  UPLOAD_FAILED: "UPLOAD_FAILED",
} as const;

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryProductCode = searchParams.get("productCode")?.trim();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const formProductCode = (formData.get("productCode") as string | null)?.trim() || null;
    const productCode = formProductCode || queryProductCode || null;

    if (!file || !productCode) {
      return NextResponse.json(
        { success: false, code: ERROR.MISSING_FIELD, message: "Thiếu file hoặc productCode" },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const publicId = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`;

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `products/${productCode}/article`,
          public_id: publicId,
          resource_type: "image",
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);
        },
      );
      stream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (err: any) {
    console.error("❌ Upload article error:", err);
    return NextResponse.json(
      { success: false, code: ERROR.UPLOAD_FAILED, message: err?.message || "Unknown error" },
      { status: 500 },
    );
  }
}
