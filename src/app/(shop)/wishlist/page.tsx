'use client';

import { useWishlist } from '@/hooks/useWishlist';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';

export default function WishlistPage() {
  const { data, isLoading } = useWishlist();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-10 w-48" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const products: Product[] = data?.data?.map((item) => item.product) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">My Wishlist</h1>
      <p className="mb-8 text-muted-foreground">
        {products.length} {products.length === 1 ? 'item' : 'items'} saved
      </p>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold">Your wishlist is empty</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Save your favorite items for later
          </p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
