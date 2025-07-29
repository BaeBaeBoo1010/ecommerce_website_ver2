import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    const products = await Product.find({ imageUrl: { $exists: true, $ne: null } });

    let updatedCount = 0;

    for (const product of products) {
      if (!product.imageUrls || product.imageUrls.length === 0) {
        product.imageUrls = [product.imageUrl];
        product.imageUrl = undefined;
        await product.save();
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật ${updatedCount} sản phẩm`,
    });
  } catch (error) {
    console.error("Lỗi khi chuyển ảnh:", error);
    return NextResponse.json({ success: false, error: "Có lỗi xảy ra" }, { status: 500 });
  }
}
