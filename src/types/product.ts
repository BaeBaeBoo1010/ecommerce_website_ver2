export interface Product {
  _id: string;
  name: string;
  productCode: string;
  description?: string;
  price: number;
  category: Category;
  imageUrls: string[];
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}
