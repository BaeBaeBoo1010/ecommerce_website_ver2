import HomeClient from "@/components/home-client";

/* ------------ Shared types (có thể tách ra /types.ts) ------------ */
export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
}
interface Category {
  _id: string;
  name: string;
  slug: string;
}
export interface CategoryWithProducts extends Category {
  products: Product[];
}

/* ------------ Fetch & cache (ISR 60 s) ------------ */
const fetchHome = async (): Promise<CategoryWithProducts[]> => {
  const res = await fetch("/api/home", { 
    next: { revalidate: 60 },
  });
  if (!res.ok) return []; // status ≠ 200
  const json = await res.json();
  return Array.isArray(json.categories) ? json.categories : [];
};

/* ------------ Server component ------------- */
export default async function Page() {
  const data = await fetchHome(); // duy nhất 1 request trên server
  return <HomeClient initialData={data} />; // chuyển qua client component
}
