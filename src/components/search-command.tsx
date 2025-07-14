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
import { Search, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";


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

  /* load recent once */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    setRecent(data);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  /* debounce search */
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
  }, [query]);

  const handleSelect = (value: string) => {
    setOpen(false);
    const next = [value, ...recent.filter((v) => v !== value)].slice(0, 5);
    setRecent(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next));
    router.push(`/products?search=${encodeURIComponent(value)}`);
  };

  return (
    <>
      {/* search button */}
      <Button
        variant="outline"
        size="sm"
        className="gap-2 rounded-full px-3"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Tìm kiếm</span>
        <kbd className="pointer-events-none ml-2 hidden text-[10px] sm:inline">
          ⌘K
        </kbd>
      </Button>

      {/* command dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="relative">
          <CommandInput
            placeholder="Tìm sản phẩm, thương hiệu, danh mục..."
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                e.preventDefault(); // ngăn submit mặc định
                handleSelect(query.trim());
              }
            }}
          />

          {loading && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            </div>
          )}
        </div>

        <CommandList className="min-h-[250px]">
          <CommandEmpty>Không tìm thấy.</CommandEmpty>

          {/* recent */}
          {!query && recent.length > 0 && (
            <CommandGroup heading="Gần đây">
              {recent.map((s) => (
                <CommandItem key={s} value={s} onSelect={() => handleSelect(s)}>
                  <Clock className="mr-2 h-4 w-4" /> {s}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* realtime results */}
          {results.length > 0 && (
            <CommandGroup heading="Kết quả">
              {results.map((r) => (
                <CommandItem key={r} value={r} onSelect={() => handleSelect(r)}>
                  <Search className="mr-2 h-4 w-4" /> {r}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
