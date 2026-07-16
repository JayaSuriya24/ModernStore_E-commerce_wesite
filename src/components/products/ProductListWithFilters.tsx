'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductFilters } from '@/components/products/ProductFilters';
import { Pagination } from '@/components/ui/Pagination';
import { useRouter } from 'next/navigation';

function ProductList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filters = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 12,
  };

  const { data, isLoading } = useProducts(filters);
  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <ProductFilters totalProducts={pagination?.total || 0} />
      <ProductGrid products={products} isLoading={isLoading} />
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(page));
            router.push(`/products?${params.toString()}`);
          }}
        />
      )}
    </div>
  );
}

export function ProductListWithFilters() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-20 animate-pulse rounded-lg bg-muted" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square animate-pulse rounded-xl bg-muted" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-5 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <ProductList />
    </Suspense>
  );
}
