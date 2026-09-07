/**
 * @file CartContext.tsx
 * @description Centralized shopping cart state management with localStorage synchronization.
 */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity: number, size: string, color: string) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('yaperz-cart');
      if (savedCart) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('yaperz-cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [cartItems, isLoaded]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product: Product, quantity: number, size: string, color: string) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      return [...prevItems, { product, quantity, selectedSize: size, selectedColor: color }];
    });
    openCart();
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      )
    );
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart storage identifier constant
export const CART_STORAGE_KEY = 'yaperz-cart';

// Default maximum item quantity constraint per SKU
export const MAX_ITEM_QUANTITY = 10;

// Threshold for free shipping eligibility across India
export const FREE_SHIPPING_THRESHOLD = 2999;

/**
 * Helper to compute remaining amount required for free shipping eligibility.
 */
export function getAmountNeededForFreeShipping(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
}

/**
 * Returns whether a given subtotal qualifies for free shipping.
 */
export function isEligibleForFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

// Estimated standard flat shipping rate in INR
export const STANDARD_SHIPPING_FEE = 149;

/**
 * Computes estimated final order total including shipping rules.
 */
export function calculateOrderTotal(subtotal: number): number {
  const shipping = isEligibleForFreeShipping(subtotal) ? 0 : STANDARD_SHIPPING_FEE;
  return subtotal + shipping;
}
