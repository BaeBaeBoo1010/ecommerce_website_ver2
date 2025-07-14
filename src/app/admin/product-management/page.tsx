"use client";

import { useEffect, useState } from "react";
import { Settings, Loader2 } from "lucide-react";
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

/* ─── Type ─── */
interface Product {
  _id: string;
  name: string;
  productCode: string;
  description: string;
  price: number;
  imageUrl: string;
  category: { _id: string; name: string; slug: string };
}
interface Category {
  _id: string;
  name: string;
  slug: string;
}

/* Map code ➜ VN message */
const MSG: Record<string, string> = {
  NOT_FOUND: "Không tìm thấy mục yêu cầu",
  CATEGORY_IN_USE: "Không thể xoá, đang có sản phẩm sử dụng danh mục này",
  DELETE_FAILED: "Xoá thất bại",
};

/* ─── Component ─── */
export default function ProductManagementPage() {
  /* state */
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Product | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  /* fetch data once */
  useEffect(() => {
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);
        const pJson = await pRes.json();
        const cJson = await cRes.json();
        setProducts(pJson);
        setCategories(cJson.categories);
      } catch {
        toast.error("Lỗi tải dữ liệu, thử lại sau.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* sort helper */
  const handleSort = (field: keyof Product) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  /* view list */
  const viewProducts = [...products]
    .filter(
      (p) => selectedCategory === "all" || p.category._id === selectedCategory,
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

  /* delete category */
  const handleDeleteCategory = async () => {
    if (selectedCategory === "all")
      return toast("Chọn một danh mục cụ thể để xoá");

    const sel = categories.find((c) => c._id === selectedCategory);
    if (!window.confirm(`Xoá danh mục “${sel?.name}” ?`)) return;

    try {
      const res = await fetch(`/api/categories/${selectedCategory}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(MSG[data.code] ?? "Không thể xoá danh mục");
        return;
      }

      setCategories((prev) => prev.filter((c) => c._id !== selectedCategory));
      setSelectedCategory("all");
      toast.success("Đã xoá danh mục");
    } catch {
      toast.error("Lỗi hệ thống khi xoá danh mục");
    }
  };

  /* delete product */
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá sản phẩm này?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(MSG[data.code] ?? "Xoá sản phẩm thất bại");
        return;
      }

      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Đã xoá sản phẩm");
    } catch {
      toast.error("Lỗi hệ thống khi xoá sản phẩm");
    }
  };

  /* ─── UI ─── */
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4">
      <Card className="border-none shadow-none">
        <CardHeader className="p-0">
          <CardTitle className="text-3xl font-bold">Quản lý sản phẩm</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {/* filter row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-56 cursor-pointer">
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

              <Button variant="destructive" onClick={handleDeleteCategory}>
                Xoá danh mục
              </Button>

              <Link href="/admin/add-product">
                <Button variant="outline" className="rounded-xl px-6">
                  ➕ Thêm sản phẩm
                </Button>
              </Link>
            </div>

            <Input
              placeholder="🔍 Tìm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>

          {/* table */}
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Đang tải...
            </div>
          ) : viewProducts.length === 0 ? (
            <p className="text-muted-foreground">Không tìm thấy sản phẩm.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Ảnh</TableHead>
                    <TableHead
                      onClick={() => handleSort("name")}
                      className="cursor-pointer"
                    >
                      Tên{" "}
                      {sortField === "name" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead
                      onClick={() => handleSort("productCode")}
                      className="cursor-pointer"
                    >
                      Mã{" "}
                      {sortField === "productCode" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead
                      onClick={() => handleSort("price")}
                      className="cursor-pointer"
                    >
                      Giá{" "}
                      {sortField === "price" &&
                        (sortOrder === "asc" ? "▲" : "▼")}
                    </TableHead>
                    <TableHead className="text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewProducts.map((p) => (
                    <TableRow
                      key={p._id}
                      className="hover:bg-muted transition-colors"
                    >
                      <TableCell>
                        <div className="relative h-20 w-20">
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            unoptimized
                            className="rounded-md object-contain"
                          />
                        </div>
                      </TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.productCode}</TableCell>
                      <TableCell>
                        <div className="font-medium">{p.category?.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {p.category?.slug}
                        </div>
                      </TableCell>
                      <TableCell>{p.price.toLocaleString()} đ</TableCell>
                      <TableCell className="w-32">
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(p._id)}
                          >
                            Xoá
                          </Button>
                          <Link href={`/admin/edit-product/${p._id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full bg-green-100 border-2 border-green-600 hover:bg-green-200"
                            >
                              <Settings /> Sửa
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
