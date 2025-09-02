// app/products/[id]/page.tsx
import { connectMongoDB } from "@/lib/mongodb";
import { Product } from "@/models/product";
import type { Metadata } from "next";
import type { Product as ProductType } from "@/types/product";
import ProductDetail from "@/components/product-detail";
import ProductDetailWrapper from "@/components/product-detail-wrapper";
import { headers } from "next/headers";

export const revalidate = 120;

// ✅ Hàm dùng chung check bot
async function isCrawler() {
  const headersList = await headers()
  const userAgent = headersList.get("user-agent") || ""
  const acceptHeader = headersList.get("accept") || ""
  const acceptLanguage = headersList.get("accept-language") || ""
  const acceptEncoding = headersList.get("accept-encoding") || ""

  // Danh sách bot phổ biến và đầy đủ hơn
  const botPatterns = [
    // Search engine bots
    "googlebot",
    "bingbot",
    "slurp",
    "duckduckbot",
    "baiduspider",
    "yandexbot",
    "sogou",
    "exabot",
    "facebot",
    "ia_archiver",

    // Social media bots
    "facebookexternalhit",
    "facebookcatalog",
    "twitterbot",
    "linkedinbot",
    "pinterestbot",
    "redditbot",
    "whatsapp",
    "telegrambot",
    "discordbot",
    "tiktokbot",
    "zalo",
    "zbot",
    "viberbot",

    // SEO và monitoring tools
    "ahrefsbot",
    "semrushbot",
    "mj12bot",
    "dotbot",
    "rogerbot",
    "screaming frog",
    "sitebulb",
    "deepcrawl",
    "botify",
    "oncrawl",

    // Security và analysis bots
    "securitytrails",
    "shodan",
    "censys",
    "masscan",
    "nmap",

    // Other common bots
    "applebot",
    "amazonbot",
    "slackbot",
    "skypebot",
    "wechatbot",
    "vkshare",
    "okhttp",
    "python-requests",
    "curl",
    "wget",
    "postman",
    "insomnia",
    "httpie",
    "node-fetch",
    "axios",
  ]

  // Kiểm tra user agent
  const userAgentLower = userAgent.toLowerCase()
  const isBotByUserAgent = botPatterns.some((pattern) => userAgentLower.includes(pattern))

  // Kiểm tra các dấu hiệu đặc trưng của bot
  const suspiciousPatterns = [
    // User agent rỗng hoặc quá ngắn
    userAgent.length === 0 || userAgent.length < 10,

    // Không có accept header hoặc accept header đặc trưng của bot
    !acceptHeader || acceptHeader === "*/*",

    // Không có accept-language
    !acceptLanguage,

    // Accept-encoding đặc trưng của bot
    acceptEncoding === "gzip" || acceptEncoding === "identity",

    // User agent chứa các từ khóa đặc trưng
    /bot|crawler|spider|scraper|fetcher|validator|checker|monitor/i.test(userAgent),

    // User agent có format đặc trưng của bot
    /^[a-zA-Z]+\/[\d.]+$/.test(userAgent), // Ví dụ: "curl/7.68.0"

    // Các pattern đặc trưng khác
    /headless|phantom|selenium|webdriver|puppeteer|playwright/i.test(userAgent),
  ]

  const isSuspicious = suspiciousPatterns.some(Boolean)

  // Kiểm tra IP ranges của các bot lớn (optional - cần thêm logic IP checking)
  // const clientIP = headersList.get('x-forwarded-for') || headersList.get('x-real-ip');

  return isBotByUserAgent || isSuspicious
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const crawler = await isCrawler();

  if (!crawler) {
    return {
      title: "Thiết bị điện Quang Minh",
      description:
        "Xem chi tiết sản phẩm tại cửa hàng Thiết bị điện Quang Minh",
    };
  }

  await connectMongoDB();
  const { id } = await params;

  const product = (await Product.findById(id)
    .populate("category", "name slug")
    .lean()) as ProductType | null;

  if (!product) return { title: "Sản phẩm không tồn tại" };

  const title = `${product.name} - ${product.category?.name || "Sản phẩm"}`;
  const description =
    product.description?.slice(0, 160) ||
    `Mua ${product.name} với giá tốt nhất tại cửa hàng.`;
  const imageUrl = product.imageUrls?.[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
    other: {
      "og:type": "product",
      "og:locale": "vi_VN",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const crawler = await isCrawler();


  if (crawler) {
    await connectMongoDB();
    const product = (await Product.findById(id)
      .populate("category", "name slug")
      .lean()) as ProductType | null;

    if (!product) return <div>Sản phẩm không tồn tại</div>;

    return <ProductDetail product={product} />;
  }

  return <ProductDetailWrapper productId={id} />;
}
