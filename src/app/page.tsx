import HomeClient from "@/components/home-client";

export const revalidate = 300; // vẫn giữ ISR nếu muốn, nhưng client fetch từ cache SWR

export default function Page() {
  return <HomeClient />; // bỏ initialData
}