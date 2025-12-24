import { supabase } from "@/lib/supabase";
import { snakeToCamel } from "@/lib/case";
import type { Product, Category } from "@/types/product";

export async function getAllProducts(): Promise<Product[]> {
  // Optimized query: exclude article_html and is_article_enabled for list view
  // These fields are only needed on product detail page
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      price,
      image_urls,
      category:categories (
        id,
        name,
        slug
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase fetch error:", error);
    return [];
  }

  // Transform snake_case to camelCase and format for frontend
  const products: Product[] = data.map((item: any) => {
    const camelItem = snakeToCamel(item);

    // Handle category transformation
    let category: Category = {
      id: "",
      name: "",
      slug: "",
    };
    if (camelItem.category) {
      category = {
        id: camelItem.category.id,
        name: camelItem.category.name,
        slug: camelItem.category.slug,
      };
    }

    return {
      id: camelItem.id,
      name: camelItem.name,
      slug: camelItem.slug,
      productCode: camelItem.productCode || "",
      price: camelItem.price,
      description: camelItem.description,
      imageUrls: Array.isArray(camelItem.imageUrls) ? camelItem.imageUrls : [],
      articleHtml: "", // Not fetched for list view
      isArticleEnabled: false, // Not fetched for list view
      category,
    };
  });

  return products;
}

/**
 * Fetch all products with ALL columns for admin pages
 * Includes: product_code, description, article_html, is_article_enabled
 */
export async function getAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
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
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase fetch error:", error);
    return [];
  }

  // Transform snake_case to camelCase and format for frontend
  const products: Product[] = data.map((item: any) => {
    const camelItem = snakeToCamel(item);

    // Handle category transformation
    let category: Category = {
      id: "",
      name: "",
      slug: "",
    };
    if (camelItem.category) {
      category = {
        id: camelItem.category.id,
        name: camelItem.category.name,
        slug: camelItem.category.slug,
      };
    }

    return {
      id: camelItem.id,
      name: camelItem.name,
      slug: camelItem.slug,
      productCode: camelItem.productCode || "",
      price: camelItem.price,
      description: camelItem.description || "",
      imageUrls: Array.isArray(camelItem.imageUrls) ? camelItem.imageUrls : [],
      articleHtml: camelItem.articleHtml || "",
      isArticleEnabled: camelItem.isArticleEnabled || false,
      category,
    };
  });

  return products;
}

/**
 * Fetch products for Admin List View
 * Optimized: Excludes heavy fields (article_html, description)
 */
export async function getAllProductsAdminList(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      product_code,
      price,
      image_urls,
      category:categories (
        id,
        name,
        slug
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Supabase fetch error:", error);
    return [];
  }

  const products: Product[] = data.map((item: any) => {
    const camelItem = snakeToCamel(item);

    let category: Category = { id: "", name: "", slug: "" };
    if (camelItem.category) {
      category = {
        id: camelItem.category.id,
        name: camelItem.category.name,
        slug: camelItem.category.slug,
      };
    }

    return {
      id: camelItem.id,
      name: camelItem.name,
      slug: camelItem.slug,
      productCode: camelItem.productCode || "",
      price: camelItem.price,
      description: "", // Excluded
      imageUrls: Array.isArray(camelItem.imageUrls) ? camelItem.imageUrls : [],
      articleHtml: "", // Excluded
      isArticleEnabled: false,
      category,
    };
  });

  return products;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      product_code,
      price,
      image_urls,
      category:categories (
        id,
        name,
        slug
      )
    `
    )
    .in("id", ids);

  if (error) {
    console.error("❌ Supabase fetch error:", error);
    return [];
  }

  const products: Product[] = data.map((item: any) => {
    const camelItem = snakeToCamel(item);

    let category: Category = { id: "", name: "", slug: "" };
    if (camelItem.category) {
      category = {
        id: camelItem.category.id,
        name: camelItem.category.name,
        slug: camelItem.category.slug,
      };
    }

    return {
      id: camelItem.id,
      name: camelItem.name,
      slug: camelItem.slug,
      productCode: camelItem.productCode || "",
      price: camelItem.price,
      description: "", 
      imageUrls: Array.isArray(camelItem.imageUrls) ? camelItem.imageUrls : [],
      articleHtml: "",
      isArticleEnabled: false,
      category,
    };
  });

  return products;
}

