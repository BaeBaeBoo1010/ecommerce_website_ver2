import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Category } from "@/models/category";
import { Product } from "@/models/product";

export async function GET() {
  try {
    await connectMongoDB();

    // ✅ Xoá dữ liệu cũ
    await Product.deleteMany();
    await Category.deleteMany();

    // ✅ Tạo category
    const categoriesData = [
      { name: "Chuông cửa", slug: "chuong-cua" },
      { name: "Cảm ứng", slug: "cam-ung" },
      { name: "Báo trộm", slug: "bao-trom" },
      { name: "Hẹn giờ", slug: "hen-gio" },
    ];

    const createdCategories = await Category.insertMany(categoriesData);

    // Map slug → category._id
    const categoryMap = Object.fromEntries(
      createdCategories.map((cat) => [cat.slug, cat._id])
    );

    // ✅ Danh sách sản phẩm (KHÔNG cần image)
    const productsData = [
      {
        name: "Chuông Cửa Không Dây",
        price: 201000,
        productID: "DB658",
        category: categoryMap["chuong-cua"],
        imageFile: "DB658.png",
      },
      {
        name: "Đui Đèn Cảm Ứng Hồng Ngoại",
        price: 118000,
        productID: "SS682",
        category: categoryMap["cam-ung"],
        imageFile: "SS682.jpg",
      },
      {
        name: "Báo Trộm Hồng Ngoại Có Remote Điều Khiển Từ Xa",
        price: 425000,
        productID: "i225DS",
        category: categoryMap["bao-trom"],
        imageFile: "i225DS.png",
      },
      {
        name: "Công Tắc Hẹn Giờ Kỹ Thuật Số",
        price: 259000,
        productID: "TS17C",
        category: categoryMap["hen-gio"],
        imageFile: "TS17C.webp",
      },
    ];
    
    // ✅ Gán đường dẫn ảnh tự động
    const productsWithImages = productsData.map((product) => ({
      ...product,
      image: `/upload/${product.imageFile}`,
    }));
    

    await Product.insertMany(productsWithImages);

    return NextResponse.json({ message: "✅ Đã seed thành công!" });
  } catch (error) {
    console.error("❌ Seed lỗi:", error);
    return NextResponse.json({ message: "❌ Seed thất bại" }, { status: 500 });
  }
}
