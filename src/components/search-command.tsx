"use client";

import useSWR from "swr";
import { useState, useEffect, useRef } from "react";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, Clock, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/product";

const LS_KEY = "recent_searches";

export default function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();
  const { data: allProducts } = useSWR("/api/products");
  const [hasSearched, setHasSearched] = useState(false);
  const [shortcutKey, setShortcutKey] = useState("⌘");

  type Timer = ReturnType<typeof setTimeout>;
  const debounceRef = useRef<Timer | null>(null);

  /* Hiển thị phím tắt ⌘ hoặc Ctrl */
  useEffect(() => {
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    setShortcutKey(isMac ? "⌘" : "Ctrl");
  }, []);

  /* Load lịch sử tìm kiếm một lần */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    setRecent(data);
  }, []);

  /* Phím tắt ⌘/Ctrl + K */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /* Debounce query */
  useEffect(() => {
    setHasSearched(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (!allProducts) return;

      setLoading(true);
      const keyword = query.trim().toLowerCase();

      const filtered = (allProducts as Product[])
        .filter((p) => {
          const keywordLower = keyword.toLowerCase();

          const nameMatch = p.name.toLowerCase().includes(keywordLower);
          const descMatch =
            p.description?.toLowerCase().includes(keywordLower) ?? false;
          const articleMatch = p.articleHtml
            ? p.articleHtml
                .replace(/<[^>]+>/g, "")
                .toLowerCase()
                .includes(keywordLower)
            : false;

          return nameMatch || descMatch || articleMatch;
        })
        .map((p) => ({ id: p._id, name: p.name }));

      setResults(filtered);
      setHasSearched(true);
      setLoading(false);
    }, 200) as Timer;

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, allProducts]);

  /* Khi chọn gợi ý hoặc Enter */
  const handleSelect = (item: { id: string; name: string }) => {
    setOpen(false);

    const isProductId = /^[a-f\d]{24}$/i.test(item.id);

    // Cập nhật lịch sử tìm kiếm
    const next = [item, ...recent.filter((v) => v.id !== item.id)].slice(0, 5);
    setRecent(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));

    if (isProductId) {
      router.push(`/products/${item.id}`);
    } else {
      router.push(`/products?search=${encodeURIComponent(item.name)}`);
    }
  };

  const handleSearchKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    setOpen(false);

    const entry = { id: trimmed, name: trimmed };
    const next = [entry, ...recent.filter((v) => v.id !== trimmed)].slice(0, 5);
    setRecent(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));

    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      {/* Nút mở hộp thoại – hiển thị cả icon & label trên mọi kích cỡ */}
      <Button
        variant="outline"
        aria-label="Tìm kiếm"
        className="flex h-10 items-center gap-2 rounded-md px-3 py-2 hover:bg-gray-100 active:bg-gray-200"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="hidden sm:flex text-sm font-medium">Tìm kiếm</span>
        {/* Phím tắt: ẩn trên mobile, hiện ≥ sm */}
        <kbd
          className={`text-muted-foreground pointer-events-none ml-6 hidden sm:flex sm:items-center sm:gap-[2px] sm:rounded-sm sm:border sm:bg-gray-100 sm:px-1 sm:py-0 ${shortcutKey === "Ctrl" ? "text-sm" : "text-lg"}`}
        >
          <span
            className={`font-medium ${shortcutKey === "Ctrl" ? "text-xs" : "text-[18px]"}`}
          >
            {shortcutKey}
          </span>
          <span
            className={` ${shortcutKey === "Ctrl" ? "text-xs" : "text-[14px]"}`}
          >
            K
          </span>
        </kbd>
      </Button>

      {/* Hộp thoại tìm kiếm */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        showCloseButton={false}
        className="rounded-xl border bg-white shadow-xl"
      >
        <div className="relative w-full">
          <CommandInput
            placeholder="Tìm sản phẩm bạn cần"
            value={query}
            onValueChange={(value) => {
              if (value.length <= 50) {
                setQuery(value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                e.preventDefault();

                if (loading) return;

                if (results.length === 1) {
                  handleSelect(results[0]);
                } else {
                  handleSearchKeyword(query.trim());
                }
              }
            }}
          />

          {query.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <CommandList className="relative min-h-[280px] overflow-y-auto">
          {/* Chỉ hiện khi đã nhập mà không có kết quả */}
          {!query && recent.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-10 text-center">
              <Search className="mb-2 h-8 w-8" />
              <p className="text-sm">Nhập từ khóa để bắt đầu tìm kiếm</p>
            </div>
          )}

          {/* Gần đây */}
          {!query && recent.length > 0 && (
            <CommandGroup heading="Gần đây">
              {recent.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  className="flex items-center justify-between pr-1"
                  onSelect={() => handleSelect(item)}
                >
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    {item.name}
                  </div>

                  {/* Nút xóa riêng */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground h-6 w-6 hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation(); // tránh trigger chọn item
                      const updated = recent.filter((v) => v.id !== item.id);
                      setRecent(updated);
                      localStorage.setItem(LS_KEY, JSON.stringify(updated));
                    }}
                    title="Xóa mục này"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Kết quả realtime */}
          {results.length > 0 && (
            <CommandGroup heading="Kết quả">
              {results.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name + query}
                  onSelect={() => handleSelect(item)}
                  className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {loading && (
            <div className="flex justify-center py-6">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          )}

          {/* Không có kết quả */}
          {!loading && hasSearched && results.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-10 text-center">
              <Search className="mb-2 h-8 w-8" />
              <p className="text-sm">Không có kết quả phù hợp</p>
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
