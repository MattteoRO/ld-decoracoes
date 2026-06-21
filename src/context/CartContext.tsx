"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { Product } from "@/data/products";

export type CartItem = {
  product: Product;
  quantity: number;
  date?: string;
  selectedIncludes?: string[];
  customNotes?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, date?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isInCart: (productId: string) => boolean;
  updateCustomization: (productId: string, selectedIncludes: string[], customNotes: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("ld_cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error("Failed to parse cart from local storage", e);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("ld_cart", JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = useCallback((product: Product, date?: string) => {
    setCart(prev => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, date, selectedIncludes: product.includes, customNotes: "" }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setCart(prev => prev.map(item =>
      item.product.id === productId ? { ...item, quantity } : item
    ));
  }, []);

  const updateCustomization = useCallback((productId: string, selectedIncludes: string[], customNotes: string) => {
    setCart(prev => prev.map(item =>
      item.product.id === productId ? { ...item, selectedIncludes, customNotes } : item
    ));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isInCart = useCallback((productId: string) => {
    return cart.some(item => item.product.id === productId);
  }, [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isInCart, updateCustomization }}>
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
