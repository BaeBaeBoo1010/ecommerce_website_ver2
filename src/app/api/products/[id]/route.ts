import { type NextRequest, NextResponse } from "next/server"
import { connectMongoDB } from "@/lib/mongodb"
import { Product } from "@/models/product"
import { v2 as cloudinary } from "cloudinary"
import type { UploadApiResponse } from "cloudinary"

if (!process.env.CLOUDINARY_URL) {
  console.error("⚠️ Missing CLOUDINARY_URL in environment");
}
cloudinary.config({ secure: true })

function extractPublicId(url: string) {
  const parts = url.split("/")
  const uploadIndex = parts.findIndex((p) => p === "upload")
  return parts
    .slice(uploadIndex + 1)
    .join("/")
    .replace(/\.[^/.]+$/, "");
}

const ERROR = {
  DUP_NAME: "DUP_NAME",
  DUP_CODE: "DUP_CODE",
  NOT_FOUND: "NOT_FOUND",
  MISSING_FIELD: "MISSING_FIELD",
}

/* ───────── GET /api/products/[id] ───────── */
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  await connectMongoDB()

  const product = await Product.findById(id).populate("category", "_id name slug")

  if (!product) {
    return NextResponse.json({ success: false, code: ERROR.NOT_FOUND }, { status: 404 })
  }

  return NextResponse.json(product)
}

/* ───────── DELETE /api/products/[id] ───────── */
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    await connectMongoDB()

    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json({ success: false, message: "Sản phẩm không tồn tại" }, { status: 404 })
    }

    const productCode = product.productCode

    // Xóa ảnh trong folder (theo prefix productCode)
    await cloudinary.api.delete_resources_by_prefix(`products/${productCode}`)

    // Sau khi xóa ảnh, xóa luôn folder
    await cloudinary.api.delete_folder(`products/${productCode}`)

    // Xóa sản phẩm trong MongoDB
    await Product.findByIdAndDelete(id)

    return NextResponse.json({ success: true, message: "Đã xóa sản phẩm và ảnh" }, { status: 200 })
  } catch (err) {
    console.error("DELETE product error:", err)
    return NextResponse.json({ success: false, message: "Không thể xóa sản phẩm" }, { status: 500 })
  }
}

/* ───────── PUT /api/products/[id] ───────── */
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    await connectMongoDB()

    const product = await Product.findById(id)
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    const formData = await req.formData()
    const name = formData.get("name")?.toString().trim()
    const productCode = formData.get("productCode")?.toString().trim()
    const description = formData.get("description")?.toString()
    const price = Number.parseFloat(formData.get("price") as string)
    const category = formData.get("category")?.toString()

    if (!name || !productCode || isNaN(price) || !category) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    const files = formData.getAll("images") as File[]
    const keptImageUrlsRaw = formData.getAll("keptImageUrls") as string[]
    const keptImageUrls = keptImageUrlsRaw.map((url) => url.trim()).filter(Boolean)
    const newImageUrls: string[] = []

    // Upload new files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const buffer = Buffer.from(await file.arrayBuffer())

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: `products/${productCode}`,
              public_id: `${Date.now()}-${i}`,
              overwrite: true,
            },
            (err, result) => (err ? reject(err) : resolve(result)),
          )
          .end(buffer)
      })

      newImageUrls.push((uploadResult as UploadApiResponse).secure_url)
    }

    const finalImageUrls = [...keptImageUrls, ...newImageUrls]

    // Delete old images that are no longer used
    const oldImages = Array.isArray(product.imageUrls) ? product.imageUrls : []
    const removedImages = oldImages.filter((url: string) => !keptImageUrls.includes(url))

    for (const url of removedImages) {
      const publicId = extractPublicId(url)
      await cloudinary.uploader.destroy(publicId)
    }

    // Update product
    product.name = name
    product.productCode = productCode
    product.description = description
    product.price = price
    product.category = category
    product.imageUrls = finalImageUrls

    await product.save()

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("PUT Error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
