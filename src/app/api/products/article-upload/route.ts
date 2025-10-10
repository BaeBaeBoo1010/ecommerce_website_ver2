/* app/api/products/article-upload/route.ts */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary"

cloudinary.config(true);

const ERROR = {
  MISSING_FIELD: "MISSING_FIELD",
  UPLOAD_FAILED: "UPLOAD_FAILED",
} as const

export async function POST(req: Request) {
  try {
    // optional: lấy productCode từ query nếu client gửi theo query
    const { searchParams } = new URL(req.url)
    const queryProductCode = searchParams.get("productCode")?.trim()

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const formProductCode = (formData.get("productCode") as string | null)?.trim() || null

    const productCode = formProductCode || queryProductCode || null

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary env missing")
      return NextResponse.json(
        { success: false, code: ERROR.UPLOAD_FAILED, message: "Cloudinary not configured" },
        { status: 500 },
      )
    }

    if (!file || !productCode) {
      console.error("Missing file or productCode", { fileExists: !!file, productCode })
      return NextResponse.json({ success: false, code: ERROR.MISSING_FIELD }, { status: 400 })
    }

    // Convert File -> Buffer (chạy được trên Node runtime)
    const arrayBuf = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuf)

    const publicId = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`

    const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `products/${productCode}/article`,
            public_id: publicId,
            overwrite: false,
            resource_type: "image",
          },
          (err, result) => {
            if (err) return reject(err)
            resolve(result as UploadApiResponse)
          },
        )
        .end(buffer)
    })

    return NextResponse.json({
      success: true,
      url: uploaded.secure_url,
      public_id: uploaded.public_id,
    })
  } catch (err: any) {
    console.error("Upload article error:", err)
    return NextResponse.json(
      { success: false, code: ERROR.UPLOAD_FAILED, message: String(err?.message ?? err) },
      { status: 500 },
    )
  }
}
