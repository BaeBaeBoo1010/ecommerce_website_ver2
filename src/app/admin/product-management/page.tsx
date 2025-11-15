"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import useSWR, { mutate, useSWRConfig } from "swr";
import { Settings, Loader2, Search, Trash2, Plus, Package } from "lucide-react";
import type { Product, Category } from "@/types/product";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/* Map code ➜ VN message */
const MSG: Record<string, string> = {
  NOT_FOUND: "Không tìm thấy mục yêu cầu",
  CATEGORY_IN_USE: "Không thể xoá, đang có sản phẩm sử dụng danh mục này",
  DELETE_FAILED: "Xoá thất bại",
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProductManagementPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { fallback } = useSWRConfig();

  /* swr */
  const {
    data: products = [],
    mutate: mutateProducts,
    isLoading,
  } = useSWR<Product[]>("/api/products", fetcher, {
    fallbackData: fallback["/api/products"],
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const { data: categories = [] } = useSWR<Category[]>(
    "/api/categories",
    fetcher,
    {
      fallbackData: fallback["/api/categories"],
      revalidateOnMount: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  /* UI state */
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* pagination state */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  /* reset page khi filter/search/sort thay đổi */
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, search, sortField, sortOrder]);

  useEffect(() => {
    if (containerRef.current) {
      const top =
        containerRef.current.getBoundingClientRect().top + window.scrollY - 106; // offset 26px
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }
  }, [currentPage]);

  /* sort helper */
  const handleSort = (field: keyof Product) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  /* view list */
  const viewProducts = useMemo(() => {
    return [...products]
      .filter(
        (p) =>
          selectedCategory === "all" || p.category._id === selectedCategory,
      )
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (!sortField) return 0;
        const A = a[sortField] as string | number;
        const B = b[sortField] as string | number;
        return typeof A === "number"
          ? sortOrder === "asc"
            ? A - (B as number)
            : (B as number) - A
          : sortOrder === "asc"
            ? (A as string).localeCompare(B as string)
            : (B as string).localeCompare(A as string);
      });
  }, [products, selectedCategory, search, sortField, sortOrder]);

  /* pagination */
  const totalItems = viewProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return viewProducts.slice(start, start + itemsPerPage);
  }, [viewProducts, currentPage, itemsPerPage]);

  /* delete category */
  const handleDeleteCategory = async () => {
    if (selectedCategory === "all")
      return toast("Chọn một danh mục cụ thể để xoá");

    const sel = categories.find((c) => c._id === selectedCategory);
    if (!sel) return;

    // --- KIỂM TRA CATEGORY IN USE TRÊN CLIENT ---
    const inUse = products.some((p) => p.category._id === selectedCategory);
    if (inUse) {
      toast.error(MSG["CATEGORY_IN_USE"]);
      return;
    }

    if (!window.confirm(`Xoá danh mục "${sel?.name}" ?`)) return;

    try {
      const res = await fetch(`/api/categories/${selectedCategory}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(MSG[data.code] ?? "Không thể xoá danh mục");
        return;
      }

      toast.success("Đã xoá danh mục");
      // --- reload products và categories ---
      mutateProducts(); // refresh danh sách sản phẩm
      mutate("/api/categories"); // refresh danh sách category
      setSelectedCategory("all"); // reset filter về all
    } catch {
      toast.error("Lỗi hệ thống khi xoá danh mục");
    }
  };

  /* delete product */
  const handleDeleteProduct = async (slug: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá sản phẩm này?")) return;

    setDeletingId(slug);

    try {
      const res = await fetch(`/api/products/${slug}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(MSG[data.code] ?? "Xoá sản phẩm thất bại");
        return;
      }

      toast.success("Đã xoá sản phẩm");
      mutateProducts(
        products.filter((p) => p.slug !== slug),
        false,
      );
      mutate("/api/products");
    } catch {
      toast.error("Lỗi hệ thống khi xoá sản phẩm");
    } finally {
      setDeletingId(null);
    }
  };

  /* ─── UI ─── */
  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br p-2 sm:p-4 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-xl p-3">
              <Package className="text-primary h-8 w-8" />
            </div>
            <div>
              <h1 className="text-foreground text-4xl font-bold tracking-tight">
                Quản lý sản phẩm
              </h1>
              <p className="text-muted-foreground mt-1">
                Quản lý và theo dõi tất cả sản phẩm của bạn
              </p>
            </div>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="border-border/50 bg-card/50">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-semibold">
                  Danh sách sản phẩm
                </CardTitle>
                <Badge variant="secondary" className="text-sm font-medium">
                  {totalItems} sản phẩm
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div
              ref={containerRef}
              className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="border-border/50 bg-background/50 hover:bg-accent w-full transition-colors sm:w-64">
                    <SelectValue placeholder="-- Tất cả danh mục --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">-- Tất cả danh mục --</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="destructive"
                  onClick={handleDeleteCategory}
                  className="gap-2 shadow-sm transition-all hover:shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  Xoá danh mục
                </Button>

                <Link href="/admin/add-product">
                  <Button className="gap-2 bg-green-600 shadow-sm transition-all hover:bg-green-400 hover:shadow-lg">
                    <Plus className="h-4 w-4" />
                    Thêm sản phẩm
                  </Button>
                </Link>
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-border/50 bg-background/50 focus:bg-background pl-10 transition-colors"
                />
              </div>
            </div>

            {/* table */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <Loader2 className="text-primary h-10 w-10 animate-spin" />
                <p className="text-muted-foreground text-sm">
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-20">
                <div className="bg-muted rounded-full p-6">
                  <Package className="text-muted-foreground h-12 w-12" />
                </div>
                <div className="text-center">
                  <p className="text-foreground text-lg font-medium">
                    Không tìm thấy sản phẩm
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Thử thay đổi bộ lọc hoặc tìm kiếm sản phẩm khác
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-border/50 overflow-hidden rounded-xl border shadow-sm">
                <div className="overflow-x-auto">
                  <Table className="w-full table-fixed">
                    <TableHeader className="select-none">
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-16 font-semibold">
                          Ảnh
                        </TableHead>

                        {/* Tên sản phẩm rộng hơn và wrap text */}
                        <TableHead
                          onClick={() => handleSort("name")}
                          className="hover:text-primary w-80 cursor-pointer font-semibold transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Tên sản phẩm
                            {sortField === "name" && (
                              <span className="text-primary">
                                {sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </TableHead>

                        <TableHead
                          onClick={() => handleSort("productCode")}
                          className="hover:text-primary w-24 cursor-pointer font-semibold transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            Mã SP
                            {sortField === "productCode" && (
                              <span className="text-primary">
                                {sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </TableHead>

                        <TableHead className="w-32 font-semibold">
                          Danh mục
                        </TableHead>

                        <TableHead
                          onClick={() => handleSort("price")}
                          className="hover:text-primary w-24 cursor-pointer font-semibold transition-colors"
                        >
                          Giá bán
                        </TableHead>

                        <TableHead className="w-36 text-center font-semibold">
                          Hành động
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {paginatedProducts.map((p) => (
                        <TableRow
                          key={p._id}
                          className="group hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="w-16">
                            <div className="border-border/50 bg-muted/30 relative h-16 w-16 overflow-hidden rounded-lg border shadow-sm transition-all group-hover:shadow-md">
                              <Image
                                src={p.imageUrls[0] || "/images/placeholder.svg"}
                                alt={p.name}
                                fill
                                unoptimized
                                sizes="64px"
                                className="object-cover transition-transform group-hover:scale-110"
                                loading="lazy"
                              />
                            </div>
                          </TableCell>

                          <TableCell className="w-80 break-words whitespace-normal">
                            {p.name}
                          </TableCell>

                          <TableCell className="w-24">
                            <Badge
                              variant="outline"
                              className="truncate font-mono text-xs"
                            >
                              {p.productCode}
                            </Badge>
                          </TableCell>

                          <TableCell className="w-32 break-words whitespace-normal">
                            <div className="text-sm font-medium">
                              {p.category?.name}
                            </div>
                          </TableCell>

                          <TableCell className="w-24">
                            <span className="text-primary font-semibold">
                              {p.price.toLocaleString()} đ
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Link href={`/admin/edit-product/${p.slug}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 gap-1.5 transition-all hover:shadow-sm"
                                >
                                  <Settings className="h-3.5 w-3.5" />
                                  Sửa
                                </Button>
                              </Link>

                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={deletingId === p._id}
                                onClick={() => handleDeleteProduct(p.slug)}
                                className="gap-1.5 shadow-sm transition-all hover:shadow-md"
                              >
                                {deletingId === p._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                                Xoá
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-between">
                <p className="text-muted-foreground text-sm">
                  Trang {currentPage} / {totalPages} • Hiển thị{" "}
                  {paginatedProducts.length} / {totalItems} sản phẩm
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="gap-1 transition-all hover:shadow-sm disabled:opacity-50"
                  >
                    ← Trước
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-9 w-9 p-0 transition-all hover:shadow-sm"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="gap-1 transition-all hover:shadow-sm disabled:opacity-50"
                  >
                    Sau →
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
