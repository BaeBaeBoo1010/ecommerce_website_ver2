export interface Product {
  _id: string;
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
  _id: string;
  name: string;
  slug: string;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}
