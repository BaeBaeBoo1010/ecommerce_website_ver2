"use client";

import useSWR from "swr";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import Fuse from "fuse.js";

const LS_KEY = "recent_searches";

function removeVietnameseTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export default function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { id: string; name: string; slug?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<
    { id: string; name: string; slug?: string }[]
  >([]);
  const router = useRouter();
  const { data: allProducts } = useSWR("/api/products");
  const [shortcutKey, setShortcutKey] = useState("⌘");

  const searchCacheRef = useRef<
    Map<string, { id: string; name: string; slug?: string }[]>
  >(new Map());

  type Timer = ReturnType<typeof setTimeout>;
  const debounceRef = useRef<Timer | null>(null);

  const fuse = useMemo(() => {
    if (!allProducts) return null;

    const normalized = (allProducts as Product[]).map((p) => ({
      ...p,
      nameNoTone: removeVietnameseTones(p.name),
      descriptionNoTone: p.description
        ? removeVietnameseTones(p.description)
        : "",
      articleNoTone: p.articleHtml
        ? removeVietnameseTones(p.articleHtml.replace(/<[^>]+>/g, ""))
        : "",
    }));

    return new Fuse(normalized, {
      keys: ["nameNoTone", "descriptionNoTone", "articleNoTone"],
      threshold: 0.35,
      includeScore: true,
    });
  }, [allProducts]);

  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    setShortcutKey(isMac ? "⌘" : "Ctrl");
  }, []);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    setRecent(data);
  }, []);

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

  useEffect(() => {
    setHasSearched(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      if (!allProducts || !fuse) return;

      setLoading(true);

      const keywordLower = removeVietnameseTones(query.trim().toLowerCase());

      if (searchCacheRef.current.has(keywordLower)) {
        setResults(searchCacheRef.current.get(keywordLower) || []);
        setHasSearched(true);
        setLoading(false);
        return;
      }

      const result = fuse.search(keywordLower);
      const filtered = result.map((r) => ({
        id: r.item._id,
        name: r.item.name,
        slug: r.item.slug,
      }));

      if (searchCacheRef.current.size > 20) {
        const iterator = searchCacheRef.current.keys();
        const firstKey = iterator.next().value;
        if (firstKey !== undefined) {
          searchCacheRef.current.delete(firstKey);
        }
      }
      searchCacheRef.current.set(keywordLower, filtered);

      setResults(filtered);
      setHasSearched(true);
      setLoading(false);
    }, 200) as Timer;

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, allProducts, fuse]);

  const handleSelect = useCallback(
    (item: { id: string; name: string; slug?: string }) => {
      setOpen(false);

      const next = [item, ...recent.filter((v) => v.id !== item.id)].slice(
        0,
        5,
      );
      setRecent(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));

      if (item.slug) {
        router.push(`/products/${item.slug}`);
        return;
      }

      const keyword = removeVietnameseTones(item.name.trim().toLowerCase());

      if (!allProducts || !fuse) {
        router.push(`/products?search=${encodeURIComponent(keyword)}`);
        return;
      }

      const result = fuse.search(keyword);
      const filtered = result.map((r) => r.item);

      if (filtered.length === 1 && filtered[0].slug) {
        const product = filtered[0];
        const updated = [
          { id: product._id, name: product.name, slug: product.slug },
          ...recent.filter((v) => v.id !== product._id),
        ].slice(0, 5);

        setRecent(updated);
        localStorage.setItem(LS_KEY, JSON.stringify(updated));

        router.push(`/products/${product.slug}`);
      } else {
        router.push(`/products?search=${encodeURIComponent(keyword)}`);
      }
    },
    [recent, allProducts, fuse, router],
  );

  const handleSearchKeyword = useCallback(
    async (keyword: string) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;

      setLoading(true);
      setHasSearched(false);

      const entry = { id: trimmed, name: trimmed };
      const next = [entry, ...recent.filter((v) => v.id !== trimmed)].slice(
        0,
        5,
      );
      setRecent(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));

      if (!allProducts || !fuse) {
        setLoading(false);
        router.push(`/products?search=${encodeURIComponent(trimmed)}`);
        return;
      }

      const keywordLower = removeVietnameseTones(trimmed.toLowerCase());

      const results = fuse.search(keywordLower);
      const filtered = results.map((r) => r.item);

      setLoading(false);
      setHasSearched(true);
      setOpen(false);

      if (filtered.length === 1 && filtered[0].slug) {
        const product = filtered[0];
        const updated = [
          { id: product._id, name: product.name, slug: product.slug },
          ...recent.filter((v) => v.id !== product._id),
        ].slice(0, 5);
        setRecent(updated);
        localStorage.setItem(LS_KEY, JSON.stringify(updated));

        router.push(`/products/${product.slug}`);
      } else {
        router.push(`/products?search=${encodeURIComponent(trimmed)}`);
      }
    },
    [recent, allProducts, fuse, router],
  );

  return (
    <>
      <Button
        variant="outline"
        aria-label="Tìm kiếm"
        className="flex h-10 items-center gap-2 rounded-md bg-transparent px-3 py-2 hover:bg-gray-100 active:bg-gray-200"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5" />
        <span className="hidden text-sm font-medium sm:flex">Tìm kiếm</span>
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
            disabled={loading}
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
          {!query && recent.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-10 text-center">
              <Search className="mb-2 h-8 w-8" />
              <p className="text-sm">Nhập từ khóa để bắt đầu tìm kiếm</p>
            </div>
          )}

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

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground h-6 w-6 hover:bg-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
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
