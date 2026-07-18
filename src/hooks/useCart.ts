'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/store/cart';
import { useSession } from '@/hooks/useAuth';
import { useEffect } from 'react';

interface ApiCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
  };
}

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Something went wrong');
  return json;
}

export interface CartProductData {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
}

export function useCart() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.data;
  const store = useCartStore();
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: () => fetcher<{ data: ApiCartItem[] }>('/api/cart'),
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (cartQuery.data) {
      store.setItems(
        cartQuery.data.data.map((item) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: item.product,
        })),
      );
    }
  }, [cartQuery.data]);

  const addToCart = useMutation({
    mutationFn: async (data: {
      productId: string;
      quantity?: number;
      product?: CartProductData;
    }) => {
      if (!isLoggedIn) {
        if (!data.product) throw new Error('Product data required for guest cart');
        return {
          data: {
            id: `local-${data.productId}-${Date.now()}`,
            productId: data.productId,
            quantity: data.quantity || 1,
            product: data.product,
          },
          message: 'Added to cart',
        };
      }
      return fetcher<{ data: ApiCartItem; message: string }>('/api/cart', {
        method: 'POST',
        body: JSON.stringify({
          productId: data.productId,
          quantity: data.quantity,
        }),
      });
    },
    onSuccess: (result) => {
      store.addItem({
        id: result.data.id,
        productId: result.data.productId,
        quantity: result.data.quantity,
        product: result.data.product,
      });
      if (isLoggedIn) {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    },
  });

  const updateQuantity = useMutation({
    mutationFn: (data: { itemId: string; quantity: number }) => {
      if (!isLoggedIn) {
        if (data.quantity <= 0) {
          store.removeItem(data.itemId);
        } else {
          store.updateItem(data.itemId, data.quantity);
        }
        return Promise.resolve({ message: 'Updated' });
      }
      return fetcher<{ data: ApiCartItem; message: string }>(`/api/cart/${data.itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: data.quantity }),
      });
    },
    onSuccess: (_data, variables) => {
      if (!isLoggedIn) return;
      if (variables.quantity <= 0) {
        store.removeItem(variables.itemId);
      } else {
        store.updateItem(variables.itemId, variables.quantity);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => {
      if (!isLoggedIn) {
        store.removeItem(itemId);
        return Promise.resolve({ message: 'Removed' });
      }
      return fetcher<{ message: string }>(`/api/cart/${itemId}`, { method: 'DELETE' });
    },
    onSuccess: (_data, itemId) => {
      if (!isLoggedIn) return;
      store.removeItem(itemId);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const applyCoupon = useMutation({
    mutationFn: (data: { code: string; subtotal: number }) =>
      fetcher<{
        data: {
          id: string;
          code: string;
          type: string;
          discount: number;
          discountAmount: number;
        };
        message: string;
      }>('/api/coupons', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      store.setCoupon(data.data.code, data.data.discountAmount);
    },
  });

  return {
    items: store.items,
    couponCode: store.couponCode,
    discountAmount: store.discountAmount,
    subtotal: store.getSubtotal(),
    total: store.getTotal(),
    itemCount: store.getItemCount(),
    isLoading: cartQuery.isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon: store.removeCoupon,
    clearCart: store.clearCart,
    isSignedIn: isLoggedIn,
  };
}
