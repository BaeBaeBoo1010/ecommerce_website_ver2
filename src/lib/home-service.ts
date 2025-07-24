import { connectMongoDB } from "@/lib/mongodb";
import { Category } from "@/models/category";
import type { CategoryWithProducts } from "@/types/products";

/** Lấy danh mục + top‑10 sản phẩm, đã sort mới nhất */
export async function getHomeData(): Promise<CategoryWithProducts[]> {
  await connectMongoDB();

  return Category.aggregate<CategoryWithProducts>([
    { $addFields: { _id: { $toString: "$_id" } } },        // ⬅️  _id → string
    {
      $lookup: {
        from: "products",
        let: { catId: "$_id" },
        pipeline: [
          { $match: { $expr: { $eq: ["$category", { $toObjectId: "$$catId" }] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          {
            $project: {
              _id: { $toString: "$_id" },                  // ⬅️  _id → string
              name: 1,
              price: 1,
              imageUrl: 1,
            },
          },
        ],
        as: "products",
      },
    },
    { $project: { _id: 1, name: 1, slug: 1, products: 1 } },
  ]).exec();
}

