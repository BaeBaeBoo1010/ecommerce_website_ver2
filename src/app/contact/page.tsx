import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Clock, MessageCircle } from "lucide-react";
import Script from "next/script";
import Link from "next/link";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.vercel.app";

const contactInfo = {
  name: "Thiết bị điện Quang Minh",
  phone: "0123 456 789", // Update with actual phone number
  email: "contact@quangminh.vn", // Update with actual email
  address: "1B Đường Quán Tre, Trung Mỹ Tây, Quận 12, Hồ Chí Minh, Việt Nam",
  workingHours: "8:00 - 18:00 (Thứ 2 - Thứ 7)",
  mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1005.1507265371326!2d106.61393326955582!3d10.845162999331762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752a31a9a7fc33%3A0x431a94d43afc4e72!2zMUIgxJDGsMahzIBuZyBRdWHMgW4gVHJlLCBUcnVuZyBN4bu5IFTDonksIFF14bqtbiAxMiwgSOG7kyBDaMOtIE1pbmgsIFZpZXRuYW0!5e1!3m2!1sen!2s!4v1752585967090!5m2!1sen!2s",
  directionsUrl: "https://www.google.com/maps/dir/?api=1&destination=1B+Đường+Quán+Tre,+Trung+Mỹ+Tây,+Quận+12,+Hồ+Chí+Minh,+Vietnam",
};

export const metadata: Metadata = {
  title: "Liên hệ",
  description:
    "Liên hệ với Thiết bị điện Quang Minh để được tư vấn và hỗ trợ tốt nhất về các sản phẩm thiết bị điện, thiết bị thông minh. Địa chỉ: Quận 12, TP.HCM.",
  keywords: [
    "liên hệ thiết bị điện",
    "thiết bị điện quang minh",
    "mua thiết bị điện quận 12",
    "thiết bị thông minh hồ chí minh",
    "tư vấn thiết bị điện",
  ],
  openGraph: {
    title: "Liên hệ | Thiết bị điện Quang Minh",
    description:
      "Liên hệ với chúng tôi để được tư vấn và hỗ trợ tốt nhất về các sản phẩm thiết bị điện, thiết bị thông minh.",
    url: `${siteUrl}/contact`,
    type: "website",
    locale: "vi_VN",
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

// Local Business Schema for SEO
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: contactInfo.name,
  description: "Chuyên cung cấp thiết bị điện, thiết bị thông minh cho gia đình và công nghiệp",
  url: siteUrl,
  telephone: contactInfo.phone,
  email: contactInfo.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "1B Đường Quán Tre",
    addressLocality: "Quận 12",
    addressRegion: "Hồ Chí Minh",
    addressCountry: "VN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 10.845162999331762,
    longitude: 106.61393326955582,
  },
  openingHours: "Mo-Sa 08:00-18:00",
  priceRange: "$$",
};

// Contact Page Schema
const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Trang liên hệ - Thiết bị điện Quang Minh",
  description: "Liên hệ với Thiết bị điện Quang Minh để được tư vấn và hỗ trợ",
  url: `${siteUrl}/contact`,
  mainEntity: {
    "@type": "Organization",
    name: contactInfo.name,
    telephone: contactInfo.phone,
    email: contactInfo.email,
  },
};

export default function ContactPage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Script
        id="contact-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-800">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Liên hệ với chúng tôi</h1>
            <p className="mx-auto max-w-2xl text-lg text-blue-100">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ ngay để được tư vấn về các sản phẩm thiết bị điện và thiết bị thông minh.
            </p>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Phone */}
            <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-blue-100 p-4 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  <Phone className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-lg font-semibold">Điện thoại</h2>
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {contactInfo.phone}
                </a>
                <p className="mt-2 text-sm text-gray-500">Gọi ngay để được tư vấn</p>
              </CardContent>
            </Card>

            {/* Email */}
            <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-green-100 p-4 text-green-600 dark:bg-green-900 dark:text-green-300">
                  <Mail className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-lg font-semibold">Email</h2>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                >
                  {contactInfo.email}
                </a>
                <p className="mt-2 text-sm text-gray-500">Phản hồi trong 24h</p>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-orange-100 p-4 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                  <MapPin className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-lg font-semibold">Địa chỉ</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300">{contactInfo.address}</p>
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-4 rounded-full bg-purple-100 p-4 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                  <Clock className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-lg font-semibold">Giờ làm việc</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300">{contactInfo.workingHours}</p>
                <p className="mt-2 text-sm text-gray-500">Chủ nhật: Nghỉ</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Map & Contact Form Section */}
        <section className="container mx-auto px-4 pb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Map */}
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Vị trí cửa hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <iframe
                  title="Bản đồ Thiết bị điện Quang Minh"
                  src={contactInfo.mapUrl}
                  width="100%"
                  height="350"
                  className="border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="p-4">
                  <a
                    href={contactInfo.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full">
                      <MapPin className="mr-2 h-4 w-4" />
                      Chỉ đường đến cửa hàng
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Liên hệ nhanh
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Bạn cần tư vấn về thiết bị điện hoặc giải pháp smart home? Hãy liên hệ ngay với chúng tôi qua các kênh bên dưới.
                </p>

                {/* Zalo Button */}
                <a
                  href="https://zalo.me/0123456789" // Update with actual Zalo
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full bg-blue-500 hover:bg-blue-600" size="lg">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Chat qua Zalo
                  </Button>
                </a>

                {/* Phone Button */}
                <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`} className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    <Phone className="mr-2 h-5 w-5" />
                    Gọi ngay: {contactInfo.phone}
                  </Button>
                </a>

                {/* Email Button */}
                <a href={`mailto:${contactInfo.email}`} className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    <Mail className="mr-2 h-5 w-5" />
                    Gửi email
                  </Button>
                </a>

                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-300">
                    Tại sao chọn Quang Minh?
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                    <li>✓ Sản phẩm chính hãng, chất lượng cao</li>
                    <li>✓ Giá cạnh tranh nhất thị trường</li>
                    <li>✓ Tư vấn miễn phí, hỗ trợ lắp đặt</li>
                    <li>✓ Bảo hành dài hạn, đổi trả dễ dàng</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section className="bg-gray-50 py-12 dark:bg-neutral-800/50">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-center text-2xl font-bold">Câu hỏi thường gặp</h2>
            <div className="mx-auto max-w-3xl space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-2 font-semibold">Cửa hàng có giao hàng toàn quốc không?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Có, chúng tôi giao hàng toàn quốc qua các đơn vị vận chuyển uy tín. Miễn phí giao hàng cho đơn từ 500.000đ trong nội thành TP.HCM.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-2 font-semibold">Chính sách bảo hành như thế nào?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tất cả sản phẩm đều được bảo hành chính hãng từ 12 đến 36 tháng tùy từng sản phẩm. Đổi trả miễn phí trong 7 ngày nếu có lỗi từ nhà sản xuất.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-2 font-semibold">Có hỗ trợ lắp đặt tại nhà không?</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Có, chúng tôi có đội ngũ kỹ thuật viên chuyên nghiệp hỗ trợ lắp đặt tại nhà với chi phí hợp lý. Liên hệ để được báo giá.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-12 text-center">
          <h2 className="mb-4 text-2xl font-bold">Sẵn sàng nâng cấp ngôi nhà của bạn?</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            Khám phá các sản phẩm thiết bị điện và smart home chất lượng cao
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Xem sản phẩm
            </Button>
          </Link>
        </section>
      </main>
    </>
  );
}
