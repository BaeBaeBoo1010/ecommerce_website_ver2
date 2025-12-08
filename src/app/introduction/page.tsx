import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Award,
  Users,
  Zap,
  Heart,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Home,
  Wrench,
} from "lucide-react";
import Script from "next/script";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Thiết bị điện Quang Minh - Chuyên cung cấp thiết bị điện, thiết bị thông minh chất lượng cao cho gia đình và công nghiệp tại TP.HCM. Cam kết giá tốt, bảo hành dài hạn.",
  keywords: [
    "giới thiệu thiết bị điện quang minh",
    "về chúng tôi",
    "thiết bị điện chất lượng",
    "smart home việt nam",
    "thiết bị thông minh hồ chí minh",
    "nhà cung cấp thiết bị điện",
  ],
  openGraph: {
    title: "Giới thiệu | Thiết bị điện Quang Minh",
    description:
      "Chuyên cung cấp thiết bị điện, thiết bị thông minh cho gia đình và công nghiệp. Cam kết chất lượng, giá tốt nhất thị trường.",
    url: `${siteUrl}/introduction`,
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: `${siteUrl}/introduction`,
  },
};

// About Page Schema
const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "Giới thiệu - Thiết bị điện Quang Minh",
  description:
    "Thiết bị điện Quang Minh - Chuyên cung cấp thiết bị điện, thiết bị thông minh chất lượng cao",
  url: `${siteUrl}/introduction`,
  mainEntity: {
    "@type": "Organization",
    name: "Thiết bị điện Quang Minh",
    description:
      "Chuyên cung cấp thiết bị điện, thiết bị thông minh cho gia đình và công nghiệp",
    foundingDate: "2020",
    slogan: "Automate your house",
    areaServed: {
      "@type": "Country",
      name: "Vietnam",
    },
    knowsAbout: [
      "Thiết bị điện",
      "Smart Home",
      "Thiết bị thông minh",
      "Tự động hóa ngôi nhà",
    ],
  },
};

const stats = [
  { number: "5+", label: "Năm kinh nghiệm", icon: Award },
  { number: "1000+", label: "Khách hàng tin tưởng", icon: Users },
  { number: "500+", label: "Sản phẩm đa dạng", icon: Zap },
  { number: "100%", label: "Cam kết chính hãng", icon: Shield },
];

const values = [
  {
    icon: Shield,
    title: "Chất lượng hàng đầu",
    description:
      "Tất cả sản phẩm đều được nhập khẩu từ các thương hiệu uy tín, đảm bảo chất lượng và độ bền cao.",
  },
  {
    icon: Heart,
    title: "Khách hàng là trọng tâm",
    description:
      "Chúng tôi luôn lắng nghe và đáp ứng nhu cầu của khách hàng với dịch vụ tư vấn tận tâm.",
  },
  {
    icon: Lightbulb,
    title: "Đổi mới sáng tạo",
    description:
      "Liên tục cập nhật các sản phẩm công nghệ mới nhất, mang đến giải pháp smart home tiên tiến.",
  },
  {
    icon: Wrench,
    title: "Hỗ trợ chuyên nghiệp",
    description:
      "Đội ngũ kỹ thuật viên giàu kinh nghiệm, sẵn sàng hỗ trợ lắp đặt và bảo trì.",
  },
];

const whyChooseUs = [
  "Sản phẩm chính hãng 100%, nguồn gốc rõ ràng",
  "Giá cạnh tranh nhất thị trường",
  "Bảo hành chính hãng từ 12-36 tháng",
  "Giao hàng nhanh toàn quốc",
  "Đổi trả miễn phí trong 7 ngày",
  "Tư vấn miễn phí, hỗ trợ lắp đặt tại nhà",
  "Đa dạng hình thức thanh toán",
  "Chính sách hậu mãi chu đáo",
];

export default function IntroductionPage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <Script
        id="about-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 py-20 text-white">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Thiết bị điện <span className="text-yellow-300">Quang Minh</span>
              </h1>
              <p className="mb-4 text-xl text-blue-100 md:text-2xl">
                Automate Your House
              </p>
              <p className="mx-auto max-w-2xl text-lg text-blue-200">
                Chuyên cung cấp thiết bị điện và giải pháp smart home chất lượng cao, 
                giúp nâng cấp ngôi nhà của bạn trở nên thông minh và tiện nghi hơn.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative -mt-10 container mx-auto px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border-none bg-white shadow-lg transition-transform hover:-translate-y-1 dark:bg-neutral-800"
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stat.number}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">
                Về <span className="text-blue-600">Quang Minh</span>
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Thiết bị điện Quang Minh</strong> được thành lập với sứ mệnh mang đến 
                  các sản phẩm thiết bị điện và thiết bị thông minh chất lượng cao cho người tiêu dùng Việt Nam.
                </p>
                <p>
                  Với hơn <strong>5 năm kinh nghiệm</strong> trong lĩnh vực thiết bị điện và smart home, 
                  chúng tôi tự hào là đối tác tin cậy của hàng ngàn gia đình và doanh nghiệp trên toàn quốc.
                </p>
                <p>
                  Chúng tôi cam kết mang đến những sản phẩm <strong>chính hãng, giá tốt</strong>, 
                  kết hợp với dịch vụ tư vấn chuyên nghiệp và hậu mãi chu đáo, 
                  giúp khách hàng có trải nghiệm mua sắm tốt nhất.
                </p>
              </div>
              <div className="mt-8">
                <Link href="/products">
                  <Button size="lg" className="group">
                    Xem sản phẩm
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                <div className="flex h-full items-center justify-center">
                  <div className="p-8 text-center">
                    <Home className="mx-auto mb-4 h-24 w-24 text-blue-600" />
                    <p className="text-xl font-semibold text-blue-800 dark:text-blue-300">
                      Smart Home Solutions
                    </p>
                    <p className="mt-2 text-blue-600 dark:text-blue-400">
                      Nâng cấp ngôi nhà của bạn
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-gray-50 py-16 dark:bg-neutral-800/50">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Giá trị cốt lõi
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="group border-none bg-white shadow-md transition-all hover:shadow-lg dark:bg-neutral-800"
                >
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 w-fit rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white transition-transform group-hover:scale-110">
                      <value.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{value.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Tại sao chọn <span className="text-blue-600">Quang Minh</span>?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {whyChooseUs.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-neutral-800"
                >
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-6 text-3xl font-bold">Sứ mệnh của chúng tôi</h2>
              <p className="text-lg text-blue-100">
                Mang đến cho mọi gia đình Việt Nam cơ hội sở hữu những sản phẩm thiết bị điện 
                và smart home chất lượng cao với giá cả hợp lý, góp phần nâng cao chất lượng 
                cuộc sống và xây dựng những ngôi nhà thông minh, an toàn, tiện nghi.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="mb-4 text-2xl font-bold">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="mb-8 text-gray-600 dark:text-gray-400">
            Liên hệ ngay với chúng tôi để được tư vấn miễn phí
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Xem sản phẩm
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Liên hệ ngay
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
