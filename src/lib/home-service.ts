import { connectMongoDB } from "@/lib/mongodb";   // của bạn
import { Category } from "@/models/category";
import type { CategoryWithProducts } from "@/app/page";

export async function getHomeData(): Promise<CategoryWithProducts[]> {
  await connectMongoDB();                         // tái‑sử dụng pool Mongoose

  return Category.aggregate<CategoryWithProducts>([
    {
      $lookup: {
        from: "products",
        let: { catId: "$_id" },                   // 👈 _id của Category
        pipeline: [
          { $match: { $expr: { $eq: ["$category", "$$catId"] } } },
          { $sort: { createdAt: -1 } },           // mới nhất
          { $limit: 10 },
          { $project: { _id: 1, name: 1, price: 1, imageUrl: 1 } },
        ],
        as: "products",
      },
    },
    { $project: { _id: 1, name: 1, slug: 1, products: 1 } },
  ]).exec();
}
