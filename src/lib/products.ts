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

export const getProductBySlug = cache(async (slug: string) => {
  await connectMongoDB()
  const product = await Product.findOne({ slug }).populate("category", "_id name slug").lean()
  if (!product) return null
  return JSON.parse(JSON.stringify(product))
})

export const getAllProducts = cache(async () => {
  await connectMongoDB()
  const products = await Product.find().populate("category", "_id name slug").lean()
  return JSON.parse(JSON.stringify(products))
})
