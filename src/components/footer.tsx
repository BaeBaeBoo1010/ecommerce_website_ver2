"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="mt-20 border-t-4 border-gray-200 bg-white">
      <Card className="rounded-none border-none shadow-none">
        {/* Logo + Slogan */}
        <div className="flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2">
            <Image src="/images/logo.webp" alt="Logo" width={40} height={40} />
            <span className="text-xl font-bold">Quang Minh</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Thiết bị điện thông minh - Automate your house
          </p>
        </div>
        <CardContent className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 px-4 py-10 text-sm text-gray-700 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Điều hướng */}
          <div>
            <h4 className="mb-2 text-xl font-semibold">Điều hướng</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/" className="hover:underline">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:underline">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/introduction" className="hover:underline">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <h4 className="mb-2 text-xl font-semibold">Liên hệ</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-1 ml-[-4px] h-6 w-6" />
                <span>1B/1, Đường Quán Tre, Phường Trung Mỹ Tây, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>0908 357 997 - 0986 456 254</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>kawaquangminh@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Vị trí cửa hàng */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="mb-2 text-xl font-semibold">Vị trí cửa hàng</h4>
            <div className="overflow-hidden rounded-md">
              <iframe
                title="Google Map Quang Minh"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1005.1507265371326!2d106.61393326955582!3d10.845162999331762!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752a31a9a7fc33%3A0x431a94d43afc4e72!2zMUIgxJDGsMahzIBuZyBRdWHMgW4gVHJlLCBUcnVuZyBN4bu5IFTDonksIFF14bqtbiAxMiwgSOG7kyBDaMOtIE1pbmgsIFZpZXRuYW0!5e1!3m2!1sen!2s!4v1752585967090!5m2!1sen!2s"
                width="100%"
                height="200"
                className="h-[200px] w-full rounded-md border-0 sm:h-[250px]"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            {/* Nút chỉ đường */}
            <div className="mt-4">
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=1B+Đường+Quán+Tre,+Trung+Mỹ+Tây,+Quận+12,+Hồ+Chí+Minh,+Vietnam"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full sm:w-auto">
                  <MapPin />
                  Chỉ đường đến cửa hàng
                </Button>
              </a>
            </div>
          </div>

          {/* Chính sách */}
          <div>
            <h4 className="mb-2 text-xl font-semibold">Chính sách</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/" className="hover:underline">
                  Quy định chung
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  Chính sách Bảo mật thông tin
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  Chính sách Bảo hành
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  Chính sách Đổi trả hàng
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:underline">
                  Chính sách Thanh toán và giao hàng
                </Link>
              </li>
            </ul>
          </div>
        </CardContent>

        <Separator />

        <div className="text-muted-foreground py-4 text-center text-xs">
          © {new Date().getFullYear()} Quang Minh. All rights reserved.
        </div>
      </Card>
    </footer>
  );
}
