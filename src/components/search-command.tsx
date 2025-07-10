"use client";

import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Search, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchCommand() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const recentSearches = [
    "Wireless headphones",
    "Smart watch",
    "Laptop stand",
    "Phone charger",
  ];

  const trendingSearches = [
    "iPhone 15",
    "MacBook Pro",
    "AirPods Pro",
    "iPad Air",
    "Apple Watch",
  ];

  const handleSelect = (value: string) => {
    setOpen(false);
    router.push(`/products?search=${encodeURIComponent(value)}`);
  };

  return (
    <>
      <Button
        variant="outline"
        className="text-muted-foreground relative w-11 cursor-pointer justify-start rounded-3xl text-sm active:bg-gray-300 sm:w-full sm:rounded-xl"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <div className="hidden sm:flex">Tìm kiếm</div>
        <kbd className="bg-muted pointer-events-none absolute top-1.5 right-1.5 hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search products, brands, categories..." />
        <CommandList className="min-h-[300px]">
          <CommandEmpty>No results found.</CommandEmpty>

          {recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search) => (
                <CommandItem key={search} onSelect={() => handleSelect(search)}>
                  <Clock className="mr-2 h-4 w-4" />
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Trending">
            {trendingSearches.map((search) => (
              <CommandItem key={search} onSelect={() => handleSelect(search)}>
                <TrendingUp className="mr-2 h-4 w-4" />
                {search}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandGroup heading="Categories">
            <CommandItem onSelect={() => handleSelect("electronics")}>
              <Search className="mr-2 h-4 w-4" />
              Electronics
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("fashion")}>
              <Search className="mr-2 h-4 w-4" />
              Fashion
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("home")}>
              <Search className="mr-2 h-4 w-4" />
              Home & Garden
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
