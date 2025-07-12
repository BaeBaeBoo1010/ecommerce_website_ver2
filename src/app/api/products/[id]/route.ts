import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ secure: true });

function extractPublicId(imageUrl: string): string {
  const parts = imageUrl.split("/");
  const uploadIndex = parts.findIndex((p) => p === "upload");
  const publicIdWithExt = parts.slice(uploadIndex + 1).join("/"); // e.g. products/abc.jpg
  return publicIdWithExt.replace(/\.[^/.]+$/, ""); // remove extension
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();

    // Tìm sản phẩm theo ID
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy sản phẩm." },
        { status: 404 }
      );
    }

    // Xoá ảnh trên Cloudinary theo productCode
    const publicId = `products/${product.productCode}`;
    await cloudinary.uploader.destroy(publicId);

    // Xoá sản phẩm khỏi MongoDB
    await Product.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lỗi xoá sản phẩm:", err);
    return NextResponse.json(
      { success: false, error: "Lỗi server khi xoá sản phẩm." },
      { status: 500 }
    );
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    const product = await Product.findById(params.id).populate("category", "_id name slug");
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy sản phẩm." },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (err) {
    console.error("Lỗi GET sản phẩm:", err);
    return NextResponse.json({ success: false, error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoDB();
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Không tìm thấy sản phẩm." }, { status: 404 });
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const productCode = formData.get("productCode") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const category = formData.get("category") as string;
    const file = formData.get("image") as File | null;

    let imageUrl = product.imageUrl;

    if (file && typeof file === "object") {
      // Xoá ảnh cũ trên Cloudinary
      const publicId = extractPublicId(product.imageUrl);
      await cloudinary.uploader.destroy(publicId);

      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadRes = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "products",
            public_id: productCode,
            overwrite: true,
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      imageUrl = (uploadRes as any).secure_url;
    }

    // Cập nhật lại sản phẩm
    product.name = name;
    product.productCode = productCode;
    product.description = description;
    product.price = price;
    product.category = category;
    product.imageUrl = imageUrl;

    await product.save();

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error("Lỗi PUT sản phẩm:", err);
    return NextResponse.json(
      { success: false, error: "Cập nhật thất bại." },
      { status: 500 }
    );
  }
}