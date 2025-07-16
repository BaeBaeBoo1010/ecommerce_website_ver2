"use client";

import { useState, useEffect, useRef } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const LS_KEY = "recent_searches";

export default function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const router = useRouter();

  type Timer = ReturnType<typeof setTimeout>;
  const debounceRef = useRef<Timer | null>(null);

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
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const { suggestions } = await res.json();
        setResults(suggestions);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400) as Timer;

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  /* Khi chọn gợi ý hoặc Enter */
  const handleSelect = (value: string) => {
    setOpen(false);
    const next = [value, ...recent.filter((v) => v !== value)].slice(0, 5);
    setRecent(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    router.push(`/products?search=${encodeURIComponent(value)}`);
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
        <span className="text-sm font-medium">Tìm kiếm</span>
        {/* Phím tắt: ẩn trên mobile, hiện ≥ sm */}
        <kbd className="text-muted-foreground pointer-events-none ml-2 hidden text-[10px] sm:inline">
          ⌘K
        </kbd>
      </Button>

      {/* Hộp thoại tìm kiếm */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="relative">
          <CommandInput
            placeholder="Tìm sản phẩm bạn cần"
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                e.preventDefault();
                handleSelect(query.trim());
              }
            }}
          />
          {loading && (
            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            </div>
          )}
        </div>

        <CommandList className="min-h-[250px]">
          {/* Chỉ hiện khi đã nhập mà không có kết quả */}
          {query && results.length === 0 && (
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
          )}

          {/* Gần đây */}
          {!query && recent.length > 0 && (
            <CommandGroup heading="Gần đây">
              {recent.map((s) => (
                <CommandItem key={s} value={s} onSelect={() => handleSelect(s)}>
                  <Clock className="mr-2 h-4 w-4" />
                  {s}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Kết quả realtime */}
          {results.length > 0 && (
            <CommandGroup heading="Kết quả">
              {results.map((r) => (
                <CommandItem key={r} value={r} onSelect={() => handleSelect(r)}>
                  <Search className="mr-2 h-4 w-4" />
                  {r}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
