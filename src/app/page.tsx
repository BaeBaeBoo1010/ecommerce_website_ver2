import HomeClient from "@/components/home-client";
import type { Metadata } from "next";
import Script from "next/script";
import { connectMongoDB } from "@/lib/mongodb";
import { getHomeData } from "@/lib/home-service";
import { Product } from "@/models/product";



const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  const count = await Product.countDocuments();

  return {
    title: "Trang chủ",
    description:
      "Chuyên cung cấp thiết bị điện, thiết bị thông minh cho gia đình và công nghiệp. Hơn " +
      count +
      " sản phẩm chất lượng cao, giá tốt nhất thị trường.",
    openGraph: {
      title: "Thiết bị điện Quang Minh - Trang chủ",
      description:
        "Chuyên cung cấp thiết bị điện, thiết bị thông minh cho gia đình và công nghiệp. Hơn " +
        count +
        " sản phẩm chất lượng cao.",
      url: siteUrl,
      images: [
        {
          url: `${siteUrl}/images/logo.webp`,
          width: 1200,
          height: 630,
          alt: "Thiết bị điện Quang Minh",
        },
      ],
    },
    alternates: {
      canonical: siteUrl,
    },
  };
}

export default async function Page() {
  // Lấy data từ server
  await connectMongoDB();
  const categoriesData = await getHomeData();

  // Lấy tất cả products từ categories để tạo schema
  const allProducts = categoriesData.flatMap((cat) => cat.products);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";

  // ItemList schema cho homepage
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Danh sách sản phẩm thiết bị điện",
    description: "Danh sách các sản phẩm thiết bị điện nổi bật",
    itemListElement: allProducts.slice(0, 10).map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        url: `${siteUrl}/products/${product.slug}`,
        image: product.imageUrls?.[0] || "",
        offers: {
          "@type": "Offer",
          price: product.price,
          priceCurrency: "VND",
        },
      },
    })),
  };

  return (
    <>
      <Script
        id="homepage-itemlist-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <HomeClient initialData={categoriesData} />
    </>
  );
}
