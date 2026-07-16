'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
}

export interface CartStoreItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
}

interface CartStore {
  items: CartStoreItem[];
  couponCode: string | null;
  discountAmount: number;
  setItems: (items: CartStoreItem[]) => void;
  addItem: (item: CartStoreItem) => void;
  updateItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setCoupon: (code: string | null, discount: number) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      discountAmount: 0,

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(i.quantity + item.quantity, item.product.stock) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      updateItem: (itemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== itemId) };
          }
          return {
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, quantity: Math.min(quantity, i.product.stock) } : i,
            ),
          };
        }),

      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),

      clearCart: () => set({ items: [], couponCode: null, discountAmount: 0 }),

      setCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),

      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        return Math.max(0, subtotal - get().discountAmount);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'modernstore-cart',
    },
  ),
);
