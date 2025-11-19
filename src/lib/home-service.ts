import { connectMongoDB } from "@/lib/mongodb";
import { Category } from "@/models/category";
import type { CategoryWithProducts } from "@/types/product";

/** Lấy danh mục + top‑10 sản phẩm, đã sort mới nhất */
export async function getHomeData(): Promise<CategoryWithProducts[]> {
  await connectMongoDB();

  return Category.aggregate<CategoryWithProducts>([
    {
      $lookup: {
        from: "products",
        let: { catId: "$_id" },
        pipeline: [
          { 
            $match: { 
              $expr: { $eq: ["$category", "$$catId"] } // So sánh trực tiếp ObjectId với ObjectId
            } 
          },
          { $sort: { createdAt: -1 } },
          { $limit: 10 }, // Chỉ lấy 10 sản phẩm
          {
            $project: { // Chỉ lấy field cần thiết để giảm dung lượng mạng
              name: 1,
              price: 1,
              imageUrls: { $slice: ["$imageUrls", 1] }, // Chỉ lấy ảnh đầu tiên (thumbnail)
              slug: 1,
              description: 1,
            },
          },
        ],
        as: "products",
      },
    },
    // Chỉ giữ lại category nào CÓ sản phẩm (tùy chọn, giúp UI gọn hơn)
    // { $match: { "products.0": { $exists: true } } },
    { $project: { name: 1, slug: 1, products: 1 } },
  ]).exec();
}

