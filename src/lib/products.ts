// lib/products.ts
import { cache } from "react"
import { connectMongoDB } from "@/lib/mongodb"
import { Product } from "@/models/product"
import "@/models/category"

export const getProductById = cache(async (id: string) => {
  await connectMongoDB()
  const product = await Product.findById(id).populate("category", "_id name slug").lean()
  if (!product) return null
  return JSON.parse(JSON.stringify(product))
})
