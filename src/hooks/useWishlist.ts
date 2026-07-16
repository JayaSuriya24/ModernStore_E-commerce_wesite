'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '@/types';

interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt: Date;
}

export function useWishlist() {
  return useQuery<{ data: WishlistItem[] }>({
    queryKey: ['wishlist'],
    queryFn: () => fetch('/api/wishlist').then((r) => r.json()),
    retry: false,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
