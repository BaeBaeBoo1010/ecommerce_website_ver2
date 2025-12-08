export interface Product {
  id: string;
  name: string;
  slug: string;
  productCode: string;
  description?: string;
  price: number;
  category: Category;
  imageUrls: string[];
  articleHtml: string;
  isArticleEnabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}