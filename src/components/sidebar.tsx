import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Menu, Home, Box, Info, Phone } from "lucide-react";
import Link from "next/link";

export default function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="mx-2 flex cursor-pointer items-center rounded-2xl p-2 hover:bg-gray-100 active:bg-gray-200 lg:hidden">
          <Menu />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle className="text-left text-lg font-bold">Menu</SheetTitle>
        </SheetHeader>

        <nav className="mt-0 ml-5 flex flex-col space-y-4 overflow-scroll">
          <SheetClose asChild>
            <Link href="/" className="flex gap-2 text-base hover:underline">
              <Home />
              Trang chủ
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/products"
              className="flex gap-2 text-base hover:underline"
            >
              <Box />
              Sản phẩm
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/introduction"
              className="flex gap-2 text-base hover:underline"
            >
              <Info />
              Giới thiệu
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/contact"
              className="flex gap-2 text-base hover:underline"
            >
              <Phone />
              Liên hệ
            </Link>
          </SheetClose>
          <div className="mt-3 flex flex-col gap-2 border-t pt-3">
            <p className="text-muted-foreground mb-2 text-xs">
              DANH MỤC SẢN PHẨM
            </p>

            <SheetClose asChild>
              <Link
                href="/products/switch-remote"
                className="flex items-center gap-2 hover:underline"
              >
                Công tắc điều khiển từ xa
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href="/products/infrared"
                className="flex items-center gap-2 hover:underline"
              >
                Cảm ứng hồng ngoại
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href="/products/light-sensor"
                className="flex items-center gap-2 hover:underline"
              >
                Đèn cảm ứng
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href="/products/doorbell"
                className="flex items-center gap-2 hover:underline"
              >
                Chuông cửa
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href="/products/timer-switch"
                className="flex items-center gap-2 hover:underline"
              >
                Công tắc hẹn giờ
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href="/products/alarm"
                className="flex items-center gap-2 hover:underline"
              >
                Thiết bị báo trộm
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href="/products/presence-sensor"
                className="flex items-center gap-2 hover:underline"
              >
                Cảm biến hiện diện
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href="/products/guest-bell"
                className="flex items-center gap-2 hover:underline"
              >
                Thiết bị báo khách
              </Link>
            </SheetClose>

            <SheetClose asChild>
              <Link
                href="/products/smart-home"
                className="flex items-center gap-2 hover:underline"
              >
                Thiết bị nhà thông minh
              </Link>
            </SheetClose>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
