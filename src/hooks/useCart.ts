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
    mutationFn: (data: { productId: string; quantity?: number }) =>
      fetcher<{ data: ApiCartItem; message: string }>('/api/cart', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      store.addItem({
        id: data.data.id,
        productId: data.data.productId,
        quantity: data.data.quantity,
        product: data.data.product,
      });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: (data: { itemId: string; quantity: number }) =>
      fetcher<{ data: ApiCartItem; message: string }>(`/api/cart/${data.itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: data.quantity }),
      }),
    onSuccess: (_data, variables) => {
      if (variables.quantity <= 0) {
        store.removeItem(variables.itemId);
      } else {
        store.updateItem(variables.itemId, variables.quantity);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) =>
      fetcher<{ message: string }>(`/api/cart/${itemId}`, { method: 'DELETE' }),
    onSuccess: (_data, itemId) => {
      store.removeItem(itemId);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const applyCoupon = useMutation({
    mutationFn: (data: { code: string; subtotal: number }) =>
      fetcher<{ data: { id: string; code: string; type: string; discount: number; discountAmount: number }; message: string }>('/api/coupons', {
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
