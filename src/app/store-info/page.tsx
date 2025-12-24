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
  Users,
  Award,
  Zap,
} from "lucide-react";
import Script from "next/script";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thietbicamung.me";

const contactInfo = {
  name: "Thiết bị điện Quang Minh",
  phone: "0123 456 789",
  email: "contact@quangminh.vn",
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
    "Thông tin liên hệ và giới thiệu về Thiết bị điện Quang Minh. Địa chỉ: Quận 12, TP.HCM. Chuyên cung cấp thiết bị điện, smart home chất lượng cao.",
  openGraph: {
    title: "Cửa hàng | Thiết bị điện Quang Minh",
    description:
      "Thông tin liên hệ và giới thiệu về Thiết bị điện Quang Minh. Địa chỉ: Quận 12, TP.HCM.",
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
  },
  {
    icon: Heart,
    title: "Khách hàng là trọng tâm",
    description: "Tư vấn tận tâm, hỗ trợ nhiệt tình.",
  },
  {
    icon: Lightbulb,
    title: "Đổi mới sáng tạo",
    description: "Cập nhật công nghệ mới nhất.",
  },
  {
    icon: Wrench,
    title: "Hỗ trợ chuyên nghiệp",
    description: "Kỹ thuật viên giàu kinh nghiệm.",
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
    <main className="min-h-screen bg-gray-50 pb-16 dark:bg-neutral-900">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">
            Thông tin Cửa hàng
          </h1>
          <p className="text-blue-100">
            Liên hệ & Giới thiệu về Thiết bị điện Quang Minh
          </p>
        </div>
      </section>

      {/* --- PART 1: CONTACT INFO & MAP (Priority) --- */}
      <section className="container mx-auto -mt-8 px-4">
        {/* Contact Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Địa chỉ</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {contactInfo.address}
              </p>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Hotline</h3>
              <a
                href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {contactInfo.phone}
              </a>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Email</h3>
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                {contactInfo.email}
              </a>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col items-center p-4 text-center">
              <div className="mb-3 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold">Giờ làm việc</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {contactInfo.workingHours}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Map & Actions */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Map takes 2/3 space on large screens */}
          <Card className="overflow-hidden lg:col-span-2">
            <iframe
              title="Bản đồ"
              src={contactInfo.mapUrl}
              width="100%"
              height="400"
              className="border-0"
              allowFullScreen
              loading="lazy"
            />
            <div className="flex justify-end p-4">
              <Button asChild variant="outline">
                <a
                  href={contactInfo.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Chỉ đường
                </a>
              </Button>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liên hệ nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  asChild
                >
                  <a
                    href="https://zalo.me/0123456789"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" /> Chat Zalo
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}>
                    <Phone className="mr-2 h-5 w-5" /> Gọi Hotline
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10">
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-300">
                  Tại sao chọn chúng tôi?
                </h3>
                <ul className="space-y-2 text-sm">
                  {whyChooseUs.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span className="text-gray-700 dark:text-gray-300">
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

      {/* --- PART 2: INTRODUCTION (Shortened) --- */}
      <section className="container mx-auto mt-16 px-4">
        <div className="rounded-2xl bg-white p-8 shadow-sm dark:bg-neutral-800">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-bold">Về Quang Minh</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              <strong>Thiết bị điện Quang Minh</strong> được thành lập với sứ
              mệnh mang đến các sản phẩm thiết bị điện và thiết bị thông minh
              chất lượng cao cho người tiêu dùng Việt Nam. Với hơn{" "}
              <strong>5 năm kinh nghiệm</strong>, chúng tôi tự hào là đối tác
              tin cậy của hàng ngàn gia đình. Slogan của chúng tôi:{" "}
              <span className="font-bold text-blue-600">
                "Automate Your House"
              </span>
              .
            </p>

            {/* Core Values Icons */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="mb-2 rounded-full bg-gray-100 p-3 text-gray-700 dark:bg-neutral-700 dark:text-gray-300">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-semibold">{v.title}</h4>
                  <p className="text-xs text-gray-500">{v.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button asChild>
                <Link href="/products">Xem tất cả sản phẩm</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
