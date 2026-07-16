'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order } from '@/types';

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Something went wrong');
  return json;
}

export function useOrders() {
  return useQuery<{ data: Order[] }>({
    queryKey: ['orders'],
    queryFn: () => fetcher('/api/orders'),
  });
}

export function useOrder(id: string) {
  return useQuery<{ data: Order }>({
    queryKey: ['order', id],
    queryFn: () => fetcher(`/api/orders/${id}`),
    enabled: !!id,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      shippingAddress: {
        name: string;
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        phone: string;
      };
      couponCode?: string;
    }) =>
      fetcher<{ data: { url?: string; orderId?: string; sessionId?: string }; message: string }>(
        '/api/checkout',
        { method: 'POST', body: JSON.stringify(data) },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
