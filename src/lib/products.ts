/* eslint-disable @typescript-eslint/no-unused-vars */
import { connectMongoDB } from "@/lib/mongodb"
import { Product } from "@/models/product"
import { Category } from "@/models/category"

export async function getProductById(id: string) {
  await connectMongoDB()
  const product = await Product.findById(id).populate("category", "_id name slug").lean()

  if (!product) return null

  return JSON.parse(JSON.stringify(product)) // Đảm bảo dữ liệu serializable
}
