import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { requireAdmin } from "@/lib/auth-helpers";
import { revalidateProduction } from "@/lib/revalidate-production";

if (!process.env.CLOUDINARY_URL) {
  console.error("⚠️ Missing CLOUDINARY_URL in environment");
}
cloudinary.config({ secure: true });

const ERROR = {
  NOT_FOUND: "NOT_FOUND",
  DUP_SLUG: "DUP_SLUG",
  DUP_CODE: "DUP_CODE",
  UPDATE_FAILED: "UPDATE_FAILED",
  DELETE_FAILED: "DELETE_FAILED",
  UPLOAD_FAILED: "UPLOAD_FAILED",
} as const;

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

/* ───────── GET /api/products/[slug] ───────── */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      product_code,
      price,
      description,
      image_urls,
      article_html,
      is_article_enabled,
      category:categories (
        id,
        name,
        slug
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, code: ERROR.NOT_FOUND }, { status: 404 });
  }

  // Transform to camelCase
  const product = {
    id: data.id,
    name: data.name,
    slug: data.slug,
    productCode: data.product_code,
    price: data.price,
    description: data.description,
    imageUrls: data.image_urls || [],
    articleHtml: data.article_html,
    isArticleEnabled: data.is_article_enabled,
    category: data.category ? {
      id: (data.category as any).id,
      name: (data.category as any).name,
      slug: (data.category as any).slug,
    } : null,
  };

  return NextResponse.json({ success: true, product });
}

/* ───────── PUT /api/products/[slug] (FormData) ───────── */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  // 🔒 Security: Require admin authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { slug } = await context.params;

    // Find existing product (include image_urls for cleanup)
    const { data: existing, error: findError } = await supabase
      .from("products")
      .select("id, slug, product_code, image_urls")
      .eq("slug", slug)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ success: false, code: ERROR.NOT_FOUND }, { status: 404 });
    }

    const formData = await req.formData();

    // Extract fields from FormData
    const name = (formData.get("name") as string)?.trim();
    const productCode = (formData.get("productCode") as string)?.trim();
    const price = formData.get("price") as string;
    const categoryId = formData.get("category") as string;
    const description = (formData.get("description") as string)?.trim();
    const articleHtml = formData.get("articleHtml") as string;
    const isArticleEnabled = formData.get("isArticleEnabled") === "true";
    const keptImageUrls = formData.getAll("keptImageUrls") as string[];
    const newImages = formData.getAll("images") as File[];

    // Build update object
    const updates: Record<string, any> = {};

    // Parallelize duplicate checks
    const checkPromises: Promise<{ type: string; field: string } | null>[] = [];

    if (name) {
      updates.name = name;
    }

    if (productCode && productCode !== existing.product_code) {
      checkPromises.push(
        (async () => {
          const { data } = await supabase
          .from("products")
          .select("id")
          .eq("product_code", productCode)
          .neq("id", existing.id)
          .single();
          return data ? { type: "code", field: "productCode" } : null;
        })()
      );
      updates.product_code = productCode;
    }

    const checkResults = await Promise.all(checkPromises);
    const codeError = checkResults.find((r) => r && r.type === "code");

    if (codeError) {
      return NextResponse.json(
        { success: false, code: ERROR.DUP_CODE, field: codeError.field },
        { status: 409 }
      );
    }

    if (price) updates.price = Number(price);
    if (categoryId) updates.category_id = categoryId;
    if (description !== undefined) updates.description = description || null;
    if (articleHtml !== undefined) updates.article_html = articleHtml || null;
    updates.is_article_enabled = isArticleEnabled;

    // Handle images: kept + new uploads in parallel
    const finalImageUrls: string[] = [...keptImageUrls];
    const uploadProductCode = productCode || existing.product_code;

    const uploadPromises = newImages
      .filter((image) => image && image.size > 0)
      .map((image) => uploadToCloudinary(image, uploadProductCode));

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      finalImageUrls.push(...uploadedUrls);
    } catch (err) {
      console.error("❌ Image upload failed:", err);
      return NextResponse.json(
        { success: false, code: ERROR.UPLOAD_FAILED },
        { status: 500 }
      );
    }

    updates.image_urls = finalImageUrls;

    // Update in Supabase
    const { data: updated, error: updateError } = await supabase
      .from("products")
      .update(updates)
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Supabase update error:", updateError);
      return NextResponse.json(
        { success: false, code: ERROR.UPDATE_FAILED },
        { status: 500 }
      );
    }

    // Clean up removed images from Cloudinary (fire and forget)
    const existingImageUrls = (existing.image_urls as string[]) || [];
    const removedImageUrls = existingImageUrls.filter(
      (url) => !keptImageUrls.includes(url)
    );

    if (removedImageUrls.length > 0) {
      // Extract public_ids from Cloudinary URLs and delete them
      const deletePromises = removedImageUrls.map(async (url) => {
        try {
          // Extract public_id from Cloudinary URL
          // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{public_id}.{ext}
          const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
          if (match && match[1]) {
            const publicId = match[1];
            await cloudinary.uploader.destroy(publicId);
            console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
          }
        } catch (err) {
          console.warn(`⚠️ Failed to delete image from Cloudinary: ${url}`, err);
          // Don't fail the request - image cleanup is best-effort
        }
      });

      // Run deletions in parallel (fire and forget)
      Promise.all(deletePromises).catch((err) => {
        console.warn("⚠️ Cloudinary cleanup batch error:", err);
      });
    }

    // Revalidate BOTH slug and layout/list pages
    revalidatePath("/", "layout");
    revalidatePath("/products", "page");
    revalidatePath(`/products/${slug}`, "page");
    
    // Trigger production revalidation
    await revalidateProduction(slug);

    // Warm up the product page
    const finalSlug = slug;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    // Always warm up the current/new page
    fetch(`${baseUrl}/products/${finalSlug}`, { 
      cache: "no-store",
      headers: { "x-vercel-skip-cdn": "1" } // Bypass CDN to trigger origin regeneration
    })
      .then(() => console.log(`✅ Warmed up page: /products/${finalSlug}`))
      .catch((err) => console.warn(`⚠️ Failed to warm up page: ${err.message}`));

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("PUT /api/products/[slug] error:", err);
    return NextResponse.json(
      { success: false, code: ERROR.UPDATE_FAILED },
      { status: 500 }
    );
  }
}

/* ───────── PATCH /api/products/[slug] (JSON) ───────── */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  // 🔒 Security: Require admin authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { slug } = await context.params;

    // Find existing product
    const { data: existing, error: findError } = await supabase
      .from("products")
      .select("id, slug, product_code")
      .eq("slug", slug)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ success: false, code: ERROR.NOT_FOUND }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      productCode,
      price,
      categoryId,
      description,
      imageUrls,
      articleHtml,
      isArticleEnabled,
    } = body;

    // Build update object
    const updates: Record<string, any> = {};

    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (productCode !== undefined) {
      // Check for duplicate product code if changed
      if (productCode.trim() !== existing.product_code) {
        const { data: dupCode } = await supabase
          .from("products")
          .select("id")
          .eq("product_code", productCode.trim())
          .neq("id", existing.id)
          .single();

        if (dupCode) {
          return NextResponse.json(
            { success: false, code: ERROR.DUP_CODE, field: "productCode" },
            { status: 409 }
          );
        }
      }
      updates.product_code = productCode.trim();
    }

    if (price !== undefined) updates.price = Number(price);
    if (categoryId !== undefined) updates.category_id = categoryId;
    if (description !== undefined) updates.description = description?.trim() || null;
    if (imageUrls !== undefined) updates.image_urls = imageUrls;
    if (articleHtml !== undefined) updates.article_html = articleHtml;
    if (isArticleEnabled !== undefined) updates.is_article_enabled = isArticleEnabled;

    // Update
    const { data: updated, error: updateError } = await supabase
      .from("products")
      .update(updates)
      .eq("id", existing.id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Supabase update error:", updateError);
      return NextResponse.json(
        { success: false, code: ERROR.UPDATE_FAILED },
        { status: 500 }
      );
    }

    // Revalidate pages to show updated product
    revalidatePath("/", "layout");
    revalidatePath("/products", "page");
    revalidatePath(`/products/${slug}`, "page");
    
    // Trigger production revalidation
    await revalidateProduction(slug);

    // Warm up the product page
    const finalSlug = slug;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    // Always warm up the current/new page
    fetch(`${baseUrl}/products/${finalSlug}`, { 
      cache: "no-store",
      headers: { "x-vercel-skip-cdn": "1" } // Bypass CDN to trigger origin regeneration
    })
      .then(() => console.log(`✅ Warmed up page: /products/${finalSlug}`))
      .catch((err) => console.warn(`⚠️ Failed to warm up page: ${err.message}`));

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("PATCH /api/products/[slug] error:", err);
    return NextResponse.json(
      { success: false, code: ERROR.UPDATE_FAILED },
      { status: 500 }
    );
  }
}

/* ───────── DELETE /api/products/[slug] ───────── */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  // 🔒 Security: Require admin authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { slug } = await context.params;

    // Find product to delete (need image_urls and product_code for Cloudinary cleanup)
    const { data: product, error: findError } = await supabase
      .from("products")
      .select("id, image_urls, product_code")
      .eq("slug", slug)
      .single();

    if (findError || !product) {
      return NextResponse.json({ success: false, code: ERROR.NOT_FOUND }, { status: 404 });
    }

    // Delete from Supabase first
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (deleteError) {
      console.error("❌ Supabase delete error:", deleteError);
      return NextResponse.json(
        { success: false, code: ERROR.DELETE_FAILED },
        { status: 500 }
      );
    }

    // Clean up Cloudinary images and folder (fire and forget)
    if (product.product_code) {
      try {
        // First, delete all images in the folder
        await cloudinary.api.delete_resources_by_prefix(`products/${product.product_code}/`);
        // Then, delete the empty folder
        await cloudinary.api.delete_folder(`products/${product.product_code}`);
      } catch (cloudErr) {
        console.warn("⚠️ Cloudinary cleanup failed:", cloudErr);
        // Don't fail the request - product is already deleted
      }
    }

    // Revalidate pages after deletion
    revalidatePath("/", "layout");
    revalidatePath("/products", "page");
    revalidatePath(`/products/${slug}`, "page");

    // Trigger production revalidation (when running on localhost)
    await revalidateProduction();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/products/[slug] error:", err);
    return NextResponse.json(
      { success: false, code: ERROR.DELETE_FAILED },
      { status: 500 }
    );
  }
}
