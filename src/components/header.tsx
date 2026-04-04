"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, ShoppingCart, User, Loader2 } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Category } from "@/types/product";
import { cn } from "@/lib/utils";

import SearchCommand from "./search-command";
import { useCart } from "@/context/cart-context";
import { slugify } from "@/lib/slugify";
import { CartDropdown } from "./cart-dropdown";

export default function Header() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const pathname = usePathname();
  const router = useRouter();

  const { totalItems: cartCount } = useCart();

  // Prefetch routes
  useEffect(() => {
    router.prefetch("/products");
    router.prefetch("/introduction");
    router.prefetch("/contact");
  }, [router]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // tránh setState khi component đã unmount

    async function loadCategories() {
      try {
        const res = await fetch("/api/categories", {
          next: { revalidate: 300 }, // Cache 5 minutes
        });

        if (!res.ok) {
          console.error("❌ Failed to load categories:", res.status);
          return;
        }

        const data: Category[] = await res.json();

        if (isMounted) {
          setCategories(data);
        }
      } catch (error) {
        console.error("❌ Error loading categories:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadCategories();

    return () => {
      isMounted = false; // tránh warning React
    };
  }, []);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // State to control dropdown close on click
  const [catDropdownHidden, setCatDropdownHidden] = useState(false);
  const [accDropdownHidden, setAccDropdownHidden] = useState(false);
  const [cartDropdownHidden, setCartDropdownHidden] = useState(false);

  // Reset dropdown state when mouse leaves
  const handleCatMouseLeave = () => setCatDropdownHidden(false);
  const handleAccMouseLeave = () => setAccDropdownHidden(false);
  const handleCartMouseLeave = () => setCartDropdownHidden(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header if scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Hide header if scrolling down and not at the top
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
      id="header"
      className={`fixed top-0 right-0 left-0 z-50 w-full border-b border-gray-200/70 bg-white/80 backdrop-blur-md transition-all duration-300 dark:border-neutral-700/70 dark:bg-neutral-900/70 ${
        isVisible ? "translate-y-0" : "-translate-y-full lg:translate-y-0"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-2 px-2 sm:h-16 sm:px-4 lg:h-20 lg:px-6">
        {/* LEFT: Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* MobileSidebar removed */}

          <Link
            href="/"
            aria-label="Trang chủ"
            className="flex shrink-0 items-center gap-2 transition-transform duration-300 hover:scale-95"
          >
            <Image
              src="/images/logo.webp"
              alt="Logo"
              width={62}
              height={62}
              className="hidden text-transparent xl:inline"
              priority
            />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-gray-500 sm:text-sm">
                Thiết bị cảm ứng
              </span>
              <span className="text-lg font-bold whitespace-nowrap text-gray-700 sm:text-2xl dark:text-white">
                Quang&nbsp;Minh
              </span>
              <span className="text-[9px] text-gray-400 italic sm:text-xs">
                Automate your house
              </span>
            </div>
          </Link>

          {/* Category dropdown (hidden < lg) - hover based */}
          <div
            className="group/cat relative hidden lg:block"
            onMouseLeave={handleCatMouseLeave}
          >
            <button
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-[16px] font-medium text-gray-700 transition hover:bg-gray-200 active:bg-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700"
              aria-label="Danh mục sản phẩm"
            >
              <Menu size={18} />
              <span className="hidden xl:inline">Danh mục</span>
            </button>
            {/* Hover Dropdown */}
            <div
              className={`absolute top-[calc(100%+10px)] left-0 z-[60] w-64 origin-top-left rounded-lg border border-gray-200 bg-white shadow-[0_1px_10px_rgba(0,0,0,0.1)] transition-all duration-200 dark:border-neutral-700 dark:bg-neutral-900 ${catDropdownHidden ? "invisible opacity-0" : "invisible opacity-0 group-hover/cat:visible group-hover/cat:opacity-100"}`}
            >
              {/* Triangle Arrow */}
              <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 border-t border-l border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900" />
              {/* Bridge to prevent gap */}
              <div className="absolute -top-3 left-0 h-4 w-full bg-transparent" />
              <div className="p-2">
                {isLoading ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-base text-gray-500">
                    <Loader2 className="animate-spin" size={16} /> Đang tải…
                  </div>
                ) : categories.filter((c: any) => c.productCount > 0).length ===
                  0 ? (
                  <div className="px-3 py-2 text-base text-gray-500">
                    Không có danh mục
                  </div>
                ) : (
                  categories
                    .filter((c: any) => c.productCount > 0)
                    .map((cat) => (
                      <Link
                        key={slugify(cat.name)}
                        href={`/products?category=${slugify(cat.name)}&page=1`}
                        onClick={() => setCatDropdownHidden(true)}
                        className="block rounded-md px-3 py-2 text-base text-gray-700 transition-all hover:bg-gray-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                      >
                        {cat.name}
                      </Link>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: Nav links & Search (hidden < lg for links) */}
        <div className="flex h-full flex-1 items-center gap-3 overflow-hidden">
          {/* Nav links */}
          <nav className="hidden h-full shrink-0 items-center gap-1 lg:flex">
            {[
              { href: "/", label: "Trang chủ" },
              { href: "/products", label: "Sản phẩm" },
              { href: "/store-info", label: "Cửa hàng" },
            ].map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative flex h-full items-center px-4 text-[16px] font-medium transition-all hover:bg-gray-50 hover:text-blue-600 active:bg-gray-200 dark:hover:bg-neutral-800 dark:hover:text-blue-400",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 transition-transform",
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Search */}
          <div className="flex w-full justify-center sm:min-w-0 sm:flex-1 sm:justify-start">
            <SearchCommand />
          </div>
        </div>

        {/* RIGHT: Cart & User menu */}
        <div className="flex items-center gap-2 sm:gap-4 lg:flex">
          <div
            className="group relative hidden lg:block"
            onMouseLeave={handleCartMouseLeave}
          >
            <Link
              href="/cart"
              onClick={() => setCartDropdownHidden(true)}
              className="relative flex w-[40px] flex-col items-center gap-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 sm:w-auto sm:min-w-[80px] sm:px-3 dark:text-gray-300 dark:hover:bg-neutral-800"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={20} />
              <span className="hidden text-center text-[16px] sm:block">
                Giỏ hàng
              </span>
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 px-1 py-0 text-[10px] font-semibold text-white">
                  {cartCount > 999 ? "999+" : cartCount}
                </Badge>
              )}
            </Link>
            {pathname !== "/cart" && (
              <CartDropdown
                isHidden={cartDropdownHidden}
                onItemClick={() => setCartDropdownHidden(true)}
              />
            )}
          </div>

          <Link
            href="/cart"
            className="relative flex w-[40px] flex-col items-center gap-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 sm:w-auto sm:min-w-[80px] sm:px-3 lg:hidden dark:text-gray-300 dark:hover:bg-neutral-800"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart size={20} />
            <span className="hidden text-center text-[16px] sm:block">
              Giỏ hàng
            </span>
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 px-1 py-0 text-[10px] font-semibold text-white">
                {cartCount > 999 ? "999+" : cartCount}
              </Badge>
            )}
          </Link>

          {/* Account dropdown - hover based */}
          <div
            className="group/acc relative hidden lg:block"
            onMouseLeave={handleAccMouseLeave}
          >
            <button
              className="flex w-[40px] cursor-pointer flex-col items-center gap-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 sm:w-auto sm:min-w-[80px] sm:px-3 dark:text-gray-300 dark:hover:bg-neutral-800"
              aria-label="Tài khoản"
            >
              {status === "loading" ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <User size={20} />
              )}
              <span className="hidden text-center text-[16px] sm:block">
                {status === "loading"
                  ? "Đang tải..."
                  : status === "authenticated"
                    ? session.user?.name?.split(" ").slice(-1).join(" ")
                    : "Tài khoản"}
              </span>
            </button>
            {/* Hover Dropdown */}
            <div
              className={`absolute top-[calc(100%+10px)] right-0 z-[60] w-52 origin-top-right rounded-lg border border-gray-200 bg-white shadow-[0_1px_10px_rgba(0,0,0,0.1)] transition-all duration-200 dark:border-neutral-700 dark:bg-neutral-900 ${accDropdownHidden ? "invisible opacity-0" : "invisible opacity-0 group-hover/acc:visible group-hover/acc:opacity-100"}`}
            >
              {/* Triangle Arrow */}
              <div className="absolute -top-2 right-6 h-4 w-4 rotate-45 border-t border-l border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-900" />
              {/* Bridge to prevent gap */}
              <div className="absolute -top-3 right-0 h-4 w-full bg-transparent" />
              <div className="p-2">
                {status === "loading" && (
                  <div className="flex items-center gap-2 px-3 py-2 text-base text-gray-500">
                    <Loader2 className="animate-spin" size={16} />
                    Đang tải...
                  </div>
                )}

                {status === "unauthenticated" && (
                  <>
                    <div className="mb-2 border-b border-gray-100 px-3 pb-2 text-base font-semibold text-gray-900 dark:border-neutral-700 dark:text-white">
                      Tài khoản
                    </div>
                    <Link
                      href="/auth/login"
                      onClick={() => setAccDropdownHidden(true)}
                      className="block rounded-md px-3 py-2 text-base text-gray-700 transition-all hover:bg-gray-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setAccDropdownHidden(true)}
                      className="block rounded-md px-3 py-2 text-base text-gray-700 transition-all hover:bg-gray-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                    >
                      Tạo tài khoản
                    </Link>
                  </>
                )}

                {status === "authenticated" && (
                  <>
                    <div className="mb-2 border-b border-gray-100 px-3 pb-2 text-base font-semibold text-gray-900 dark:border-neutral-700 dark:text-white">
                      {session.user?.name}
                    </div>

                    {isAdmin ? (
                      <Link
                        href="/admin/product-management"
                        onClick={() => setAccDropdownHidden(true)}
                        className="block rounded-md px-3 py-2 text-base text-gray-700 transition-all hover:bg-gray-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                      >
                        Quản lý sản phẩm
                      </Link>
                    ) : (
                      <Link
                        href="/profile"
                        onClick={() => setAccDropdownHidden(true)}
                        className="block rounded-md px-3 py-2 text-base text-gray-700 transition-all hover:bg-gray-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-neutral-800 dark:hover:text-blue-400"
                      >
                        Hồ sơ của tôi
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setAccDropdownHidden(true);
                        signOut({ callbackUrl: window.location.origin });
                        toast.success("Đăng xuất thành công");
                      }}
                      className="block w-full rounded-md px-3 py-2 text-left text-base text-red-600 transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Đăng xuất
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
