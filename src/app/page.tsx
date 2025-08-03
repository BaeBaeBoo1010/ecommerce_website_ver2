import HomeClient from "@/components/home-client";
import { getHomeData } from "@/lib/home-service";
import type { CategoryWithProducts } from "@/types/product";

export const revalidate = 300; // ISR: rebuild HTML sau 5 phút khi có truy cập

export default async function Page() {
  const data: CategoryWithProducts[] = await getHomeData(); // gọi thẳng DB, 0 HTTP
  return <HomeClient initialData={data} />;
}
