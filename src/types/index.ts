export interface Category {
  name: string;
  slug: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  categoryId: string | Category;
}
