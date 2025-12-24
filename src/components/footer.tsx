"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import LazyMap from "@/components/lazy-map";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname === "/cart") return null;

  return (
    <footer className="relative hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 lg:block">
      {/* Decorative top wave */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="mx-auto max-w-screen-xl px-4 pt-12 pb-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Logo & About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white p-1 shadow-lg">
                <Image
                  src="/images/logo.webp"
                  alt="Logo Quang Minh"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Quang Minh</h3>
                <p className="text-xs text-gray-400">Thiết bị cảm ứng</p>
              </div>
            </div>
            <p className="mb-4 text-sm leading-relaxed text-gray-400">
              Chuyên cung cấp thiết bị điện thông minh, công tắc cảm ứng, hệ
              thống điều khiển từ xa cho ngôi nhà hiện đại.
            </p>
            <p className="text-sm text-gray-500 italic">
              ✨ Automate your house
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
              Điều hướng
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Trang chủ" },
                { href: "/products", label: "Sản phẩm" },
                { href: "/store-info", label: "Cửa hàng" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    <ChevronRight className="h-3 w-3 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
              Liên hệ với chúng tôi
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=1B+Đường+Quán+Tre,+Trung+Mỹ+Tây,+Quận+12,+Hồ+Chí+Minh,+Vietnam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-gray-400 transition-colors hover:text-white"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                  <span>1B Đường Quán Tre, Trung Mỹ Tây, Quận 12, TP.HCM</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:0123456789"
                  className="flex items-center gap-3 text-sm text-gray-400 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-green-400" />
                  <span>0123 456 789</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@thietbicamung.me"
                  className="flex items-center gap-3 text-sm text-gray-400 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0 text-red-400" />
                  <span>contact@thietbicamung.me</span>
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-medium text-white">
                Theo dõi chúng tôi
              </p>
              <div className="flex gap-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-700/50 text-gray-400 transition-all hover:scale-110 hover:bg-blue-600 hover:text-white"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-700/50 text-gray-400 transition-all hover:scale-110 hover:bg-blue-500 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
              Vị trí cửa hàng
            </h4>
            <div className="overflow-hidden rounded-xl border border-gray-700 shadow-lg">
              <LazyMap
                title="Google Map Quang Minh"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1005.1507265371326!2d106.61393326955582!3d10.845162999331762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752a31a9a7fc33%3A0x431a94d43afc4e72!2zMUIgxJDGsMahzIBuZyBRdWHMgW4gVHJlLCBUcnVuZyBN4bu5IFTDonksIFF14bqtbiAxMiwgSOG7kyBDaMOtIE1pbmgsIFZpZXRuYW0!5e1!3m2!1sen!2s!4v1752585967090!5m2!1sen!2s"
                className="h-[200px] w-full"
              />
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=1B+Đường+Quán+Tre,+Trung+Mỹ+Tây,+Quận+12,+Hồ+Chí+Minh,+Vietnam"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-gray-600 bg-transparent text-gray-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-white"
              >
                <MapPin className="h-4 w-4" />
                Chỉ đường đến cửa hàng
              </Button>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-gray-500">
            © {currentYear} <span className="text-gray-400">Quang Minh</span>.
            All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <Link href="/" className="transition-colors hover:text-white">
              Chính sách bảo mật
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/" className="transition-colors hover:text-white">
              Điều khoản sử dụng
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/" className="transition-colors hover:text-white">
              Chính sách đổi trả
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
