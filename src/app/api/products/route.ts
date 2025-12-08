import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/product-service";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/slugify";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

if (!process.env.CLOUDINARY_URL) {
  console.error("⚠️ Missing CLOUDINARY_URL in environment");
}
cloudinary.config({ secure: true });

export const revalidate = 300; // ISR: cache 5 minutes

const ERROR = {
  MISSING_FIELD: "MISSING_FIELD",
  DUP_SLUG: "DUP_SLUG",
  DUP_CODE: "DUP_CODE",
  CREATE_FAILED: "CREATE_FAILED",
  UPLOAD_FAILED: "UPLOAD_FAILED",
} as const;

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// Helper function to upload image to Cloudinary
async function uploadToCloudinary(file: File, productCode: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const publicId = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}`;

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `products/${productCode}`,
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result as UploadApiResponse);
      }
    );
    stream.end(buffer);
  });

  return result.secure_url;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extract fields from FormData
    const name = (formData.get("name") as string)?.trim();
    const productCode = (formData.get("productCode") as string)?.trim();
    const price = formData.get("price") as string;
    const categoryId = formData.get("category") as string;
    const description = (formData.get("description") as string)?.trim();
    const articleHtml = formData.get("articleHtml") as string;
    const isArticleEnabled = formData.get("isArticleEnabled") === "true";
    const images = formData.getAll("images") as File[];

    // Validation
    if (!name) {
      return NextResponse.json(
        { success: false, code: ERROR.MISSING_FIELD, field: "name" },
        { status: 400 }
      );
    }
    if (!productCode) {
      return NextResponse.json(
        { success: false, code: ERROR.MISSING_FIELD, field: "productCode" },
        { status: 400 }
      );
    }
    if (!price) {
      return NextResponse.json(
        { success: false, code: ERROR.MISSING_FIELD, field: "price" },
        { status: 400 }
      );
    }
    if (!categoryId) {
      return NextResponse.json(
        { success: false, code: ERROR.MISSING_FIELD, field: "categoryId" },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    // Check for duplicate slug
    const { data: existingSlug } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingSlug) {
      return NextResponse.json(
        { success: false, code: ERROR.DUP_SLUG, field: "name" },
        { status: 409 }
      );
    }

    // Check for duplicate product code
    const { data: existingCode } = await supabase
      .from("products")
      .select("id")
      .eq("product_code", productCode)
      .single();

    if (existingCode) {
      return NextResponse.json(
        { success: false, code: ERROR.DUP_CODE, field: "productCode" },
        { status: 409 }
      );
    }

    // Upload images to Cloudinary
    const imageUrls: string[] = [];
    for (const image of images) {
      if (image && image.size > 0) {
        try {
          const url = await uploadToCloudinary(image, productCode);
          imageUrls.push(url);
        } catch (err) {
          console.error("❌ Image upload failed:", err);
          return NextResponse.json(
            { success: false, code: ERROR.UPLOAD_FAILED },
            { status: 500 }
          );
        }
      }
    }

    // Insert product into Supabase
    const { data: created, error: createError } = await supabase
      .from("products")
      .insert([
        {
          name,
          slug,
          product_code: productCode,
          price: Number(price),
          category_id: categoryId,
          description: description || null,
          image_urls: imageUrls,
          article_html: articleHtml || null,
          is_article_enabled: isArticleEnabled,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error("❌ Supabase create error:", createError);
      return NextResponse.json(
        { success: false, code: ERROR.CREATE_FAILED },
        { status: 500 }
      );
    }

    // Revalidate pages to show new product
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/", "layout");
    revalidatePath("/products", "page");

    return NextResponse.json({ success: true, product: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/products error:", err);
    return NextResponse.json(
      { success: false, code: ERROR.CREATE_FAILED },
      { status: 500 }
    );
  }
}


