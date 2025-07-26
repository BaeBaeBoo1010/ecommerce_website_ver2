export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  description?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}
