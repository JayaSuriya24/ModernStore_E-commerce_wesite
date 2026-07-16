'use client';

import { useQuery } from '@tanstack/react-query';
import { ProductCard } from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/types';

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'related', categoryId, currentProductId],
    queryFn: () =>
      fetch(`/api/products?category=${categoryId}&limit=4&sort=newest`).then((r) => r.json()),
  });

  const products: Product[] = (data?.data || []).filter(
    (p: Product) => p.id !== currentProductId,
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
