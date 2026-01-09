import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Shield,
  Heart,
  Lightbulb,
  Wrench,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Script from "next/script";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.me";

const contactInfo = {
  name: "Thiết bị cảm ứng Quang Minh",
  phone: "0986 456 254",
  email: "kawaquangminh@gmail.com",
  address: "1B Đường Quán Tre, Trung Mỹ Tây, Quận 12, Hồ Chí Minh, Việt Nam",
  workingHours: "8:00 - 18:00 (Thứ 2 - Thứ 7)",
  mapUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1005.1507265371326!2d106.61393326955582!3d10.845162999331762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752a31a9a7fc33%3A0x431a94d43afc4e72!2zMUIgxJDGsMahzIBuZyBRdWHMgW4gVHJlLCBUcnVuZyBN4bu5IFTDonksIFF14bqtbiAxMiwgSOG7kyBDaMOtIE1pbmgsIFZpZXRuYW0!5e1!3m2!1sen!2s!4v1752585967090!5m2!1sen!2s",
  directionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=1B+Đường+Quán+Tre,+Trung+Mỹ+Tây,+Quận+12,+Hồ+Chí+Minh,+Vietnam",
};

export const metadata: Metadata = {
  title: "Cửa hàng",
  description:
    "Thông tin liên hệ và giới thiệu về Thiết bị cảm ứng Quang Minh. Địa chỉ: Quận 12, TP.HCM. Chuyên cung cấp thiết bị cảm ứng chất lượng cao.",
  openGraph: {
    title: "Cửa hàng | Thiết bị cảm ứng Quang Minh",
    description:
      "Thông tin liên hệ và giới thiệu về Thiết bị cảm ứng Quang Minh. Địa chỉ: Quận 12, TP.HCM.",
    url: `${siteUrl}/store-info`,
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: `${siteUrl}/store-info`,
  },
};

const values = [
  {
    icon: Shield,
    title: "Chất lượng hàng đầu",
    description: "Sản phẩm chính hãng, độ bền cao.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Heart,
    title: "Khách hàng là trọng tâm",
    description: "Tư vấn tận tâm, hỗ trợ nhiệt tình.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Lightbulb,
    title: "Đổi mới sáng tạo",
    description: "Cập nhật công nghệ mới nhất.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Wrench,
    title: "Hỗ trợ chuyên nghiệp",
    description: "Kỹ thuật viên giàu kinh nghiệm.",
    color: "from-emerald-500 to-green-500",
  },
];

const whyChooseUs = [
  "Sản phẩm chính hãng 100%",
  "Giá cạnh tranh nhất thị trường",
  "Bảo hành 12-36 tháng",
  "Giao hàng nhanh toàn quốc",
  "Đổi trả trong 7 ngày",
  "Hỗ trợ lắp đặt tại nhà",
];

export default function StoreInfoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-16 dark:from-neutral-900 dark:to-neutral-950">
      {/* Hero Header - Modern glassmorphism style */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-16 text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Automate Your House
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Thiết bị cảm ứng{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-white bg-clip-text text-transparent">
              Quang Minh
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-blue-100/90">
            Chuyên cung cấp các giải pháp smart home hiện đại, công tắc cảm ứng
            và thiết bị điều khiển thông minh cho ngôi nhà của bạn.
          </p>
        </div>
      </section>

      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Thiết bị cảm ứng Quang Minh",
            image: `${siteUrl}/images/logo.webp`,
            "@id": siteUrl,
            url: siteUrl,
            telephone: contactInfo.phone,
            email: contactInfo.email,
            address: {
              "@type": "PostalAddress",
              streetAddress: "1B Đường Quán Tre, Trung Mỹ Tây",
              addressLocality: "Quận 12",
              addressRegion: "Hồ Chí Minh",
              postalCode: "700000",
              addressCountry: "VN",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: 10.845163,
              longitude: 106.613933,
            },
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ],
                opens: "08:00",
                closes: "18:00",
              },
            ],
            sameAs: [],
          }),
        }}
      />

      {/* Contact Cards - Floating above hero */}
      <section className="container mx-auto -mt-8 px-4">
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Address Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-800/80">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="relative flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 text-white shadow-lg shadow-blue-500/25">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-gray-900 dark:text-white">
                Địa chỉ
              </h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {contactInfo.address}
              </p>
            </CardContent>
          </Card>

          {/* Phone Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-800/80">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="relative flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-4 text-white shadow-lg shadow-green-500/25">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-gray-900 dark:text-white">
                Hotline
              </h3>
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                className="text-lg font-semibold text-green-600 transition-colors hover:text-green-700 dark:text-green-400"
              >
                {contactInfo.phone}
              </a>
            </CardContent>
          </Card>

          {/* Email Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-800/80">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="relative flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 p-4 text-white shadow-lg shadow-rose-500/25">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-gray-900 dark:text-white">
                Email
              </h3>
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-sm font-medium text-rose-600 transition-colors hover:text-rose-700 dark:text-rose-400"
              >
                {contactInfo.email}
              </a>
            </CardContent>
          </Card>

          {/* Working Hours Card */}
          <Card className="group relative overflow-hidden border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-neutral-800/80">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <CardContent className="relative flex flex-col items-center p-6 text-center">
              <div className="mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-4 text-white shadow-lg shadow-amber-500/25">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-gray-900 dark:text-white">
                Giờ làm việc
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {contactInfo.workingHours}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Map & Actions Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Map - takes 2/3 */}
          <Card className="overflow-hidden border-0 shadow-xl lg:col-span-2">
            <iframe
              title="Bản đồ"
              src={contactInfo.mapUrl}
              width="100%"
              height="400"
              className="border-0"
              allowFullScreen
              loading="lazy"
            />
            <div className="flex justify-end border-t border-gray-100 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
              <a
                href={contactInfo.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shine relative inline-flex items-center overflow-hidden rounded-md bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-blue-700 hover:to-indigo-600"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Chỉ đường đến cửa hàng
              </a>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5" />
                  Liên hệ nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  asChild
                >
                  <a
                    href={`https://zalo.me/${contactInfo.phone.replace(/\s/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" /> Chat Zalo ngay
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/30 bg-transparent text-white hover:bg-white/10"
                  asChild
                >
                  <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}>
                    <Phone className="mr-2 h-5 w-5" /> Gọi: {contactInfo.phone}
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-emerald-50 to-green-50 shadow-lg dark:from-emerald-900/20 dark:to-green-900/20">
              <CardContent className="p-5">
                <h3 className="mb-4 flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle className="h-5 w-5" />
                  Tại sao chọn chúng tôi?
                </h3>
                <ul className="space-y-2.5">
                  {whyChooseUs.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section - Modernized */}
      <section className="container mx-auto mt-20 px-4">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-neutral-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-12 text-center text-white">
            <h2 className="mb-3 text-3xl font-bold">Về Quang Minh</h2>
            <p className="mx-auto max-w-2xl text-gray-300">
              Hơn{" "}
              <span className="font-bold text-cyan-400">5 năm kinh nghiệm</span>{" "}
              trong lĩnh vực thiết bị cảm ứng và smart home tại Việt Nam
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="mx-auto mb-10 max-w-3xl text-center text-gray-600 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">
                Thiết bị cảm ứng Quang Minh
              </strong>{" "}
              được thành lập với sứ mệnh mang đến các sản phẩm thiết bị cảm ứng
              chất lượng cao cho người tiêu dùng Việt Nam. Chúng tôi tự hào là
              đối tác tin cậy của hàng ngàn gia đình trên khắp cả nước.
            </p>

            {/* Core Values - Modern cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-2xl bg-gray-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-neutral-700"
                >
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-r ${v.color} p-3 text-white shadow-lg`}
                  >
                    <v.icon className="h-6 w-6" />
                  </div>
                  <h4 className="mb-2 font-bold text-gray-900 dark:text-white">
                    {v.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-10 text-center">
              <Link
                href="/products"
                className="btn-shine relative inline-flex items-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
              >
                Khám phá sản phẩm
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
