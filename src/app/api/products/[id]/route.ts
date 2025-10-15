// app/api/products/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { connectMongoDB } from "@/lib/mongodb"
import { Product } from "@/models/product"
import { v2 as cloudinary } from "cloudinary"
import type { UploadApiResponse } from "cloudinary"

if (!process.env.CLOUDINARY_URL) {
  console.error("⚠️ Missing CLOUDINARY_URL in environment")
}
cloudinary.config({ secure: true })

function extractPublicId(url: string) {
  const parts = url.split("/");
  const uploadIndex = parts.findIndex((p) => p === "upload");
  if (uploadIndex === -1) return "";

  // Lấy tất cả phần sau "upload" → loại bỏ version (nếu có)
  let publicIdWithVersion = parts.slice(uploadIndex + 1).join("/"); // v1760200033/products/test5/file.jpg

  // Bỏ version nếu có (bắt đầu bằng "v" + số)
  publicIdWithVersion = publicIdWithVersion.replace(/^v\d+\//, "");

  // Loại bỏ đuôi file
  const publicId = publicIdWithVersion.replace(/\.[^/.]+$/, "");

  return publicId; // products/test5/cl8efctihpby7ch5whjm
}



function extractCloudinaryUrls(html: string): string[] {
  if (!html) return []

  // Match img tags with Cloudinary URLs
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi
  const urls: string[] = []
  let match

  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1]
    // Only include Cloudinary URLs
    if (url.includes("cloudinary.com")) {
      urls.push(url)
    }
  }

  return urls
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
      return NextResponse.json({ success: false, code: ERROR.NOT_FOUND, message: "Product not found" }, { status: 404 })
    }

    const formData = await req.formData()
    const name = formData.get("name")?.toString().trim()
    const productCode = formData.get("productCode")?.toString().trim()
    const description = formData.get("description")?.toString()
    const price = Number.parseFloat(formData.get("price") as string)
    const category = formData.get("category")?.toString()
    const articleHtml = (formData.get("articleHtml") as string)?.trim() || ""
    const isArticleEnabled = formData.get("isArticleEnabled") === "true"

    if (!name || !productCode || isNaN(price) || !category) {
      return NextResponse.json(
        { success: false, code: ERROR.MISSING_FIELD, message: "Missing required fields" },
        { status: 400 },
      )
    }

    const existing = await Product.findOne(
      {
        _id: { $ne: id },
        $or: [{ name }, { productCode }],
      },
      { name: 1, productCode: 1 },
    ).lean<{ name: string; productCode: string }>()

    if (existing) {
      const field = existing.name === name ? "name" : "productCode"
      const code = field === "name" ? ERROR.DUP_NAME : ERROR.DUP_CODE
      return NextResponse.json({ success: false, code, field }, { status: 409 })
    }

    const files = formData.getAll("images") as File[]
    const keptImageUrlsRaw = formData.getAll("keptImageUrls") as string[]
    const keptImageUrls = keptImageUrlsRaw.map((url) => url.trim()).filter(Boolean)
    const newImageUrls: string[] = []

    // Upload new files song song
    if (files.length > 0) {
      const uploadPromises = files.map(async (file, i) => {
        const buffer = Buffer.from(await file.arrayBuffer())
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: `products/${productCode}`,
                public_id: `${Date.now()}-${i}`,
                resource_type: "image",
                overwrite: true,
              },
              (err, res) => (err ? reject(err) : resolve(res as UploadApiResponse)),
            )
            .end(buffer)
        })
        return result.secure_url
      })
      newImageUrls.push(...(await Promise.all(uploadPromises)))
    }

    const finalImageUrls = [...keptImageUrls, ...newImageUrls]

    // Collect images to delete
    const oldImages = Array.isArray(product.imageUrls) ? product.imageUrls : []
    const removedImages = oldImages.filter((url: string) => !keptImageUrls.includes(url))
    const removedImagePublicIds = removedImages.map(extractPublicId)

    const oldArticleHtml = product.articleHtml || ""
    const oldArticleImages = extractCloudinaryUrls(oldArticleHtml)
    const newArticleImages = extractCloudinaryUrls(articleHtml)
    const removedArticleImages = oldArticleImages.filter((url) => !newArticleImages.includes(url))
    const removedArticlePublicIds = removedArticleImages.map(extractPublicId)

    const allPublicIdsToDelete = [...removedImagePublicIds, ...removedArticlePublicIds].filter(Boolean)

    // ✅ Delete all unused images concurrently
    if (allPublicIdsToDelete.length > 0) {
      console.log("Deleting Cloudinary images:", allPublicIdsToDelete)

      const deleteResults = await Promise.allSettled(
        allPublicIdsToDelete.map(async (publicId) => {
          const res = await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
          return { publicId, result: res }
        }),
      )

      deleteResults.forEach((r) => {
        if (r.status === "fulfilled") {
          console.log(`[destroy] Deleted: ${r.value.publicId}`, r.value.result)
        } else {
          console.error("[destroy] Failed:", r.reason)
        }
      })
    }

    // ✅ Update MongoDB product
    product.name = name
    product.productCode = productCode
    product.description = description
    product.price = price
    product.category = category
    product.imageUrls = finalImageUrls
    product.articleHtml = articleHtml
    product.isArticleEnabled = isArticleEnabled

    await product.save()

    console.log("oldArticleImages:", oldArticleImages)
    console.log("newArticleImages:", newArticleImages)
    console.log("removedArticleImages:", removedArticleImages)

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("PUT Error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}


