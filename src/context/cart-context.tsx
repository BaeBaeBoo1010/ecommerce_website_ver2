"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { Product } from "@/types/product";
import { toast } from "sonner";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  refreshCartData: (latestProducts: Product[]) => void;
  totalItems: number;
  totalPrice: number;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LS_KEY = "shopping_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LS_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id,
      );
      if (existingIndex >= 0) {
        // Update quantity if already exists
        const newItems = [...prev];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      } else {
        // Add new item
        return [...prev, { product, quantity }];
      }
    });
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const refreshCartData = useCallback((latestProducts: Product[]) => {
    setItems((prev) => {
      // Return same array if nothing changed to avoid rerenders
      let hasChanges = false;
      const next = prev.map((item) => {
        const fresh = latestProducts.find((p) => p.id === item.product.id);
        if (fresh) {
          // Check deep equality or just price/name/image?
          // Simple check: price or name diff
          if (
            fresh.price !== item.product.price ||
            fresh.name !== item.product.name ||
            fresh.slug !== item.product.slug
          ) {
            hasChanges = true;
            return { ...item, product: fresh };
          }
        }
        return item;
      });
      return hasChanges ? next : prev;
    });
  }, []);

  const totalItems = useMemo(() => items.length, [items]);

  const totalPrice = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCartData,
        totalItems,
        totalPrice,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
