// app/api/home/route.ts
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Category } from "@/models/category";

export async function GET() {
  await connectMongoDB();
  const data = await Category.aggregate([
    { $sort: { name: 1 } },
    {
      $lookup: {
        from: "products",
        let: { slug: "$slug" },
        pipeline: [
          { $match: { $expr: { $eq: ["$category", "$$slug"] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
        ],
        as: "products",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        products: 1,
      },
    },
  ]);
  return NextResponse.json(data);
}
