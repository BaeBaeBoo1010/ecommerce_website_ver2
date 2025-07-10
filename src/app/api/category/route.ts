// src/app/api/categories/route.ts
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Category } from "@/models/category";

export async function GET() {
  await connectMongoDB();
  const categories = await Category.find();
  return NextResponse.json(categories);
}
