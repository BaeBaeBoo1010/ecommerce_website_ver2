"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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

const LS_KEY = "recent_searches";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price?: number;
  imageUrls?: string[];
  category?: { id: string; name: string; slug: string } | null;
}

export default function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<
    { id: string; name: string; slug?: string }[]
  >([]);
  const router = useRouter();
  const [shortcutKey, setShortcutKey] = useState("⌘");
  const [hasSearched, setHasSearched] = useState(false);

  type Timer = ReturnType<typeof setTimeout>;
  const debounceRef = useRef<Timer | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Server-side search with debouncing
  useEffect(() => {
    setHasSearched(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&limit=10`,
          { signal: abortControllerRef.current.signal },
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
        setHasSearched(true);
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Search error:", error);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300) as Timer;

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

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
      } else {
        // Save search results to sessionStorage before navigating
        sessionStorage.setItem(
          "search_cache",
          JSON.stringify({
            query: item.name.trim(),
            results,
            timestamp: Date.now(),
          }),
        );
        router.push(`/products?search=${encodeURIComponent(item.name.trim())}`);
      }
    },
    [recent, router, results],
  );

  const handleSearchKeyword = useCallback(
    (keyword: string, searchResults: SearchResult[] = []) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;

      // Save to recent searches
      const entry = { id: trimmed, name: trimmed };
      const next = [entry, ...recent.filter((v) => v.id !== trimmed)].slice(
        0,
        5,
      );
      setRecent(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));

      // Save search results to sessionStorage before navigating
      sessionStorage.setItem(
        "search_cache",
        JSON.stringify({
          query: trimmed,
          results: searchResults,
          timestamp: Date.now(),
        }),
      );

      // Close dialog and navigate
      setOpen(false);
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    },
    [recent, router],
  );

  return (
    <>
      <Button
        variant="outline"
        aria-label="Tìm kiếm"
        className="text-muted-foreground flex h-10 w-full items-center justify-start gap-2 rounded-full bg-gray-100/50 px-4 py-2 hover:bg-gray-100 active:bg-gray-200 sm:w-auto sm:rounded-md sm:bg-transparent sm:px-3"
        onClick={() => setOpen(true)}
      >
        <Search className="h-5 w-5 shrink-0" />
        <span className="truncate text-[15px] font-medium sm:hidden">
          Tìm kiếm
        </span>
        <span className="hidden truncate text-[15px] font-medium sm:inline">
          Bạn muốn mua gì?
        </span>
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
        shouldFilter={false}
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
                e.stopPropagation();

                // Wait until search is complete before allowing Enter
                if (loading || !hasSearched) return;

                // Close dialog immediately
                setOpen(false);

                if (results.length === 1) {
                  handleSelect(results[0]);
                } else if (results.length > 0) {
                  // Has results - save to cache and go to search page
                  sessionStorage.setItem(
                    "search_cache",
                    JSON.stringify({
                      query: query.trim(),
                      results,
                      timestamp: Date.now(),
                    }),
                  );
                  router.push(
                    `/products?search=${encodeURIComponent(query.trim())}`,
                  );
                } else {
                  // No results - save empty to cache and navigate
                  handleSearchKeyword(query.trim(), results);
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
          {/* Empty state - no query and no history */}
          {!query && recent.length === 0 && (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-10 text-center">
              <Search className="mb-2 h-8 w-8" />
              <p className="text-sm">Nhập từ khóa để bắt đầu tìm kiếm</p>
            </div>
          )}

          {/* Recent searches - only when no query */}
          {!query && !loading && recent.length > 0 && (
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

          {/* Search results - only when has query and results */}
          {query && !loading && results.length > 0 && (
            <CommandGroup heading="Kết quả">
              {results.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
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
