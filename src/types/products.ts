export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}
